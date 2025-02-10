import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Generate a new keypair
const programKeypair = Keypair.generate();

// Save the keypair to a JSON file
const programKeyFile = path.join(
  __dirname,
  "../quantcoin_presale-keypair.json"
);

// Ensure the directory exists
const dir = path.dirname(programKeyFile);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Save the secret key
fs.writeFileSync(
  programKeyFile,
  `[${Buffer.from(programKeypair.secretKey.toString())}]`
);

// Also save the public key for easy reference
const publicKeyFile = path.join(__dirname, "../program-id.txt");
fs.writeFileSync(publicKeyFile, programKeypair.publicKey.toString());

console.log("Generated new program keypair:");
console.log("Program ID:", programKeypair.publicKey.toString());
console.log("Keypair saved to:", programKeyFile);
console.log("Program ID saved to:", publicKeyFile);
console.log("\nPlease update the following files with the new Program ID:");
console.log("1. programs/constants/src/lib.rs");
console.log("2. Anchor.toml");
console.log("3. src/constants/index.ts");
