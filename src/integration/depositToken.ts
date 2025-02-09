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
import { solToLamports } from "../utils/helpers";

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
        mintAccount: TOKEN_MINT, // Token mint
        // @ts-ignore
        tokenAccount: adminTokenAccount, // Admin token account
        admin: authorityKeypair.publicKey, // Admin
        toAssociatedTokenAccount: presaleTokenAccount, // Presale token account
        presaleVault, // Presale vault
        presaleInfo: presaleAddress, // Presale info

        // system programs arguments
        rent: anchor.web3.SYSVAR_RENT_PUBKEY, // Rent
        systemProgram: SystemProgram.programId, // System program
        tokenProgram: TOKEN_PROGRAM_ID, // Token program
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, // Associated token program
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
  const depositAmount = solToLamports(10);
  depositToken(depositAmount).catch(console.error);
}
