use anchor_lang::prelude::*;
use crate::errors::PresaleError;

#[account]
#[derive(Default)]
pub struct UserInfo {
    // Total tokens bought by the user across all phases
    pub tokens_bought: u64,
    // Array of tokens bought in each phase [phase1_amount, phase2_amount, ...]
    pub phase_purchases: [u64; 5],
    // Last purchase timestamp
    pub last_purchase_time: i64,
    // Array to track which phases have been claimed [phase1_claimed, phase2_claimed, ...]
    pub phase_claims: [bool; 5],
    // The wallet address of the user
    pub wallet: Pubkey,
    // Total amount paid in lamports
    pub total_paid: u64,
}

impl UserInfo {
    pub fn record_purchase(&mut self, phase: u8, amount: u64, payment_amount: u64) -> Result<()> {
        require!(phase > 0 && phase <= 5, PresaleError::InvalidPhase);
        
        self.phase_purchases[(phase - 1) as usize] = self.phase_purchases[(phase - 1) as usize]
            .checked_add(amount)
            .ok_or(PresaleError::Overflow)?;
            
        self.tokens_bought = self.tokens_bought
            .checked_add(amount)
            .ok_or(PresaleError::Overflow)?;

        self.total_paid = self.total_paid
            .checked_add(payment_amount)
            .ok_or(PresaleError::Overflow)?;
            
        self.last_purchase_time = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    pub fn get_phase_amount(&self, phase: u8) -> Option<u64> {
        if phase == 0 || phase > 5 {
            None
        } else {
            Some(self.phase_purchases[(phase - 1) as usize])
        }
    }
}