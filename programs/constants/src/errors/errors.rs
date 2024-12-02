use anchor_lang::prelude::*;

#[error_code]
pub enum PresaleError {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Not allowed")]
    NotAllowed,
    #[msg("Math operation overflow")]
    MathOverflow,
    #[msg("Already marked")]
    AlreadyMarked,
    #[msg("Presale not started yet")]
    PresaleNotStarted,
    #[msg("Presale already ended")]
    PresaleEnded,
    #[msg("Token amount mismatch")]
    TokenAmountMismatch,
    #[msg("Insufficient Tokens")]
    InsufficientFund,
    #[msg("Token purchase exceeds the maximum allowed per user!")]
    ExceedMaximumBuy,
    #[msg("Presale not ended yet")]
    PresaleNotEnded,
    #[msg("Presale already ended HardCapped")]
    HardCapped,
    #[msg("Price per token cannot be zero.")]
    InvalidPrice,
    #[msg("Softcap amount must be greater than zero.")]
    InvalidSoftcap,
    #[msg("Hardcap must be greater than or equal to the softcap.")]
    InvalidHardcap,
    #[msg("Start time must be earlier than the end time.")]
    InvalidTimeRange,
    #[msg("A calculation or division error occurred.")]
    CalculationError,
    #[msg("The vault is empty. No SOL to withdraw.")]
    EmptyVault,
}
