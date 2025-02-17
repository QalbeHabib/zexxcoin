import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import dotenv from "dotenv";

import idl from "../../target/idl/zexxcoin_presale.json";

dotenv.config();

// Program and Token Constants
// export const PROGRAM_ID = new anchor.web3.PublicKey(
//   "8ompjc6TQod7opwxixVJS3WFqDZkKRvscMa7pu1VAgVx"
// );

const ProgramId = idl.address;

export const PROGRAM_ID = new anchor.web3.PublicKey(ProgramId);

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

console.log({
  adminKeypair: authorityKeypair.publicKey.toBase58(),
  buyerKeypair: buyerKeypair.publicKey.toBase58(),
  authorityPrivateKey: bs58.encode(authorityKeypair.secretKey),
  TOKEN_MINT: TOKEN_MINT.toBase58(),
  PROGRAM_ID: PROGRAM_ID.toBase58(),
});
