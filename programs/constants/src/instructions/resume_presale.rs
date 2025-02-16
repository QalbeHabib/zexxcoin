use anchor_lang::prelude::*;
use crate::state::PresaleInfo;
use crate::errors::PresaleError;

#[derive(Accounts)]
pub struct ResumePresale<'info> {
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

pub fn resume_presale(ctx: Context<ResumePresale>, display_end_time: i64) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;

    // Only allow resuming if presale is paused and not ended
    require!(
        presale_info.is_paused && !presale_info.is_ended,
        PresaleError::PresalePaused
    );

    presale_info.is_paused = false;
    presale_info.display_end_time = display_end_time;
    
    msg!("Presale has been resumed by admin");
    msg!("Display end time set to: {}", display_end_time);

    Ok(())
} 