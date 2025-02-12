use anchor_lang::{prelude::*, system_program};

use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use solana_program::clock::Clock;

use solana_program::account_info::AccountInfo;

use crate::errors::PresaleError;
use crate::state::{PresaleInfo, UserInfo};
use crate::constants::presale_config::DECIMALS_MULTIPLIER;

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

    // Get current phase info
    let phase_number = presale_info.current_phase;
    let max_token_amount = presale_info.max_token_amount_per_address;
    
    // Validate user's total purchase would not exceed max allowed
    let new_user_total = user_info.tokens_bought.checked_add(amount)
        .ok_or(PresaleError::Overflow)?;
    require!(
        new_user_total <= max_token_amount,
        PresaleError::ExceedsMaxAmount
    );
    msg!("User's current total: {}, New total after purchase: {}, Max allowed: {}", 
        user_info.tokens_bought / DECIMALS_MULTIPLIER,
        new_user_total / DECIMALS_MULTIPLIER,
        max_token_amount / DECIMALS_MULTIPLIER
    );
    
    // First, validate phase and get necessary information
    let (phase_price, is_phase_complete, next_phase_price) = {
        let phase = &presale_info.phases[(phase_number - 1) as usize];
        require!(phase.is_active, PresaleError::PhaseNotActive);
        require!(amount <= phase.remaining_tokens(), PresaleError::InsufficientTokens);
        
        let tokens_sold_after = phase.tokens_sold.checked_add(amount)
            .ok_or(PresaleError::Overflow)?;
        let tokens_available_after = phase.tokens_available.checked_sub(amount)
            .ok_or(PresaleError::Overflow)?;
        
        let will_complete = tokens_available_after == 0;
        let next_price = if will_complete && phase_number < PresaleInfo::TOTAL_PHASES as u8 {
            Some(presale_info.phases[phase_number as usize].price)
        } else {
            None
        };
        
        (phase.price, will_complete, next_price)
    };

    // Calculate payment before any mutations
    let actual_tokens = amount.checked_div(DECIMALS_MULTIPLIER)
        .ok_or(PresaleError::Overflow)?;
    let payment_amount = phase_price.checked_mul(actual_tokens)
        .ok_or(PresaleError::Overflow)?;

    // Now perform all mutations
    {
        let phase = &mut presale_info.phases[(phase_number - 1) as usize];
        phase.tokens_sold = phase.tokens_sold.checked_add(amount)
            .ok_or(PresaleError::Overflow)?;
        phase.tokens_available = phase.tokens_available.checked_sub(amount)
            .ok_or(PresaleError::Overflow)?;
        
        if is_phase_complete {
            phase.is_active = false;
        }
    }

    // Handle phase transition and global state updates
    if is_phase_complete && phase_number < PresaleInfo::TOTAL_PHASES as u8 {
        presale_info.current_phase += 1;
        presale_info.phases[phase_number as usize].is_active = true;
        
        msg!("Phase {} completed! Moving to Phase {}", phase_number, phase_number + 1);
        if let Some(next_price) = next_phase_price {
            msg!("New phase price: {} lamports", next_price);
        }
    }

    // Update global presale state
    presale_info.total_tokens_sold = presale_info.total_tokens_sold
        .checked_add(amount)
        .ok_or(PresaleError::Overflow)?;
    presale_info.remaining_tokens = presale_info.remaining_tokens
        .checked_sub(amount)
        .ok_or(PresaleError::Overflow)?;

    // Transfer SOL from buyer to presale vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.presale_vault.to_account_info(),
            }
        ),
        payment_amount
    )?;

    // Update user info
    user_info.tokens_bought = new_user_total;
    user_info.phase_purchases[(phase_number - 1) as usize] = user_info.phase_purchases[(phase_number - 1) as usize]
        .checked_add(amount)
        .ok_or(PresaleError::Overflow)?;
    user_info.last_purchase_time = Clock::get()?.unix_timestamp;
    user_info.total_paid = user_info.total_paid
        .checked_add(payment_amount)
        .ok_or(PresaleError::Overflow)?;

    // Check if presale is complete and update final states
    if presale_info.remaining_tokens == 0 {
        presale_info.is_ended = true;
        presale_info.is_active = false;
        msg!("Presale completed! All tokens sold.");
    }

    // Calculate final phase statistics
    let final_percentage = {
        let phase = &presale_info.phases[(phase_number - 1) as usize];
        (phase.tokens_sold * 100) / phase.amount
    };

    msg!("Purchase successful!");
    msg!("Tokens purchased: {}", amount / DECIMALS_MULTIPLIER);
    msg!("Amount paid: {} lamports", payment_amount);
    msg!("Current phase: {} ({}% sold)", phase_number, final_percentage);
    msg!("User's total tokens purchased: {}", new_user_total / DECIMALS_MULTIPLIER);

    Ok(())
}