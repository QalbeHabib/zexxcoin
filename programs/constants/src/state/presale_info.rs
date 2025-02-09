use anchor_lang::prelude::*;
use crate::state::phase_info::Phase;
use crate::errors::PresaleError;

#[account]
#[derive(Default)]
pub struct PresaleInfo {
    // Mint address of the presale token
    pub token_mint_address: Pubkey,
    // Total token supply for presale (50,000,000)
    pub total_token_supply: u64,
    // Remaining tokens to be sold across all phases
    pub remaining_tokens: u64,
    // Current active phase (1-5)
    pub current_phase: u8,
    // Array of phase information
    pub phases: [Phase; 5],
    // Total amount of presale tokens sold during the presale
    pub total_tokens_sold: u64,
    // Total amount of tokens deposited by admin
    pub total_tokens_deposited: u64,
    // Start time of entire presale
    pub start_time: i64,
    // End time of entire presale
    pub end_time: i64,
    // Maximum amount of presale tokens an address can purchase
    pub max_token_amount_per_address: u64,
    // Authority of the presale
    pub authority: Pubkey,
    // Presale is initialized and ready
    pub is_initialized: bool,
    // Presale is currently active
    pub is_active: bool,
    // Presale has ended
    pub is_ended: bool,
}

impl PresaleInfo {
    pub const TOTAL_PHASES: usize = 5;
    pub const TOTAL_SUPPLY: u64 = 50_000_000;

    pub fn get_current_phase(&self) -> Option<&Phase> {
        if self.current_phase == 0 || self.current_phase > Self::TOTAL_PHASES as u8 {
            None
        } else {
            Some(&self.phases[(self.current_phase - 1) as usize])
        }
    }

    pub fn get_current_phase_mut(&mut self) -> Option<&mut Phase> {
        if self.current_phase == 0 || self.current_phase > Self::TOTAL_PHASES as u8 {
            None
        } else {
            Some(&mut self.phases[(self.current_phase - 1) as usize])
        }
    }

    pub fn can_move_to_next_phase(&self) -> bool {
        if let Some(current_phase) = self.get_current_phase() {
            current_phase.is_complete() && self.current_phase < Self::TOTAL_PHASES as u8
        } else {
            false
        }
    }

    pub fn validate_phase_allocation(&self) -> bool {
        let total_percentage: u8 = self.phases.iter().map(|p| p.percentage).sum();
        let total_tokens: u64 = self.phases.iter().map(|p| p.amount).sum();
        
        total_percentage == 100 && total_tokens == Self::TOTAL_SUPPLY
    }

    pub fn is_valid_purchase_amount(&self, amount: u64) -> bool {
        if let Some(current_phase) = self.get_current_phase() {
            amount <= current_phase.remaining_tokens() && amount <= self.remaining_tokens
        } else {
            false
        }
    }

    pub fn update_phase_status(&mut self) -> bool {
        let current_phase_num = self.current_phase;
        if current_phase_num == 0 || current_phase_num >= Self::TOTAL_PHASES as u8 {
            return false;
        }

        let current_phase = &mut self.phases[(current_phase_num - 1) as usize];
        if current_phase.is_complete() {
            current_phase.is_active = false;
            self.current_phase += 1;
            if self.current_phase <= Self::TOTAL_PHASES as u8 {
                self.phases[self.current_phase as usize - 1].is_active = true;
            }
            true
        } else {
            false
        }
    }

    pub fn deposit_tokens(&mut self, amount: u64) -> Result<()> {
        self.total_tokens_deposited = self.total_tokens_deposited.checked_add(amount)
            .ok_or(PresaleError::Overflow)?;
        Ok(())
    }

    pub fn withdraw_tokens(&mut self, amount: u64) -> Result<()> {
        require!(
            self.total_tokens_deposited >= amount,
            PresaleError::InsufficientDeposit
        );
        self.total_tokens_deposited = self.total_tokens_deposited.checked_sub(amount)
            .ok_or(PresaleError::Overflow)?;
        Ok(())
    }
}
