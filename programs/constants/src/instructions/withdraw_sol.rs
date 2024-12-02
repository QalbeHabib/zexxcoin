use anchor_lang::{prelude::*, system_program};

use crate::errors::PresaleError;
use crate::state::PresaleInfo;
#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(
        seeds = [
            b"presale",
            presale_info.authority.as_ref()
        ],
        bump
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    /// CHECK: Vault PDA where SOL is stored
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub presale_vault: AccountInfo<'info>,

    #[account(
        mut,
        constraint = admin.key() == presale_info.authority
    )]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn withdraw_sol(ctx: Context<WithdrawSol>, bump: u8) -> Result<()> {
    // Fetch the vault's SOL balance
    let vault_balance = ctx.accounts.presale_vault.to_account_info().lamports();
    msg!("Vault balance: {} lamports", vault_balance);

    // Check if there's any balance to withdraw
    require!(vault_balance == 0, PresaleError::EmptyVault);

    // Transfer all SOL from the vault to the admin
    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.presale_vault.to_account_info(),
                to: ctx.accounts.admin.to_account_info(),
            },
            &[&[b"vault", &[bump]]], // PDA signer
        ),
        vault_balance,
    )?;

    Ok(())
}
