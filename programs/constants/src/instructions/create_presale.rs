use anchor_lang::prelude::*;

use crate::errors::PresaleError;
use crate::state::{PresaleInfo, Phase, PhaseStatus};
use crate::constants::presale_config::*;

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
    max_token_amount_per_address: u64,
    display_end_time: i64,
) -> Result<()> {
    require!(max_token_amount_per_address > 0, PresaleError::InvalidAmount);

    let presale_info = &mut ctx.accounts.presale_info;
    let authority = &ctx.accounts.authority;

    // Initialize phases with predefined values from constants
    let phases = [
        Phase {
            phase_number: 1,
            amount: PHASE_1_ALLOCATION,
            price: PHASE_1_PRICE,
            percentage: PHASE_1_PERCENTAGE,
            tokens_sold: 0,
            tokens_available: PHASE_1_ALLOCATION,
            status: PhaseStatus::Active,
            softcap: PHASE_1_MIN_PURCHASE,
            hardcap: PHASE_1_MAX_PURCHASE,
        },
        Phase {
            phase_number: 2,
            amount: PHASE_2_ALLOCATION,
            price: PHASE_2_PRICE,
            percentage: PHASE_2_PERCENTAGE,
            tokens_sold: 0,
            tokens_available: PHASE_2_ALLOCATION,
            status: PhaseStatus::Upcoming,
            softcap: PHASE_2_MIN_PURCHASE,
            hardcap: PHASE_2_MAX_PURCHASE,
        },
        Phase {
            phase_number: 3,
            amount: PHASE_3_ALLOCATION,
            price: PHASE_3_PRICE,
            percentage: PHASE_3_PERCENTAGE,
            tokens_sold: 0,
            tokens_available: PHASE_3_ALLOCATION,
            status: PhaseStatus::Upcoming,
            softcap: PHASE_3_MIN_PURCHASE,
            hardcap: PHASE_3_MAX_PURCHASE,
        },
        Phase {
            phase_number: 4,
            amount: PHASE_4_ALLOCATION,
            price: PHASE_4_PRICE,
            percentage: PHASE_4_PERCENTAGE,
            tokens_sold: 0,
            tokens_available: PHASE_4_ALLOCATION,
            status: PhaseStatus::Upcoming,
            softcap: PHASE_4_MIN_PURCHASE,
            hardcap: PHASE_4_MAX_PURCHASE,
        },
        Phase {
            phase_number: 5,
            amount: PHASE_5_ALLOCATION,
            price: PHASE_5_PRICE,
            percentage: PHASE_5_PERCENTAGE,
            tokens_sold: 0,
            tokens_available: PHASE_5_ALLOCATION,
            status: PhaseStatus::Upcoming,
            softcap: PHASE_5_MIN_PURCHASE,
            hardcap: PHASE_5_MAX_PURCHASE,
        },
        Phase {
            phase_number: 6,
            amount: PHASE_6_ALLOCATION,
            price: PHASE_6_PRICE,
            percentage: PHASE_6_PERCENTAGE,
            tokens_sold: 0,
            tokens_available: PHASE_6_ALLOCATION,
            status: PhaseStatus::Upcoming,
            softcap: PHASE_6_MIN_PURCHASE,
            hardcap: PHASE_6_MAX_PURCHASE,
        },
    ];

    // Initialize presale info
    presale_info.token_mint_address = token_mint_address;
    presale_info.total_token_supply = TOTAL_SUPPLY;
    presale_info.remaining_tokens = TOTAL_SUPPLY;
    presale_info.current_phase = 1;
    presale_info.phases = phases;
    presale_info.total_tokens_sold = 0;
    presale_info.max_token_amount_per_address = max_token_amount_per_address;
    presale_info.authority = authority.key();
    presale_info.is_initialized = true;
    presale_info.is_active = true;
    presale_info.is_ended = false;
    presale_info.is_paused = false;
    presale_info.display_end_time = display_end_time;
    // Validate phase allocation
    require!(
        presale_info.validate_phase_allocation(),
        PresaleError::InvalidPhaseAllocation
    );

    msg!("Presale initialized for token: {}", presale_info.token_mint_address);
    msg!("Starting with Phase 1: {} tokens @ {} lamports", phases[0].amount, phases[0].price);
    msg!("Soft cap: {} tokens, Hard cap: {} tokens", 
        phases[0].softcap / DECIMALS_MULTIPLIER,
        phases[0].hardcap / DECIMALS_MULTIPLIER
    );

    Ok(())
}
