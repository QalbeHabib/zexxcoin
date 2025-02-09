use anchor_lang::prelude::*;

use crate::errors::PresaleError;
use crate::state::{PresaleInfo, Phase};

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
    start_time: i64,
    end_time: i64,
    max_token_amount_per_address: u64,
) -> Result<()> {
    require!(start_time < end_time, PresaleError::InvalidTimeRange);
    require!(max_token_amount_per_address > 0, PresaleError::InvalidAmount);

    let presale_info = &mut ctx.accounts.presale_info;
    let authority = &ctx.accounts.authority;

    // Initialize phases with predefined values
    let phases = [
        Phase {
            phase_number: 1,
            amount: 2_500_000,        // 5% of 50M
            price: 199_990_000,       // 0.19999 SOL in lamports
            percentage: 5,
            tokens_sold: 0,
            tokens_available: 2_500_000, // Same as amount initially
            is_active: true,          // First phase starts active
            start_time,               // First phase starts with presale
            end_time: start_time + (end_time - start_time) / 5, // Divide total time into 5 parts
        },
        Phase {
            phase_number: 2,
            amount: 5_000_000,        // 10% of 50M
            price: 399_990_000,       // 0.39999 SOL in lamports
            percentage: 10,
            tokens_sold: 0,
            tokens_available: 5_000_000, // Same as amount initially
            is_active: false,
            start_time: start_time + (end_time - start_time) / 5,
            end_time: start_time + 2 * (end_time - start_time) / 5,
        },
        Phase {
            phase_number: 3,
            amount: 17_500_000,       // 35% of 50M
            price: 499_990_000,       // 0.49999 SOL in lamports
            percentage: 35,
            tokens_sold: 0,
            tokens_available: 17_500_000, // Same as amount initially
            is_active: false,
            start_time: start_time + 2 * (end_time - start_time) / 5,
            end_time: start_time + 3 * (end_time - start_time) / 5,
        },
        Phase {
            phase_number: 4,
            amount: 20_000_000,       // 40% of 50M
            price: 599_990_000,       // 0.59999 SOL in lamports
            percentage: 40,
            tokens_sold: 0,
            tokens_available: 20_000_000, // Same as amount initially
            is_active: false,
            start_time: start_time + 3 * (end_time - start_time) / 5,
            end_time: start_time + 4 * (end_time - start_time) / 5,
        },
        Phase {
            phase_number: 5,
            amount: 5_000_000,        // 10% of 50M
            price: 699_990_000,       // 0.69999 SOL in lamports
            percentage: 10,
            tokens_sold: 0,
            tokens_available: 5_000_000, // Same as amount initially
            is_active: false,
            start_time: start_time + 4 * (end_time - start_time) / 5,
            end_time,
        },
    ];

    // Initialize presale info
    presale_info.token_mint_address = token_mint_address;
    presale_info.total_token_supply = PresaleInfo::TOTAL_SUPPLY;
    presale_info.remaining_tokens = PresaleInfo::TOTAL_SUPPLY;
    presale_info.current_phase = 1;
    presale_info.phases = phases;
    presale_info.total_tokens_sold = 0;
    presale_info.start_time = start_time;
    presale_info.end_time = end_time;
    presale_info.max_token_amount_per_address = max_token_amount_per_address;
    presale_info.authority = authority.key();
    presale_info.is_initialized = true;
    presale_info.is_active = true;
    presale_info.is_ended = false;

    // Validate phase allocation
    require!(
        presale_info.validate_phase_allocation(),
        PresaleError::InvalidPhaseAllocation
    );

    msg!("Presale initialized for token: {}", presale_info.token_mint_address);
    msg!("Starting with Phase 1: {} tokens @ {} lamports", phases[0].amount, phases[0].price);

    Ok(())
}
