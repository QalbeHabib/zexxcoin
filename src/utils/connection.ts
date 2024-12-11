import { Connection, Keypair } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

export const getConnection = () => {
  const endpoint =
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  return new Connection(endpoint, "confirmed");
};

export const getPayer = (): Keypair => {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not found in environment variables");
  }

  // Convert private key string to Uint8Array
  const privateKeyBytes = new Uint8Array(
    privateKey.split(",").map((num) => parseInt(num))
  );

  return Keypair.fromSecretKey(privateKeyBytes);
};
