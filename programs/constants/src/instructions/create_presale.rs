use anchor_lang::prelude::*;

use crate::errors::PresaleError;
use crate::state::PresaleInfo;

#[derive(Accounts)]
pub struct CreatePresale<'info> {
    #[account(
        init,
        seeds = [
            b"presale",
            authority.key().as_ref()
        ],
        bump,
        payer = authority,
        space = 8 + std::mem::size_of::<PresaleInfo>(),
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,
    // Box is a memory management tool which allows you to allocate account memory on the heap instead. It gives you a pointer to the heap memory where your account data is stored. This helps save on stack space
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// Edit the details for a presale
pub fn create_presale(
    ctx: Context<CreatePresale>,
    token_mint_address: Pubkey,
    softcap_amount: u64,
    hardcap_amount: u64,
    max_token_amount_per_address: u64,
    price_per_token: u64,
    start_time: u64,
    end_time: u64,
) -> Result<()> {
    require!(price_per_token > 0, PresaleError::InvalidPrice);
    require!(softcap_amount > 0, PresaleError::InvalidSoftcap);
    require!(
        hardcap_amount >= softcap_amount,
        PresaleError::InvalidHardcap
    );
    require!(start_time < end_time, PresaleError::InvalidTimeRange);
    let presale_info = &mut ctx.accounts.presale_info;
    let authority = &ctx.accounts.authority;

    presale_info.token_mint_address = token_mint_address;
    presale_info.softcap_amount = softcap_amount;
    presale_info.hardcap_amount = hardcap_amount;
    presale_info.deposit_token_amount = 0;
    presale_info.sold_token_amount = 0;
    presale_info.start_time = start_time;
    presale_info.end_time = end_time;
    presale_info.max_token_amount_per_address = max_token_amount_per_address;
    presale_info.price_per_token = price_per_token;
    presale_info.is_live = false;
    presale_info.authority = authority.key();
    presale_info.is_soft_capped = false;
    presale_info.is_hard_capped = false;
 

    msg!(
        "Presale has created for token: {}",
        presale_info.token_mint_address
    );

    Ok(())
}
