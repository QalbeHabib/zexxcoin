use {
    anchor_lang::prelude::*,
    anchor_spl::token,
};

use crate::errors::PresaleError;
use crate::state::{PresaleInfo, UserInfo, PhaseStatus};
use anchor_spl::token::Token;
use anchor_spl::associated_token::AssociatedToken;

#[derive(Accounts)]
pub struct ClaimToken<'info> {
    #[account(
        mut,
        constraint = token_mint.key() == presale_info.token_mint_address
    )]
    pub token_mint: Box<Account<'info, token::Mint>>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = token_mint,
        associated_token::authority = buyer,
    )]
    pub token_account: Box<Account<'info, token::TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = presale_info,
    )]
    pub presale_associated_token_account: Box<Account<'info, token::TokenAccount>>,

    #[account(
        mut,
        seeds = [
            b"user",
            presale_info.key().as_ref(),
            buyer.key().as_ref()
        ],        
        bump
    )]
    pub user_info: Box<Account<'info, UserInfo>>,

    #[account(
        mut,
        seeds = [
            b"presale",
            presale_info.authority.as_ref()
        ],
        bump
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn claim_token(ctx: Context<ClaimToken>, phase_to_claim: u8) -> Result<()> {
    let presale_info = &ctx.accounts.presale_info;
    let user_info = &mut ctx.accounts.user_info;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate phase number
    require!(
        phase_to_claim > 0 && phase_to_claim <= PresaleInfo::TOTAL_PHASES as u8,
        PresaleError::InvalidPhase
    );

    let phase_index = (phase_to_claim - 1) as usize;
    let phase = &presale_info.phases[phase_index];
    
    // Check if user participated in this phase
    let phase_amount = user_info.phase_purchases[phase_index];
    require!(phase_amount > 0, PresaleError::InvalidPhase);

    // Check if phase is ended or active
    require!(
        phase.status == PhaseStatus::Ended || phase.status == PhaseStatus::Active,
        PresaleError::PhaseNotActive
    );

    // Check if tokens for this phase were already claimed
    require!(!user_info.phase_claims[phase_index], PresaleError::UserAlreadyClaimed);

    msg!("Claiming {} tokens from phase {}", phase_amount, phase_to_claim);
    
    // Transfer tokens
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.presale_associated_token_account.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.presale_info.to_account_info(),
            },
            &[&[
                b"presale",
                ctx.accounts.presale_info.authority.as_ref(),
                &[ctx.bumps.presale_info],
            ][..]],
        ),
        phase_amount,
    )?;

    // Update user info - only mark this phase as claimed
    user_info.phase_claims[phase_index] = true;
    user_info.last_purchase_time = current_time;

    // Calculate remaining claimable tokens from ended or active phases
    let remaining_claimable = user_info.phase_purchases.iter()
        .enumerate()
        .filter(|(i, &amount)| {
            let phase_status = presale_info.phases[*i].status;
            !user_info.phase_claims[*i] && amount > 0 && 
            (phase_status == PhaseStatus::Ended || phase_status == PhaseStatus::Active)
        })
        .map(|(_, &amount)| amount)
        .sum::<u64>();

    msg!("Successfully claimed {} tokens from phase {}", phase_amount, phase_to_claim);
    msg!("Remaining claimable tokens: {}", remaining_claimable);

    Ok(())
}
