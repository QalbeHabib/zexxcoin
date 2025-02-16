import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { program, connection } from "../config/integrationConnection";
import { authorityKeypair, TOKEN_MINT } from "../constants";
import { TOKEN_AMOUNTS } from "../constants/token";
import { formatTokenAmount } from "../utils/format";
import { derivePresaleAddress, derivePresaleVaultAddress } from "../utils/pda";

// Helper function to convert SOL to lamports with proper BN handling
const solToLamports = (amount: number): anchor.BN => {
  // Convert to string first to handle large numbers safely
  const lamports = (amount * Math.pow(10, 9)).toString();
  return new anchor.BN(lamports);
};

export const depositToken = async () => {
  try {
    // Using the total supply from constants
    const depositAmount = TOKEN_AMOUNTS.TOTAL_SUPPLY;

    const { presaleAddress } = await derivePresaleAddress();
    const { presaleVault } = await derivePresaleVaultAddress();

    // Get token accounts
    const adminTokenAccount = await getAssociatedTokenAddressSync(
      TOKEN_MINT,
      authorityKeypair.publicKey
    );

    const presaleTokenAccount = await getAssociatedTokenAddressSync(
      TOKEN_MINT,
      presaleAddress,
      true
    );

    // Verify token balance
    const tokenBalance =
      await connection.getTokenAccountBalance(adminTokenAccount);
    console.log(
      "Current admin token balance:",
      formatTokenAmount(tokenBalance.value.amount)
    );

    if (new anchor.BN(tokenBalance.value.amount).lt(depositAmount)) {
      throw new Error(
        `Insufficient token balance. Required: ${formatTokenAmount(depositAmount)}, Available: ${formatTokenAmount(tokenBalance.value.amount)}`
      );
    }

    console.log("Depositing tokens with following details:");
    console.log({
      amount: formatTokenAmount(depositAmount),
      rawAmount: depositAmount.toString(),
      adminTokenAccount: adminTokenAccount.toString(),
      presaleTokenAccount: presaleTokenAccount.toString(),
      presaleAddress: presaleAddress.toString(),
      presaleVault: presaleVault.toString(),
    });

    const tx = await program.methods
      .depositToken(depositAmount)
      .accounts({
        mintAccount: TOKEN_MINT,
        // @ts-ignore
        tokenAccount: adminTokenAccount,
        admin: authorityKeypair.publicKey,
        toAssociatedTokenAccount: presaleTokenAccount,
        presaleVault,
        presaleInfo: presaleAddress,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([authorityKeypair])
      .rpc();

    console.log("Tokens deposited successfully!");
    console.log("Transaction signature:", tx);

    // Verify the deposit
    const newBalance =
      await connection.getTokenAccountBalance(presaleTokenAccount);
    console.log(
      "Presale token account balance after deposit:",
      formatTokenAmount(newBalance.value.amount)
    );

    return tx;
  } catch (error) {
    console.error("Error depositing tokens:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if ("logs" in error) {
        console.error("Program logs:", (error as any).logs);
      }
    }
    throw error;
  }
};

// Execute if running directly
if (require.main === module) {
  console.log("Starting token deposit...");
  depositToken()
    .then(() => {
      console.log("Deposit completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Deposit failed:", error);
      process.exit(1);
    });
}
