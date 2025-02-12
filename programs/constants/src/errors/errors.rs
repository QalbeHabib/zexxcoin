use anchor_lang::prelude::*;

#[error_code]
pub enum PresaleError {
    #[msg("Amount below soft cap")]
    BelowSoftcap,
    #[msg("Amount above hard cap")]
    AboveHardcap,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Presale not initialized")]
    PresaleNotInitialized,
    #[msg("Presale not active")]
    PresaleNotActive,
    #[msg("Presale has ended")]
    PresaleEnded,
    #[msg("Invalid phase")]
    InvalidPhase,
    #[msg("Phase not active")]
    PhaseNotActive,
    #[msg("Insufficient tokens in current phase")]
    InsufficientTokens,
    #[msg("Exceeds maximum tokens per address")]
    ExceedsMaxAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Invalid phase allocation")]
    InvalidPhaseAllocation,
    #[msg("User has already claimed the tokens")]
    UserAlreadyClaimed,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    #[msg("Empty vault")]
    EmptyVault,
    #[msg("Insufficient deposited tokens")]
    InsufficientDeposit,
    #[msg("Invalid amount")]
    InvalidAmount,
}
