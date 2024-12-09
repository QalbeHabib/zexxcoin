use anchor_lang::{prelude::*, system_program};

use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Token;
use solana_program::clock::Clock;

use solana_program::account_info::AccountInfo;

use crate::errors::PresaleError;
use crate::state::PresaleInfo;
use crate::state::UserInfo;

#[derive(Accounts)]
pub struct BuyToken<'info> {
    #[account(
        mut,
        seeds = [
            b"presale",
            presale_info.authority.as_ref()
        ],
        bump
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + std::mem::size_of::<UserInfo>(),
        seeds = [
            b"user",
            buyer.key().as_ref()
        ],
        bump
    )]
    pub user_info: Box<Account<'info, UserInfo>>,

    /// CHECK: This is not dangerous
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub presale_vault: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn buy_token(ctx: Context<BuyToken>, quote_amount: u64) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    let user_info = &mut ctx.accounts.user_info;
    let presale_vault = &mut ctx.accounts.presale_vault;
    let cur_timestamp = u64::try_from(Clock::get()?.unix_timestamp).unwrap();
    // let price_per_token: u64 = presale_info.price_per_token;

    let start_time = presale_info.start_time;
    let end_time = presale_info.end_time;

    // get time and compare with start and end time
    if cur_timestamp < start_time {
        msg!("current time: {}", cur_timestamp);
        msg!("start time: {}", start_time);
        return Err(PresaleError::PresaleNotStarted.into());
    }

    if cur_timestamp > end_time {
        msg!("start time: {}", presale_info.start_time);
        msg!("end time: {}", end_time);
        msg!("current time: {}", cur_timestamp);
        return Err(PresaleError::PresaleEnded.into());
    }

    // Validate price_per_token is not zero
    if presale_info.price_per_token == 0 {
        return Err(PresaleError::InvalidPrice.into());
    }

    let token_amount: u64 = quote_amount / presale_info.price_per_token;
    let token_amount_with_decimals = token_amount * 1_000_000_000;

    // compare the rest with the token_amount
    if token_amount > presale_info.deposit_token_amount - presale_info.sold_token_amount {
        msg!("token amount: {}", token_amount);
        msg!(
            "rest token amount in presale: {}",
            presale_info.deposit_token_amount - presale_info.sold_token_amount
        );
        return Err(PresaleError::InsufficientFund.into());
    }

    // limit the token_amount per address
    if presale_info.max_token_amount_per_address < (user_info.buy_token_amount + token_amount) {
        msg!(
            "max token amount per address: {}",
            presale_info.max_token_amount_per_address
        );
        msg!(
            "token amount to buy: {}",
            user_info.buy_token_amount + token_amount
        );
        return Err(PresaleError::ExceedMaximumBuy.into());
    }

    // limit the presale to hardcap
    if presale_info.is_hard_capped == true {
        return Err(PresaleError::HardCapped.into());
    }

    // send SOL to contract and update the user info
    user_info.buy_time = cur_timestamp;
    user_info.buy_quote_amount = user_info.buy_quote_amount + quote_amount;
    user_info.buy_token_amount = user_info.buy_token_amount + token_amount_with_decimals;

    // Update presale info with decimals
    presale_info.sold_token_amount = presale_info.sold_token_amount + token_amount_with_decimals;

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: presale_vault.to_account_info(),
            },
        ),
        quote_amount,
    )?;

    msg!("Presale tokens transferred successfully.");

    // show softcap status
    if presale_vault.get_lamports() >= presale_info.softcap_amount {
        presale_info.is_soft_capped = true;
        msg!("Presale is softcapped");
    }

    // show hardcap status
    if presale_vault.get_lamports() >= presale_info.hardcap_amount {
        presale_info.is_hard_capped = true;
        msg!("Presale is hardcapped");
    }

    Ok(())
}
