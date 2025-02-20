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
import { getConnection, getPayer } from "../utils/connection";

async function createTokenForLiquidity() {
  try {
    // Step 1: Set up connection to Solana with better config
    const commitment: Commitment = "confirmed";
    const confirmOptions: ConfirmOptions = {
      skipPreflight: false,
      commitment,
      preflightCommitment: commitment,
      maxRetries: 5,
    };

    // Use a more reliable RPC endpoint for mainnet
    const connection = getConnection();

    const payer = getPayer();
    console.log("Using wallet address:", payer.publicKey.toString());

    // Check wallet balance first
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Wallet balance: ${balance / 1e9} SOL`);

    if (balance < 10000000) {
      throw new Error(
        "Insufficient SOL balance. Need at least 0.01 SOL to create a token."
      );
    }

    // Step 3: Define token parameters
    const mintAuthority = payer;
    const freezeAuthority = payer;
    const tokenDecimals = 9;
    const tokenSupply = 1_000_000_000 * Math.pow(10, tokenDecimals);

    // Step 4: Generate a new mint keypair
    const mintKeypair = Keypair.generate();
    console.log("Mint public key:", mintKeypair.publicKey.toString());

    // Step 5: Create the token mint with proper configuration
    console.log("Creating token mint...");
    const mint = await createMint(
      connection,
      payer,
      mintAuthority.publicKey,
      freezeAuthority.publicKey,
      tokenDecimals,
      mintKeypair,
      confirmOptions
    );
    console.log("Token mint created:", mint.toString());

    // Step 6: Create token account with proper configuration
    console.log("Creating token account...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey,
      false, // allowOwnerOffCurve
      commitment,
      confirmOptions
    );
    console.log("Token account created:", tokenAccount.address.toString());

    // Step 7: Mint tokens with proper configuration
    console.log(
      `Minting ${tokenSupply / Math.pow(10, tokenDecimals)} tokens...`
    );
    const mintSignature = await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      mintAuthority,
      tokenSupply,
      [], // multiSigners
      confirmOptions
    );
    console.log("Tokens minted successfully. Signature:", mintSignature);

    // Step 8: Set up token metadata
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

    // Step 9: Create metadata with more reliable transaction handling
    console.log("Creating token metadata...");
    const tokenMetadata = {
      name: "GULLY",
      symbol: "GULLY",
      uri: "https://gateway.pinata.cloud/ipfs/bafkreihkpieoxe66pu4kkc5a6g5vr7mpthuafkdauxlqnftgqotyr4lnkq",
      sellerFeeBasisPoints: 0,
      creators: [
        {
          address: new PublicKey(
            "12d5by8To4Uy8FoQCosAsT7V4Hz1JwDHh2Atpmod2g9X"
          ),
          verified: true,
          share: 100,
        },
      ],
      collection: null,
      uses: null,
    };

    // Create a new transaction with lower compute limits
    const metadataTransaction = new Transaction().add(
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

    // Add a recent blockhash with longer lifetime
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    metadataTransaction.recentBlockhash = blockhash;
    metadataTransaction.lastValidBlockHeight = lastValidBlockHeight;
    metadataTransaction.feePayer = payer.publicKey;

    // Send metadata transaction with higher priority fee
    const metadataTxSignature = await sendAndConfirmTransaction(
      connection,
      metadataTransaction,
      [payer],
      {
        ...confirmOptions,
        maxRetries: 10,
      }
    );
    console.log(
      "Metadata created successfully! Signature:",
      metadataTxSignature
    );

    // Step 10: Revoke mint authority with proper configuration
    console.log("Revoking mint authority...");
    const revokeMintSignature = await setAuthority(
      connection,
      payer,
      mint,
      payer,
      AuthorityType.MintTokens,
      null,
      [], // multiSigners
      confirmOptions
    );
    console.log("Mint authority revoked. Signature:", revokeMintSignature);

    // Step 11: Revoke freeze authority with proper configuration
    console.log("Revoking freeze authority...");
    const revokeFreezeSignature = await setAuthority(
      connection,
      payer,
      mint,
      payer,
      AuthorityType.FreezeAccount,
      null,
      [], // multiSigners
      confirmOptions
    );
    console.log("Freeze authority revoked. Signature:", revokeFreezeSignature);

    console.log("\n===== TOKEN CREATION SUCCESSFUL =====");
    console.log(`Token Mint Address: ${mint.toString()}`);
    console.log(`Token Metadata Address: ${metadataPDA.toString()}`);
    console.log(
      `Total Supply: ${tokenSupply / Math.pow(10, tokenDecimals)} NERV`
    );
    console.log("Mint Authority: Revoked (null)");
    console.log("Freeze Authority: Revoked (null)");

    return {
      tokenMint: mint.toString(),
      tokenAccount: tokenAccount.address.toString(),
      metadataAccount: metadataPDA.toString(),
      totalSupply: `${tokenSupply / Math.pow(10, tokenDecimals)} NERV`,
      mintAuthorityRevoked: true,
      freezeAuthorityRevoked: true,
    };
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

// Add error handling for the main execution
(async () => {
  try {
    console.log("Starting token creation process...");
    const result = await createTokenForLiquidity();
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
