use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, Debug)]
pub struct Phase {
    pub phase_number: u8,
    pub amount: u64,          // Amount of tokens allocated for this phase
    pub price: u64,          // Price in lamports (1 SOL = 1_000_000_000 lamports)
    pub percentage: u8,      // Percentage of total tokens
    pub tokens_sold: u64,    // Tokens sold in this phase
    pub tokens_available: u64, // Tokens available for sale in this phase
    pub is_active: bool,     // Whether this phase is currently active
    pub start_time: i64,     // Phase start timestamp
    pub end_time: i64,       // Phase end timestamp
}

impl Phase {
    pub fn is_complete(&self) -> bool {
        self.tokens_sold >= self.amount
    }

    pub fn is_in_progress(&self) -> bool {
        self.is_active && !self.is_complete()
    }

    pub fn remaining_tokens(&self) -> u64 {
        if self.tokens_sold >= self.amount {
            0
        } else {
            self.amount - self.tokens_sold
        }
    }
} 