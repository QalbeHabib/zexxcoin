import { getConnection, getPayer } from "./connection";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

async function requestAirdrop() {
  try {
    const connection = getConnection();
    const payer = getPayer();

    console.log("Requesting airdrop of 2 SOL...");
    const signature = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(signature);

    const balance = await connection.getBalance(payer.publicKey);
    console.log(`New balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (error) {
    console.error("Error requesting airdrop:", error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  requestAirdrop()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
