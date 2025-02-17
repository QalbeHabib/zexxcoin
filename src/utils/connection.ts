import { Connection, Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
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

  try {
    // First try base58 format
    const decodedKey = bs58.default.decode(privateKey);
    return Keypair.fromSecretKey(decodedKey);
  } catch (e) {
    // If base58 fails, try comma-separated format
    try {
      const privateKeyBytes = new Uint8Array(
        privateKey.split(",").map((num) => parseInt(num))
      );
      return Keypair.fromSecretKey(privateKeyBytes);
    } catch (e2) {
      throw new Error(
        "Invalid private key format. Must be either base58 or comma-separated numbers."
      );
    }
  }
};
