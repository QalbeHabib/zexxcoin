import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { program } from "../config/integrationConnection";
import { buyerKeypair, TOKEN_MINT } from "../constants";
import { derivePresaleAddress, deriveUserInfoAddress } from "../utils/pda";

export const claimToken = async () => {
  try {
    const { presaleAddress, bump } = await derivePresaleAddress();
    const userInfoAddress = await deriveUserInfoAddress();

    // Get token accounts
    const tokenAccount = await getAssociatedTokenAddressSync(
      TOKEN_MINT,
      buyerKeypair.publicKey
    );

    const presaleTokenAccount = await getAssociatedTokenAddressSync(
      TOKEN_MINT,
      presaleAddress,
      true
    );

    const tx = await program.methods
      .claimToken(bump)
      .accounts({
        tokenMint: TOKEN_MINT, // Token mint
        // @ts-ignore
        tokenAccount, // Token account
        presaleAssociatedTokenAccount: presaleTokenAccount, // Presale token account
        userInfo: userInfoAddress, // User info PDA
        presaleInfo: presaleAddress, // Presale info PDA
        buyer: buyerKeypair.publicKey, // Buyer
        rent: SYSVAR_RENT_PUBKEY, // Rent
        systemProgram: SystemProgram.programId, // System program
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, // Associated token program
        tokenProgram: TOKEN_PROGRAM_ID, // Token program
      })
      .signers([buyerKeypair])
      .rpc();

    console.log("Tokens claimed successfully! Transaction signature:", tx);
    return tx;
  } catch (error) {
    console.error("Error claiming tokens:", error);
    throw error;
  }
};

// Execute if running directly
if (require.main === module) {
  claimToken().catch(console.error);
}
