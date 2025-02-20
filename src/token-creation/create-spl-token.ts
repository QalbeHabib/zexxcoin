import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  DataV2,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import fs from "fs";
import bs58 from "bs58";

import { TOKEN_CONFIG } from "src/config/token-config";
import { getConnection, getPayer } from "../utils/connection";

async function createTokenWithMetadata() {
  try {
    // Step 1: Set up connection to Solana
    const connection = getConnection();
    const payer = getPayer();

    console.log("Using wallet address:", payer.publicKey.toString());
    // Step 3: Create a new mint authority
    const mintAuthority = payer;
    const freezeAuthority = payer;

    // Step 4: Define token parameters
    const tokenDecimals = 9;
    const tokenSupply = 1_000_000_000 * Math.pow(10, tokenDecimals);

    // Step 5: Generate a new mint keypair
    const mintKeypair = Keypair.generate();
    console.log("Mint public key:", mintKeypair.publicKey.toString());

    // Step 6: Create the token mint
    console.log("Creating token mint...");
    const mint = await createMint(
      connection,
      payer,
      mintAuthority.publicKey,
      freezeAuthority.publicKey,
      tokenDecimals
    );
    console.log("Token mint created:", mint.toString());

    // Step 7: Get or create associated token account for the payer
    console.log("Creating token account...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    console.log("Token account created:", tokenAccount.address.toString());

    // Step 8: Mint the full supply to the payer's token account
    console.log(
      `Minting ${tokenSupply / Math.pow(10, tokenDecimals)} tokens to ${payer.publicKey.toString()}...`
    );
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      mintAuthority,
      tokenSupply
    );
    console.log("Tokens minted successfully.");

    // Step 9: Set up token metadata
    console.log("Setting up token metadata...");
    const tokenMetadata = {
      name: "Testing quant",
      symbol: "TQ",
      uri: "https://gateway.pinata.cloud/ipfs/QmdMuTmqpkqZKSsL7LwVVPGCj83S4Xg6b1FNt5ugRXW6Vs",
      sellerFeeBasisPoints: 0,
      creators: [
        {
          address: payer.publicKey,
          verified: true,
          share: 100,
        },
      ],
      collection: null,
      uses: null,
    };

    // Step 10: Derive the metadata account PDA
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const metadataPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
    console.log("Metadata account address:", metadataPDA.toString());

    // Step 11: Create metadata account instruction
    const transaction = new Transaction().add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mint,
          mintAuthority: payer.publicKey,
          payer: payer.publicKey,
          updateAuthority: payer.publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: tokenMetadata,
            isMutable: true,
            collectionDetails: null,
          },
        },
        TOKEN_METADATA_PROGRAM_ID
      )
    );

    // Step 12: Send and confirm the transaction
    console.log("Creating token metadata...");
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log("Token metadata created successfully!");
    console.log("Transaction signature:", txSignature);

    // Step 13: Return token information
    return {
      tokenMint: mint.toString(),
      tokenAccount: tokenAccount.address.toString(),
      metadataAccount: metadataPDA.toString(),
      txSignature,
    };
  } catch (error) {
    console.error("Error creating token with metadata:", error);
    throw error;
  }
}

// Execute the function
createTokenWithMetadata()
  .then((result) => {
    console.log("Token creation complete!");
    console.log(result);
  })
  .catch((error) => {
    console.error("Failed to create token:", error);
  });
