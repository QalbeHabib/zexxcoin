use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, Debug, PartialEq)]
pub enum PhaseStatus {
    #[default]
    Upcoming,
    Active,
    Ended
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, Debug)]
pub struct Phase {
    pub phase_number: u8,
    pub amount: u64,          // Amount of tokens allocated for this phase
    pub price: u64,          // Price in lamports
    pub percentage: u8,      // Percentage of total tokens
    pub tokens_sold: u64,    // Tokens sold in this phase
    pub tokens_available: u64, // Tokens available for sale in this phase
    pub status: PhaseStatus, // Current status of the phase
    pub softcap: u64,       // Minimum target for the phase (soft cap)
    pub hardcap: u64,       // Maximum limit for the phase (hard cap)
}

impl Phase {
    pub fn is_complete(&self) -> bool {
        self.tokens_sold >= self.amount || self.status == PhaseStatus::Ended
    }

    pub fn is_in_progress(&self) -> bool {
        self.status == PhaseStatus::Active && !self.is_complete()
    }

    pub fn remaining_tokens(&self) -> u64 {
        if self.tokens_sold >= self.amount {
            0
        } else {
            self.amount - self.tokens_sold
        }
    }
} 