import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import dotenv from "dotenv";

dotenv.config();

// Program and Token Constants
export const PROGRAM_ID = new anchor.web3.PublicKey(
  "4NiRZQQ5Rgsoy2zZ7SWAJAvbCuimUH1nY1nwCFKnfPtz"
);
export const TOKEN_MINT = new anchor.web3.PublicKey(
  "Ah1hf7NZgBhgnhFsrXLoj7czMMiVwUaCHnc5bP9wB6Ge"
);

// Load authority keypair from file
const adminKeypair = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../keypair.json"), "utf-8")
);
export const authorityKeypair = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array(adminKeypair)
);

// Load buyer keypair from environment
const buyerPrivateKey = process.env.BUYER_PRIVATE_KEY;
if (!buyerPrivateKey) {
  throw new Error("Missing BUYER_PRIVATE_KEY in .env file");
}
export const buyerKeypair = anchor.web3.Keypair.fromSecretKey(
  bs58.decode(buyerPrivateKey)
);
