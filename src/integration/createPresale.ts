import { SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { derivePresaleAddress } from "../utils/pda";
import { program } from "../config/integrationConnection";
import { authorityKeypair, TOKEN_MINT } from "../constants";
import { TOKEN_AMOUNTS } from "../constants/token";
import { formatTokenAmount } from "../utils/format";

export const createPresale = async () => {
  const { presaleAddress } = await derivePresaleAddress();

  // const startTime = new anchor.BN(Math.floor(Date.now() / 1000));
  // const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 * 5); // 5 days

  try {
    console.log("Creating presale with following parameters:");
    console.log({
      tokenMint: TOKEN_MINT.toString(),
      // startTime: new Date(startTime.toNumber() * 1000).toISOString(),
      // endTime: new Date(endTime.toNumber() * 1000).toISOString(),
      maxTokensPerAddress: formatTokenAmount(TOKEN_AMOUNTS.MAX_PER_ADDRESS),
    });

    const tx = await program.methods
      .createPresale(TOKEN_MINT, TOKEN_AMOUNTS.MAX_PER_ADDRESS)
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
