use {
    anchor_lang::prelude::*,
    anchor_spl::token,
};

use crate::errors::PresaleError;
use crate::state::{PresaleInfo, UserInfo};
use anchor_spl::token::Token;
use anchor_spl::associated_token::AssociatedToken;


#[derive(Accounts)]
pub struct ClaimToken<'info> {
    // Presale token accounts
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

pub fn claim_token(ctx: Context<ClaimToken>, bump: u8) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    let current_time = Clock::get()?.unix_timestamp;
    let end_time = presale_info.end_time as u64;
    // Check if presale has ended
    if (current_time as u64) < end_time {
        msg!("current time: {}", current_time);
        msg!("presale end time: {}", end_time);
        msg!("Presale not ended yet.");
        return Err(PresaleError::PresaleNotEnded.into());
    }

    let user_info = &mut ctx.accounts.user_info;
    let claim_amount = user_info.tokens_bought;
    let is_claimed = user_info.has_claimed;
    if is_claimed {
        msg!("User has already claimed the tokens.");
        return Err(PresaleError::UserAlreadyClaimed.into());
    }

    msg!(
        "Transferring presale tokens to buyer {}...",
        &ctx.accounts.buyer.key()
    );
    msg!("Mint: {}", &ctx.accounts.token_mint.to_account_info().key());
    msg!(
        "From Token Address: {}",
        &ctx.accounts.presale_associated_token_account.key()
    );
    msg!("To Token Address: {}", &ctx.accounts.token_account.key());
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx
                    .accounts
                    .presale_associated_token_account
                    .to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.presale_info.to_account_info(),
            },
            &[&[
                b"presale" as &[u8],
                ctx.accounts.presale_info.authority.as_ref(),
                &[bump],
            ][..]],
        ),
        claim_amount,
    )?;

    user_info.tokens_bought = 0;
    user_info.last_purchase_time = current_time;
    user_info.has_claimed = true;
    msg!("All claimed presale tokens transferred successfully. here");
    msg!("current time: {}", current_time);
    msg!("presale end time: {}", end_time);

    Ok(())
}
