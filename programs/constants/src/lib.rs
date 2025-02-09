use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use errors::*;

declare_id!("4NiRZQQ5Rgsoy2zZ7SWAJAvbCuimUH1nY1nwCFKnfPtz");

#[program]
pub mod terminus_presale {
    use super::*;

    pub fn create_presale(
        ctx: Context<CreatePresale>,
        token_mint_address: Pubkey,
        start_time: i64,
        end_time: i64,
        max_token_amount_per_address: u64,
    ) -> Result<()> {
        instructions::create_presale::create_presale(
            ctx,
            token_mint_address,
            start_time,
            end_time,
            max_token_amount_per_address,
        )
    }

    pub fn deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
        instructions::deposit_token::deposit_token(ctx, amount)
    }

    pub fn buy_token(ctx: Context<BuyToken>, amount: u64) -> Result<()> {
        instructions::buy_token::buy_token(ctx, amount)
    }

    pub fn claim_token(ctx: Context<ClaimToken>, bump: u8) -> Result<()> {
        instructions::claim_token::claim_token(ctx, bump)
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>, bump: u8) -> Result<()> {
        instructions::withdraw_sol::withdraw_sol(ctx, bump)
    }
}
