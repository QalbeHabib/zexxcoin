import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { program, connection } from "../config/integrationConnection";
import { authorityKeypair, TOKEN_MINT } from "../constants";
import { derivePresaleAddress, derivePresaleVaultAddress } from "../utils/pda";

// Helper function to convert SOL to lamports with proper BN handling
const solToLamports = (amount: number): anchor.BN => {
  // Convert to string first to handle large numbers safely
  const lamports = (amount * Math.pow(10, 9)).toString();
  return new anchor.BN(lamports);
};

export const depositToken = async (amount: anchor.BN) => {
  try {
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
      true // allow owner off curve
    );

    // Verify token balance
    const tokenBalance =
      await connection.getTokenAccountBalance(adminTokenAccount);
    if (Number(tokenBalance.value.amount) < amount.toNumber()) {
      throw new Error(
        `Insufficient token balance. Required: ${amount}, Available: ${tokenBalance.value.amount}`
      );
    }

    const tx = await program.methods
      .depositToken(amount)
      .accounts({
        mintAccount: TOKEN_MINT,
        // @ts-ignore
        tokenAccount: adminTokenAccount,
        admin: authorityKeypair.publicKey,
        toAssociatedTokenAccount: presaleTokenAccount,
        presaleVault,
        presaleInfo: presaleAddress,

        // system programs arguments
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([authorityKeypair])
      .rpc();

    console.log("Tokens deposited successfully! Transaction signature:", tx);
    return tx;
  } catch (error) {
    console.error("Error depositing tokens:", error);
    throw error;
  }
};

// Execute if running directly
if (require.main === module) {
  // Use the updated solToLamports function with a smaller test amount first
  const depositAmount = solToLamports(0); // Testing with 1000 tokens first
  depositToken(depositAmount).catch(console.error);
}
