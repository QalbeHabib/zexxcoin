import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { program } from "../config/integrationConnection";
import { buyerKeypair, TOKEN_MINT } from "../constants";
import {
  derivePresaleAddress,
  derivePresaleVaultAddress,
  deriveUserInfoAddress,
} from "../utils/pda";
import { solToLamports } from "../utils/helpers";

export const buyToken = async (amount: anchor.BN) => {
  try {
    const { presaleAddress } = await derivePresaleAddress();
    const { presaleVault } = await derivePresaleVaultAddress();
    const userInfoAddress = await deriveUserInfoAddress();

    // Get buyer's token account
    const buyerTokenAccount = await getAssociatedTokenAddressSync(
      TOKEN_MINT,
      buyerKeypair.publicKey
    );

    // Get presale token account
    const presaleTokenAccount = await getAssociatedTokenAddressSync(
      TOKEN_MINT,
      presaleAddress,
      true
    );

    console.log({
      presaleAddress,
      presaleVault,
      userInfoAddress,
      buyerTokenAccount,
      presaleTokenAccount,
    });
    const tx = await program.methods
      .buyToken(amount)
      .accounts({
        // @ts-ignore
        presaleInfo: presaleAddress, // Presale info PDA
        userInfo: userInfoAddress, // User info PDA
        presaleVault, // Presale vault PDA
        buyer: buyerKeypair.publicKey, // Buyer
        buyerTokenAccount, // Buyer token account
        presaleTokenAccount, // Presale token account
        rent: SYSVAR_RENT_PUBKEY, // Rent
        systemProgram: SystemProgram.programId, // System program
        tokenProgram: TOKEN_PROGRAM_ID, // Token program
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, // Associated token program
      })
      .signers([buyerKeypair])
      .rpc();

    console.log("Tokens purchased successfully! Transaction signature:", tx);
    return tx;
  } catch (error) {
    console.error("Error buying tokens:", error);
    throw error;
  }
};

// Execute if running directly
if (require.main === module) {
  const purchaseAmount = solToLamports(1);
  buyToken(purchaseAmount).catch(console.error);
}
