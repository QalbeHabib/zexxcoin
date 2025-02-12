// Token has 9 decimals like SOL
pub const TOKEN_DECIMALS: u8 = 9;
pub const DECIMALS_MULTIPLIER: u64 = 1_000_000_000; // 10^9

// Phase allocations
pub const PHASE_1_ALLOCATION: u64 = 50_000 * DECIMALS_MULTIPLIER;    // 5% of total
pub const PHASE_2_ALLOCATION: u64 = 100_000 * DECIMALS_MULTIPLIER;   // 10% of total
pub const PHASE_3_ALLOCATION: u64 = 350_000 * DECIMALS_MULTIPLIER;   // 35% of total
pub const PHASE_4_ALLOCATION: u64 = 400_000 * DECIMALS_MULTIPLIER;   // 40% of total
pub const PHASE_5_ALLOCATION: u64 = 100_000 * DECIMALS_MULTIPLIER;   // 10% of total

// Total supply is the sum of all phase allocations
pub const TOTAL_SUPPLY: u64 = PHASE_1_ALLOCATION +    // 50,000
                             PHASE_2_ALLOCATION +    // 100,000
                             PHASE_3_ALLOCATION +    // 350,000
                             PHASE_4_ALLOCATION +    // 400,000
                             PHASE_5_ALLOCATION;     // 100,000
                                                    // = 1,000,000 total

// Phase prices in lamports (1 SOL = 1_000_000_000 lamports)
pub const PHASE_1_PRICE: u64 = 40_000;        // 0.00004 SOL (2 SOL total)
pub const PHASE_2_PRICE: u64 = 23_000;        // 0.000023 SOL (2.3 SOL total)
pub const PHASE_3_PRICE: u64 = 8_570;         // 0.00000857 SOL (3 SOL total)
pub const PHASE_4_PRICE: u64 = 9_000;         // 0.000009 SOL (3.6 SOL total)
pub const PHASE_5_PRICE: u64 = 15_000;        // 0.000015 SOL (1.5 SOL total)

// Minimum purchase amounts per phase
pub const PHASE_1_MIN_PURCHASE: u64 = 100 * DECIMALS_MULTIPLIER;     // 100 tokens
pub const PHASE_2_MIN_PURCHASE: u64 = 200 * DECIMALS_MULTIPLIER;     // 200 tokens
pub const PHASE_3_MIN_PURCHASE: u64 = 300 * DECIMALS_MULTIPLIER;     // 300 tokens
pub const PHASE_4_MIN_PURCHASE: u64 = 400 * DECIMALS_MULTIPLIER;     // 400 tokens
pub const PHASE_5_MIN_PURCHASE: u64 = 500 * DECIMALS_MULTIPLIER;     // 500 tokens

// Maximum purchase amounts per phase (hardcaps match phase allocations)
pub const PHASE_1_MAX_PURCHASE: u64 = PHASE_1_ALLOCATION;   // 50,000 tokens
pub const PHASE_2_MAX_PURCHASE: u64 = PHASE_2_ALLOCATION;   // 100,000 tokens
pub const PHASE_3_MAX_PURCHASE: u64 = PHASE_3_ALLOCATION;   // 350,000 tokens
pub const PHASE_4_MAX_PURCHASE: u64 = PHASE_4_ALLOCATION;   // 400,000 tokens
pub const PHASE_5_MAX_PURCHASE: u64 = PHASE_5_ALLOCATION;   // 100,000 tokens

// Phase percentages (must add up to 100%)
pub const PHASE_1_PERCENTAGE: u8 = 5;     // 50,000 tokens
pub const PHASE_2_PERCENTAGE: u8 = 10;    // 100,000 tokens
pub const PHASE_3_PERCENTAGE: u8 = 35;    // 350,000 tokens
pub const PHASE_4_PERCENTAGE: u8 = 40;    // 400,000 tokens
pub const PHASE_5_PERCENTAGE: u8 = 10;    // 100,000 tokens

// Maximum tokens per address: 20,000 tokens (2% of total supply)
// This ensures wider participation and prevents whale dominance
pub const MAX_TOKENS_PER_ADDRESS: u64 = 20_000 * DECIMALS_MULTIPLIER;

// Cost calculation per phase:
// Phase 1: 50,000 * 0.00004 = 2 SOL
// Phase 2: 100,000 * 0.000023 = 2.3 SOL
// Phase 3: 350,000 * 0.00000857 = 3 SOL
// Phase 4: 400,000 * 0.000009 = 3.6 SOL
// Phase 5: 100,000 * 0.000015 = 1.5 SOL
// Total cost if all tokens sold: 12.4 SOL 