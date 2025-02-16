use anchor_lang::prelude::*;
use crate::state::PresaleInfo;
use crate::errors::PresaleError;

#[derive(Accounts)]
pub struct EmergencyStop<'info> {
    #[account(
        mut,
        seeds = [
            b"presale",
            presale_info.authority.as_ref()
        ],
        bump,
    )]
    pub presale_info: Account<'info, PresaleInfo>,

    #[account(
        constraint = authority.key() == presale_info.authority @ PresaleError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
}

pub fn emergency_stop(ctx: Context<EmergencyStop>) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;

    // Only allow stopping if presale is active and not already paused
    require!(
        presale_info.is_active && !presale_info.is_paused,
        PresaleError::PresalePaused
    );

    presale_info.is_paused = true;
    msg!("Presale has been emergency stopped by admin");

    Ok(())
} 