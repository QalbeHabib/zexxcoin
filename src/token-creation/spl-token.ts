import {
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  Commitment,
  ConfirmOptions,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
} from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import pinataSDK, { PinataPinResponse } from "@pinata/sdk";
import fs from "fs";
import path from "path";
import { getConnection, getPayer } from "../utils/connection";

// Define types for utility functions
type Connection = import("@solana/web3.js").Connection;
type Payer = Keypair;

// Initialize Pinata Client with environment variables
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

// Interface for metadata
interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  decimals: number;
  attributes: { trait_type: string; value: string }[];
  properties: {
    files: { uri: string; type: string }[];
    category: string;
    creators: { address: string; share: number }[];
  };
  external_url: string;
}

// Interface for the returned token creation result
interface TokenCreationResult {
  tokenMint: string;
  tokenAccount: string;
  metadataAccount: string;
  metadataUri: string;
  totalSupply: string;
  mintAuthorityRevoked: boolean;
  freezeAuthorityRevoked: boolean;
}

// Interface for the stored token details
interface TokenDetails {
  tokenName: string;
  tokenSymbol: string;
  timestamp: string;
  payerPublicKey: string;
  mintKeypair: {
    publicKey: string;
    secretKey: string; // Base58 encoded
  };
  tokenMint: string;
  tokenAccount: string;
  metadataAccount: string;
  metadataUri: string;
  totalSupply: string;
  mintAuthorityRevoked: boolean;
  freezeAuthorityRevoked: boolean;
  transactionSignatures: {
    mint: string;
    metadata: string;
    revokeMintAuthority: string;
    revokeFreezeAuthority: string;
  };
}

// Function to save token details to a JSON file
function saveTokenDetails(details: TokenDetails): void {
  const timestamp = new Date(details.timestamp).getTime();
  const fileName = `token-details-${details.tokenName}-${details.tokenSymbol}-${timestamp}.json`;
  const filePath = path.resolve(`${__dirname}/createdTokens`, fileName);
  fs.writeFileSync(filePath, JSON.stringify(details, null, 2), "utf8");
  console.log(`Token details saved to: ${filePath}`);
}

// Function to upload an image file to Pinata
async function uploadImageToPinata(imagePath: string): Promise<string> {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at: ${imagePath}`);
    }
    const readableStream = fs.createReadStream(imagePath);
    const result: PinataPinResponse = await pinata.pinFileToIPFS(
      readableStream,
      {
        pinataMetadata: {
          name: path.basename(imagePath),
        },
      }
    );
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw error;
  }
}

// Function to upload metadata JSON to Pinata
async function uploadMetadataToPinata(
  metadata: TokenMetadata
): Promise<string> {
  try {
    const result: PinataPinResponse = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `${metadata.name}_metadata.json`,
      },
    });
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    throw error;
  }
}

async function createTokenForLiquidity(): Promise<TokenCreationResult> {
  try {
    // Step 1: Set up connection to Solana
    const commitment: Commitment = "confirmed";
    const confirmOptions: ConfirmOptions = {
      skipPreflight: false,
      commitment,
      preflightCommitment: commitment,
      maxRetries: 5,
    };

    const connection: Connection = getConnection();
    const payer: Payer = getPayer();
    console.log("Using wallet address:", payer.publicKey.toString());

    // Check wallet balance
    const balance: number = await connection.getBalance(payer.publicKey);
    console.log(`Wallet balance: ${balance / 1e9} SOL`);
    if (balance < 10000000) {
      throw new Error("Insufficient SOL balance. Need at least 0.01 SOL.");
    }

    // Step 2: Define token parameters
    const mintAuthority: Payer = payer;
    const freezeAuthority: Payer = payer;
    const tokenDecimals: number = 9;
    const tokenSupply: number = 1_000_000_000 * Math.pow(10, tokenDecimals);

    // Step 3: Generate a new mint keypair
    const mintKeypair: Keypair = Keypair.generate();
    console.log("Mint public key:", mintKeypair.publicKey.toString());

    // Step 4: Create the token mint
    console.log("Creating token mint...");
    const mint: PublicKey = await createMint(
      connection,
      payer,
      mintAuthority.publicKey,
      freezeAuthority.publicKey,
      tokenDecimals,
      mintKeypair,
      confirmOptions
    );
    console.log("Token mint created:", mint.toString());

    // Step 5: Create token account
    console.log("Creating token account...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey,
      false,
      commitment,
      confirmOptions
    );
    console.log("Token account created:", tokenAccount.address.toString());

    // Step 6: Mint tokens
    console.log(
      `Minting ${tokenSupply / Math.pow(10, tokenDecimals)} tokens...`
    );
    const mintSignature: string = await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      mintAuthority,
      tokenSupply,
      [],
      confirmOptions
    );
    console.log("Tokens minted successfully. Signature:", mintSignature);

    // Step 7: Upload image to Pinata
    console.log("Uploading token image to Pinata...");
    const imagePath: string = path.resolve(__dirname, "tokenImage.png");
    console.log({
      imagePath,
    });

    const imageUri: string = await uploadImageToPinata(imagePath);
    console.log("Image uploaded to Pinata. URI:", imageUri);

    // Step 8: Prepare and upload metadata to Pinata
    console.log("Preparing and uploading metadata to Pinata...");
    const metadata: TokenMetadata = {
      name: "$DEVDEAD",
      symbol: "DDT",
      description:
        "$DEVDEAD is the first memecoin that fully embraces the anxiety, chaos, and excitement of crypto trading.",
      image: imageUri,
      decimals: 9,
      attributes: [
        { trait_type: "Creator", value: "DevDead Community" },
        { trait_type: "Website", value: "https://www.devdead.vip/" },
        { trait_type: "Twitter", value: "https://x.com/devdead_vip" },
        { trait_type: "Telegram", value: "https://t.me/devdead_vip" },
      ],
      properties: {
        files: [
          {
            uri: imageUri,
            type: "image/png",
          },
        ],
        category: "image",
        creators: [{ address: payer.publicKey.toString(), share: 100 }],
      },
      external_url: "https://www.devdead.vip/",
    };

    const metadataUri: string = await uploadMetadataToPinata(metadata);
    console.log("Metadata uploaded to Pinata. URI:", metadataUri);

    // Step 9: Set up token metadata
    const TOKEN_METADATA_PROGRAM_ID: PublicKey = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const metadataPDA: PublicKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
    console.log("Metadata account address:", metadataPDA.toString());

    // Step 10: Create metadata on-chain
    console.log("Creating token metadata...");
    const tokenMetadata = {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
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

    const metadataTransaction: Transaction = new Transaction().add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint,
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

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    metadataTransaction.recentBlockhash = blockhash;
    metadataTransaction.lastValidBlockHeight = lastValidBlockHeight;
    metadataTransaction.feePayer = payer.publicKey;

    const metadataTxSignature: string = await sendAndConfirmTransaction(
      connection,
      metadataTransaction,
      [payer],
      { ...confirmOptions, maxRetries: 10 }
    );
    console.log(
      "Metadata created successfully! Signature:",
      metadataTxSignature
    );

    // Step 11: Revoke mint authority
    console.log("Revoking mint authority...");
    const revokeMintSignature: string = await setAuthority(
      connection,
      payer,
      mint,
      payer,
      AuthorityType.MintTokens,
      null,
      [],
      confirmOptions
    );
    console.log("Mint authority revoked. Signature:", revokeMintSignature);

    // Step 12: Revoke freeze authority
    console.log("Revoking freeze authority...");
    const revokeFreezeSignature: string = await setAuthority(
      connection,
      payer,
      mint,
      payer,
      AuthorityType.FreezeAccount,
      null,
      [],
      confirmOptions
    );
    console.log("Freeze authority revoked. Signature:", revokeFreezeSignature);

    // Step 13: Prepare token details for storage
    const timestamp: string = new Date().toISOString();
    const tokenDetails: TokenDetails = {
      tokenName: metadata.name,
      tokenSymbol: metadata.symbol,
      timestamp,
      payerPublicKey: payer.publicKey.toString(),
      mintKeypair: {
        publicKey: mintKeypair.publicKey.toString(),
        secretKey: Buffer.from(mintKeypair.secretKey).toString("base64"),
      },
      tokenMint: mint.toString(),
      tokenAccount: tokenAccount.address.toString(),
      metadataAccount: metadataPDA.toString(),
      metadataUri,
      totalSupply: `${tokenSupply / Math.pow(10, tokenDecimals)} ${metadata.symbol}`,
      mintAuthorityRevoked: true,
      freezeAuthorityRevoked: true,
      transactionSignatures: {
        mint: mintSignature,
        metadata: metadataTxSignature,
        revokeMintAuthority: revokeMintSignature,
        revokeFreezeAuthority: revokeFreezeSignature,
      },
    };

    // Step 14: Save token details to JSON file
    saveTokenDetails(tokenDetails);

    console.log("\n===== TOKEN CREATION SUCCESSFUL =====");
    console.log(`Token Mint Address: ${mint.toString()}`);
    console.log(`Token Metadata Address: ${metadataPDA.toString()}`);
    console.log(`Metadata URI: ${metadataUri}`);
    console.log(
      `Total Supply: ${tokenSupply / Math.pow(10, tokenDecimals)} ${metadata.symbol}`
    );
    console.log("Mint Authority: Revoked (null)");
    console.log("Freeze Authority: Revoked (null)");

    return {
      tokenMint: mint.toString(),
      tokenAccount: tokenAccount.address.toString(),
      metadataAccount: metadataPDA.toString(),
      metadataUri,
      totalSupply: `${tokenSupply / Math.pow(10, tokenDecimals)} ${metadata.symbol}`,
      mintAuthorityRevoked: true,
      freezeAuthorityRevoked: true,
    };
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

// Main execution
(async (): Promise<void> => {
  try {
    console.log("Starting token creation process...");
    const result: TokenCreationResult = await createTokenForLiquidity();
    console.log("Token creation complete and ready for DEX listing!");
    console.log(result);

    console.log("\nNext steps for Raydium listing:");
    console.log("1. Go to https://raydium.io/liquidity/");
    console.log("2. Connect your wallet");
    console.log(
      `3. Create a new pool with your token (${result.tokenMint}) and SOL/USDC`
    );
    console.log("4. Set your desired price and liquidity amount");
    console.log("5. Confirm the transaction to complete the listing");
  } catch (error) {
    console.error("Token creation failed:", error);
    process.exit(1);
  }
})();
