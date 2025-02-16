import { BN } from "@coral-xyz/anchor";

export const TOKEN_DECIMALS = 9;
export const DECIMALS_MULTIPLIER = new BN(10).pow(new BN(TOKEN_DECIMALS));

// Phase allocations
const PHASE_1 = new BN(50_000).mul(DECIMALS_MULTIPLIER);
const PHASE_2 = new BN(100_000).mul(DECIMALS_MULTIPLIER);
const PHASE_3 = new BN(350_000).mul(DECIMALS_MULTIPLIER);
const PHASE_4 = new BN(400_000).mul(DECIMALS_MULTIPLIER);
const PHASE_5 = new BN(100_000).mul(DECIMALS_MULTIPLIER);

export const TOKEN_AMOUNTS = {
  // Total supply is sum of all phase allocations
  TOTAL_SUPPLY: PHASE_1.add(PHASE_2).add(PHASE_3).add(PHASE_4).add(PHASE_5), // 1,000,000 tokens
  MAX_PER_ADDRESS: new BN(20_000).mul(DECIMALS_MULTIPLIER), // 2% of total supply

  // Phase allocations
  PHASE_1_ALLOCATION: PHASE_1, // 50,000 tokens (5%)
  PHASE_2_ALLOCATION: PHASE_2, // 100,000 tokens (10%)
  PHASE_3_ALLOCATION: PHASE_3, // 350,000 tokens (35%)
  PHASE_4_ALLOCATION: PHASE_4, // 400,000 tokens (40%)
  PHASE_5_ALLOCATION: PHASE_5, // 100,000 tokens (10%)
};

export const PHASE_PRICES = {
  PHASE_1: new BN(40_000), // 0.00004 SOL (2 SOL total)
  PHASE_2: new BN(23_000), // 0.000023 SOL (2.3 SOL total)
  PHASE_3: new BN(8_570), // 0.00000857 SOL (3 SOL total)
  PHASE_4: new BN(9_000), // 0.000009 SOL (3.6 SOL total)
  PHASE_5: new BN(15_000), // 0.000015 SOL (1.5 SOL total)
};
