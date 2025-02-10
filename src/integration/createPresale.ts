import { SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { derivePresaleAddress } from "../utils/pda";
import { solToLamports } from "../utils/helpers";
import { program } from "../config/integrationConnection";
import { authorityKeypair, TOKEN_MINT } from "../constants";

export const createPresale = async () => {
  const { presaleAddress } = await derivePresaleAddress();

  const maxTokenAmountPerAddress = solToLamports(0.5);
  const startTime = new anchor.BN(Math.floor(Date.now() / 1000));
  const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 * 5); // 5 days
  try {
    const tx = await program.methods
      .createPresale(TOKEN_MINT, startTime, endTime, maxTokenAmountPerAddress)
      .accounts({
        // @ts-ignore
        presaleInfo: presaleAddress,
        authority: authorityKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authorityKeypair])
      .rpc();

    console.log("Presale created successfully! Transaction signature:", tx);
    console.log("Presale address:", presaleAddress.toString());

    return { tx, presaleAddress };
  } catch (error) {
    console.error("Error creating presale:", error);
    throw error;
  }
};

// Execute if running directly
if (require.main === module) {
  createPresale().catch(console.error);
}
