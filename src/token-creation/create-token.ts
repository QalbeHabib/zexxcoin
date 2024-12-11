import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { getConnection, getPayer } from "../utils/connection";
import { TOKEN_CONFIG } from "../config/token-config";

async function createTokenWithMetadata() {
  try {
    const connection = getConnection();
    const payer = getPayer();

    console.log("Creating token mint...");
    // 1. Create the token mint
    const mint = await createMint(
      connection,
      payer, // Payer
      payer.publicKey, // Mint Authority
      payer.publicKey, // Freeze Authority (you can use null to disable)
      TOKEN_CONFIG.decimals,
      undefined, // Skip keypair generation
      undefined, // Skip confirmation options
      TOKEN_PROGRAM_ID // Use default TOKEN_PROGRAM_ID
    );
    console.log(`Token Mint Created: ${mint.toBase58()}`);

    // 2. Create Associated Token Account for the payer
    console.log("Creating token account...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    console.log(`Token Account: ${tokenAccount.address.toBase58()}`);

    // 3. Mint initial supply
    console.log("Minting initial supply...");
    const initialSupplyWithDecimals =
      TOKEN_CONFIG.initialSupply * 10 ** TOKEN_CONFIG.decimals;
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer,
      initialSupplyWithDecimals
    );
    console.log(
      `Minted ${TOKEN_CONFIG.initialSupply} tokens to ${tokenAccount.address.toBase58()}`
    );

    // 4. Create metadata
    console.log("Creating token metadata...");
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    const metadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAddress,
        mint: mint,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: TOKEN_CONFIG.name,
            symbol: TOKEN_CONFIG.symbol,
            uri: TOKEN_CONFIG.image,
            sellerFeeBasisPoints: TOKEN_CONFIG.sellerFeeBasisPoints,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: !TOKEN_CONFIG.disableMintingAfterInit,
          collectionDetails: null,
        },
      }
    );

    const transaction = new Transaction().add(metadataInstruction);
    await sendAndConfirmTransaction(connection, transaction, [payer]);
    console.log(`Metadata account created: ${metadataAddress.toBase58()}`);

    // Print summary
    console.log("\nToken Creation Summary:");
    console.log("----------------------");
    console.log(`Token Mint: ${mint.toBase58()}`);
    console.log(`Token Account: ${tokenAccount.address.toBase58()}`);
    console.log(`Metadata Account: ${metadataAddress.toBase58()}`);
    console.log(`Initial Supply: ${TOKEN_CONFIG.initialSupply}`);
    console.log(`Decimals: ${TOKEN_CONFIG.decimals}`);

    return {
      mint: mint.toBase58(),
      tokenAccount: tokenAccount.address.toBase58(),
      metadataAddress: metadataAddress.toBase58(),
    };
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  createTokenWithMetadata()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
