import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export interface Phase {
  phaseNumber: number;
  amount: BN;
  price: BN;
  percentage: number;
  tokensSold: BN;
  tokensAvailable: BN;
  isActive: boolean;
  startTime: BN;
  endTime: BN;
}

export interface PresaleInfo {
  tokenMintAddress: PublicKey;
  totalTokenSupply: BN;
  remainingTokens: BN;
  currentPhase: number;
  phases: Phase[];
  totalTokensSold: BN;
  totalTokensDeposited: BN;
  startTime: BN;
  endTime: BN;
  maxTokenAmountPerAddress: BN;
  authority: PublicKey;
  isInitialized: boolean;
  isActive: boolean;
  isEnded: boolean;
}

export interface UserInfo {
  tokensBought: BN;
  phasePurchases: BN[];
  lastPurchaseTime: BN;
  hasClaimed: boolean;
  wallet: PublicKey;
  totalPaid: BN;
}
