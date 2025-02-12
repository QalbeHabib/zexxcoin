use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("67did8BtXxNui752tb2cDVFGko2qP6As4sLDdjkdCEeG");

#[program]
pub mod zexxcoin_presale {
    use super::*;

    pub fn create_presale(
        ctx: Context<CreatePresale>,
        token_mint_address: Pubkey,
        max_token_amount_per_address: u64,
    ) -> Result<()> {
        instructions::create_presale::create_presale(
            ctx,
            token_mint_address,
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
