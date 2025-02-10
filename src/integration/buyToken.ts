import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { program, connection } from "../config/integrationConnection";
import { buyerKeypair, TOKEN_MINT } from "../constants";
import { TOKEN_AMOUNTS } from "../constants/token";
import { formatTokenAmount } from "../utils/format";
import {
  derivePresaleAddress,
  derivePresaleVaultAddress,
  deriveUserInfoAddress,
} from "../utils/pda";

export const buyToken = async (amount: anchor.BN) => {
  try {
    // Derive necessary addresses
    const { presaleAddress, bump } = await derivePresaleAddress();
    const { presaleVault } = await derivePresaleVaultAddress();
    const userInfoAddress = await deriveUserInfoAddress();

    // Get or create buyer's token account
    const buyerTokenAccount = await getAssociatedTokenAddressSync(
      TOKEN_MINT,
      buyerKeypair.publicKey
    );

    // Create buyer's token account if it doesn't exist
    try {
      const acctInfo =
        await program.provider.connection.getAccountInfo(buyerTokenAccount);
      if (!acctInfo) {
        console.log("Creating buyer's token account...");
        const ix = createAssociatedTokenAccountInstruction(
          buyerKeypair.publicKey,
          buyerTokenAccount,
          buyerKeypair.publicKey,
          TOKEN_MINT
        );
        await program.provider.sendAndConfirm!(
          new anchor.web3.Transaction().add(ix),
          [buyerKeypair]
        );
        console.log("Created buyer's token account");
      }
    } catch (e) {
      console.log("Error checking/creating token account:", e);
    }

    // Get presale token account
    const presaleTokenAccount = await getAssociatedTokenAddressSync(
      TOKEN_MINT,
      presaleAddress,
      true // allow owner off curve
    );

    console.log("Buying tokens with following details:");
    console.log({
      amount: formatTokenAmount(amount),
      rawAmount: amount.toString(),
      buyer: buyerKeypair.publicKey.toString(),
      userInfo: userInfoAddress.toString(),
      presaleAddress: presaleAddress.toString(),
      presaleVault: presaleVault.toString(),
      buyerTokenAccount: buyerTokenAccount.toString(),
      presaleTokenAccount: presaleTokenAccount.toString(),
    });

    // Execute the buy token transaction
    const tx = await program.methods
      .buyToken(amount)
      .accounts({
        // @ts-ignore
        presaleInfo: presaleAddress,
        userInfo: userInfoAddress,
        presaleVault,
        buyer: buyerKeypair.publicKey,
        buyerTokenAccount,
        presaleTokenAccount,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([buyerKeypair])
      .rpc();

    console.log("Transaction successful! Details:");
    console.log("- Transaction signature:", tx);
    console.log("- Amount purchased:", formatTokenAmount(amount));

    // Fetch updated user info
    const userInfo = await program.account.userInfo.fetch(userInfoAddress);
    console.log("Updated user info:");
    console.log({
      tokensBought: formatTokenAmount(userInfo.tokensBought),
      phasePurchases: userInfo.phasePurchases.map((p) => formatTokenAmount(p)),
      lastPurchaseTime: new Date(
        userInfo.lastPurchaseTime.toNumber() * 1000
      ).toISOString(),
      hasClaimed: userInfo.hasClaimed,
      totalPaid: `${userInfo.totalPaid.toString()} lamports`,
    });

    return {
      tx,
      userInfo,
      presaleAddress,
      userInfoAddress,
    };
  } catch (error) {
    console.error("Error buying tokens:");
    if (error instanceof Error) {
      console.error("- Error message:", error.message);
      if ("logs" in error) {
        console.error("- Program logs:", (error as any).logs);
      }
    } else {
      console.error("- Unknown error:", error);
    }
    throw error;
  }
};

// Execute if running directly
if (require.main === module) {
  // Example: Buy 10 tokens (will be multiplied by decimals)
  const purchaseAmount = new anchor.BN(1).mul(new anchor.BN(10 ** 9)); // 9 decimals
  console.log(
    "Attempting to purchase",
    formatTokenAmount(purchaseAmount),
    "tokens..."
  );

  buyToken(purchaseAmount)
    .then((result) => {
      console.log("Purchase completed successfully!");
    })
    .catch((error) => {
      console.error("Purchase failed:", error);
      process.exit(1);
    });
}
