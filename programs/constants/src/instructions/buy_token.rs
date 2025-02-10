use anchor_lang::{prelude::*, system_program};

use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use solana_program::clock::Clock;

use solana_program::account_info::AccountInfo;

use crate::errors::PresaleError;
use crate::state::{PresaleInfo, UserInfo};

#[derive(Accounts)]
pub struct BuyToken<'info> {
    #[account(
        mut,
        seeds = [
            b"presale",
            presale_info.authority.as_ref()
        ],
        bump,
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + std::mem::size_of::<UserInfo>(),
        seeds = [
            b"user",
            presale_info.key().as_ref(),
            buyer.key().as_ref()
        ],
        bump,
    )]
    pub user_info: Box<Account<'info, UserInfo>>,

    /// CHECK: This is not dangerous
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub presale_vault: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub presale_token_account: Account<'info, TokenAccount>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn buy_token(ctx: Context<BuyToken>, amount: u64) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    let user_info = &mut ctx.accounts.user_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Initialize user_info if it's new
    if user_info.wallet == Pubkey::default() {
        user_info.wallet = ctx.accounts.buyer.key();
        user_info.tokens_bought = 0;
        user_info.phase_purchases = [0; 5];
        user_info.last_purchase_time = 0;
        user_info.has_claimed = false;
        user_info.total_paid = 0;
    }

    // Basic validations
    require!(presale_info.is_initialized, PresaleError::PresaleNotInitialized);
    require!(presale_info.is_active, PresaleError::PresaleNotActive);
    require!(!presale_info.is_ended, PresaleError::PresaleEnded);
    require!(current_time >= presale_info.start_time, PresaleError::PresaleNotStarted);
    require!(current_time <= presale_info.end_time, PresaleError::PresaleEnded);

    // Get current phase info first
    let phase_number = presale_info.current_phase;
    let max_token_amount = presale_info.max_token_amount_per_address;
    
    // Get phase reference and validate
    {
        let phase = &presale_info.phases[(phase_number - 1) as usize];
        require!(phase.is_active, PresaleError::PhaseNotActive);
        require!(current_time >= phase.start_time, PresaleError::PhaseNotStarted);
        require!(current_time <= phase.end_time, PresaleError::PhaseEnded);
        require!(amount <= phase.remaining_tokens(), PresaleError::InsufficientTokens);
    }

    // User-specific validations
    let new_user_total = user_info.tokens_bought.checked_add(amount)
        .ok_or(PresaleError::Overflow)?;
    require!(new_user_total <= max_token_amount, PresaleError::ExceedsMaxAmount);

    // Cache all values before any mutations
    let total_tokens_sold = presale_info.total_tokens_sold;
    let remaining_tokens = presale_info.remaining_tokens;
    let phase = &mut presale_info.phases[(phase_number - 1) as usize];
    let phase_tokens_sold = phase.tokens_sold;
    let phase_price = phase.price;
    
    // Calculate all new values
    let new_phase_tokens_sold = phase_tokens_sold.checked_add(amount)
        .ok_or(PresaleError::Overflow)?;
    let new_total_sold = total_tokens_sold.checked_add(amount)
        .ok_or(PresaleError::Overflow)?;
    let new_remaining = remaining_tokens.checked_sub(amount)
        .ok_or(PresaleError::Overflow)?;
    
    // Update phase state
    phase.tokens_sold = new_phase_tokens_sold;
    let phase_complete = phase.is_complete();
    
    // Update presale state
    presale_info.total_tokens_sold = new_total_sold;
    presale_info.remaining_tokens = new_remaining;
    user_info.tokens_bought = new_user_total;
    
    // Handle phase completion
    if phase_complete && phase_number < PresaleInfo::TOTAL_PHASES as u8 {
        let current_phase = &mut presale_info.phases[(phase_number - 1) as usize];
        current_phase.is_active = false;
        
        presale_info.current_phase += 1;
        let next_phase = &mut presale_info.phases[phase_number as usize];
        next_phase.is_active = true;
    }
    
    // Check if presale is complete
    if new_remaining == 0 {
        presale_info.is_ended = true;
        presale_info.is_active = false;
    }

    // Do token transfer last after all state updates
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.presale_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: presale_info.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    msg!("Tokens purchased: {} at phase {} price: {} lamports", 
        amount, phase_number, phase_price);

    Ok(())
}