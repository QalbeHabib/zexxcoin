// Token has 9 decimals like SOL
pub const TOKEN_DECIMALS: u8 = 9;
pub const DECIMALS_MULTIPLIER: u64 = 1_000_000_000; // 10^9

// Total supply: 1,000,000 tokens
pub const TOTAL_SUPPLY: u64 = 1_000_000 * DECIMALS_MULTIPLIER;

// Phase allocations (must add up to TOTAL_SUPPLY)
pub const PHASE_1_ALLOCATION: u64 = 50_000 * DECIMALS_MULTIPLIER;    // 5% of total
pub const PHASE_2_ALLOCATION: u64 = 100_000 * DECIMALS_MULTIPLIER;   // 10% of total
pub const PHASE_3_ALLOCATION: u64 = 350_000 * DECIMALS_MULTIPLIER;   // 35% of total
pub const PHASE_4_ALLOCATION: u64 = 400_000 * DECIMALS_MULTIPLIER;   // 40% of total
pub const PHASE_5_ALLOCATION: u64 = 100_000 * DECIMALS_MULTIPLIER;   // 10% of total

// Phase prices in lamports (1 SOL = 1_000_000_000 lamports)
pub const PHASE_1_PRICE: u64 = 500_000;       // 0.0005 SOL
pub const PHASE_2_PRICE: u64 = 1_000_000;     // 0.001 SOL
pub const PHASE_3_PRICE: u64 = 1_500_000;     // 0.0015 SOL
pub const PHASE_4_PRICE: u64 = 2_000_000;     // 0.002 SOL
pub const PHASE_5_PRICE: u64 = 2_500_000;     // 0.0025 SOL

// Minimum and maximum purchase amounts per phase
pub const PHASE_1_MIN_PURCHASE: u64 = 100 * DECIMALS_MULTIPLIER;     // 100 tokens
pub const PHASE_2_MIN_PURCHASE: u64 = 200 * DECIMALS_MULTIPLIER;     // 200 tokens
pub const PHASE_3_MIN_PURCHASE: u64 = 300 * DECIMALS_MULTIPLIER;     // 300 tokens
pub const PHASE_4_MIN_PURCHASE: u64 = 400 * DECIMALS_MULTIPLIER;     // 400 tokens
pub const PHASE_5_MIN_PURCHASE: u64 = 500 * DECIMALS_MULTIPLIER;     // 500 tokens

pub const PHASE_1_MAX_PURCHASE: u64 = 5_000 * DECIMALS_MULTIPLIER;   // 5,000 tokens
pub const PHASE_2_MAX_PURCHASE: u64 = 10_000 * DECIMALS_MULTIPLIER;  // 10,000 tokens
pub const PHASE_3_MAX_PURCHASE: u64 = 20_000 * DECIMALS_MULTIPLIER;  // 20,000 tokens
pub const PHASE_4_MAX_PURCHASE: u64 = 30_000 * DECIMALS_MULTIPLIER;  // 30,000 tokens
pub const PHASE_5_MAX_PURCHASE: u64 = 40_000 * DECIMALS_MULTIPLIER;  // 40,000 tokens

// Phase percentages
pub const PHASE_1_PERCENTAGE: u8 = 5;
pub const PHASE_2_PERCENTAGE: u8 = 10;
pub const PHASE_3_PERCENTAGE: u8 = 35;
pub const PHASE_4_PERCENTAGE: u8 = 40;
pub const PHASE_5_PERCENTAGE: u8 = 10;

// Maximum tokens per address: 40,000 tokens
pub const MAX_TOKENS_PER_ADDRESS: u64 = 40_000 * DECIMALS_MULTIPLIER;

// Maximum cost calculation for reference:
// Phase 1: 50,000 * 0.0005 = 25 SOL
// Phase 2: 100,000 * 0.001 = 100 SOL
// Phase 3: 350,000 * 0.0015 = 525 SOL
// Phase 4: 400,000 * 0.002 = 800 SOL
// Phase 5: 100,000 * 0.0025 = 250 SOL 