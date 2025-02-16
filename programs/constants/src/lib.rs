use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("88uaiF6Lqq3id6idy6zMv8Pfc4sXb3gvQNLCMWWQHHCL");

#[program]
pub mod zexxcoin_presale {
    use super::*;

    pub fn create_presale(
        ctx: Context<CreatePresale>,
        token_mint_address: Pubkey,
        max_token_amount_per_address: u64,
        display_end_time: i64,
    ) -> Result<()> {
        instructions::create_presale::create_presale(
            ctx,
            token_mint_address,
            max_token_amount_per_address,
            display_end_time,
        )
    }

    pub fn deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
        instructions::deposit_token::deposit_token(ctx, amount)
    }

    pub fn buy_token(ctx: Context<BuyToken>, amount: u64) -> Result<()> {
        instructions::buy_token::buy_token(ctx, amount)
    }

    pub fn claim_token(ctx: Context<ClaimToken>, phase_to_claim: u8) -> Result<()> {
        instructions::claim_token::claim_token(ctx, phase_to_claim)
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>, bump: u8) -> Result<()> {
        instructions::withdraw_sol::withdraw_sol(ctx, bump)
    }

    pub fn emergency_stop(ctx: Context<EmergencyStop>) -> Result<()> {
        instructions::emergency_stop::emergency_stop(ctx)
    }

    pub fn resume_presale(ctx: Context<ResumePresale>, display_end_time: i64) -> Result<()> {
        instructions::resume_presale::resume_presale(ctx, display_end_time)
    }
}
