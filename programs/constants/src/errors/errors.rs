use anchor_lang::prelude::*;

#[error_code]
pub enum PresaleError {
    #[msg("Invalid time range")]
    InvalidTimeRange,
    #[msg("Invalid amount")]
    InvalidAmount,
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
    #[msg("Presale has not started")]
    PresaleNotStarted,
    #[msg("Presale not ended yet")]
    PresaleNotEnded,
    #[msg("Invalid phase")]
    InvalidPhase,
    #[msg("Phase not active")]
    PhaseNotActive,
    #[msg("Phase has not started")]
    PhaseNotStarted,
    #[msg("Phase has ended")]
    PhaseEnded,
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
    #[msg("Invalid hardcap")]
    InvalidHardcap,
    #[msg("Invalid softcap")]
    InvalidSoftcap,
    #[msg("Insufficient deposited tokens")]
    InsufficientDeposit,
}
