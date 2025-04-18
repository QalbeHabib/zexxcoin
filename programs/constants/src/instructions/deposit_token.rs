use anchor_lang::system_program;
// use solana_program::program::invoke;

use anchor_spl::token::Token;
use {anchor_lang::prelude::*, anchor_spl::token};
// use solana_program::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use crate::constants::RENT_MINIMUM;
use crate::state::PresaleInfo;

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct DepositToken<'info> {
    #[account(
        mut,
        constraint = mint_account.key() == presale_info.token_mint_address
    )]
    pub mint_account: Account<'info, token::Mint>,

    #[account(
        mut,
        constraint = token_account.amount >= amount,
        associated_token::mint = mint_account,
        associated_token::authority = admin,
    )]
    pub token_account: Account<'info, token::TokenAccount>,

    #[account(
        mut,
        constraint = admin.key() == presale_info.authority
    )]
    pub admin: Signer<'info>,

    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = mint_account,
        associated_token::authority = presale_info,
    )]
    pub to_associated_token_account: Account<'info, token::TokenAccount>,

    /// CHECK: This is not dangerous
    #[account(
        mut,
        seeds = [
            b"vault"
        ],
        bump,
    )]
    pub presale_vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            b"presale",
            presale_info.authority.as_ref()
        ],        
        bump
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    // #[account(mut)]
    // pub payer: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;

    // Detailed logging for debugging
    msg!("Deposit Amount: {}", amount);
    msg!("Mint Address: {}", &ctx.accounts.mint_account.key());
    msg!("From Token Account: {}", &ctx.accounts.token_account.key());
    msg!(
        "From Token Account Balance: {}",
        &ctx.accounts.token_account.amount
    );
    msg!(
        "To Token Address: {}",
        &ctx.accounts.to_associated_token_account.key()
    );
    msg!("Rent Minimum Transfer Amount: {}", RENT_MINIMUM);

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.to_associated_token_account.to_account_info(),
                authority: ctx.accounts.admin.to_account_info(),
            },
        ),
        amount,
    )?;

    // transfer Sol to the presaleVault
    msg!("From Wallet Address: {}", &ctx.accounts.token_account.key());
    msg!(
        "To Wallet Address: {}",
        &ctx.accounts.to_associated_token_account.key()
    );
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.admin.to_account_info(),
                to: ctx.accounts.presale_vault.to_account_info(),
            },
        ),
        RENT_MINIMUM,
    )?;

    // Use the deposit_tokens method from PresaleInfo
    presale_info.deposit_tokens(amount)?;

    msg!(
        "Tokens deposited successfully. Total deposited: {}",
        presale_info.total_tokens_deposited
    );

    Ok(())
}
