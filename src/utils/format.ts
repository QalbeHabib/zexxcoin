import { BN } from "@coral-xyz/anchor";
import { TOKEN_DECIMALS, DECIMALS_MULTIPLIER } from "../constants/token";

export function toChainAmount(displayAmount: number): BN {
  return new BN(displayAmount).mul(DECIMALS_MULTIPLIER);
}

export function toDisplayAmount(chainAmount: BN): number {
  return chainAmount.div(DECIMALS_MULTIPLIER).toNumber();
}

export function formatTokenAmount(amount: BN | string | number): string {
  const bn = new BN(amount);
  const integerPart = bn.div(DECIMALS_MULTIPLIER);
  const fractionalPart = bn.mod(DECIMALS_MULTIPLIER);
  return `${integerPart.toString()}.${fractionalPart.toString().padStart(TOKEN_DECIMALS, "0")}`;
}
