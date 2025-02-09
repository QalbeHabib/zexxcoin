import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const solToLamports = (solAmount: number): BN => {
  return new BN(solAmount * LAMPORTS_PER_SOL);
};

export const lamportsToSol = (lamports: BN): number => {
  return lamports.toNumber() / LAMPORTS_PER_SOL;
};

export const calculatePhaseEndTime = (
  startTime: number,
  totalDuration: number,
  phaseNumber: number
): number => {
  const phaseDuration = totalDuration / 5;
  return startTime + phaseDuration * phaseNumber;
};
