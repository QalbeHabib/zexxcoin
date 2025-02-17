import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { getConnection, getPayer } from "../utils/connection";
import * as fs from "fs";
import * as path from "path";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
}

async function uploadToArweave(
  imagePath: string,
  name: string,
  symbol: string,
  description: string,
  isDevnet: boolean = true,
  metadataFilePath?: string
) {
  try {
    // If using devnet, return temporary metadata
    if (isDevnet) {
      console.log("Using devnet mode with temporary metadata...");

      // Load metadata from default location or custom path
      let metadata: TokenMetadata;
      const defaultMetadataPath = path.join(
        __dirname,
        "../config/token-metadata.json"
      );
      const metadataPath = metadataFilePath || defaultMetadataPath;

      if (fs.existsSync(metadataPath)) {
        console.log("Loading metadata from:", metadataPath);
        const metadataContent = fs.readFileSync(metadataPath, "utf8");
        metadata = JSON.parse(metadataContent);
        // Update basic fields
        metadata.name = name;
        metadata.symbol = symbol;
        metadata.description = description;
        metadata.image = "https://placehold.co/600x400?text=Token+Image";
        if (metadata.properties?.files) {
          metadata.properties.files[0].uri = metadata.image;
        }
      } else {
        metadata = {
          name,
          symbol,
          description,
          image: "https://placehold.co/600x400?text=Token+Image",
          attributes: [
            {
              trait_type: "Category",
              value: "Token",
            },
          ],
          properties: {
            files: [
              {
                uri: "https://placehold.co/600x400?text=Token+Image",
                type: "image/png",
              },
            ],
            category: "image",
          },
        };
      }

      // Create temporary metadata JSON
      const metadataJson = JSON.stringify(metadata, null, 2);
      console.log("\nTemporary metadata for testing:");
      console.log(metadataJson);

      return {
        imageUri: metadata.image,
        metadataUri: "https://placehold.co/metadata.json",
      };
    }

    // For mainnet, proceed with actual Arweave upload
    const absoluteImagePath = path.resolve(process.cwd(), imagePath);
    console.log("Looking for image at:", absoluteImagePath);

    if (!fs.existsSync(absoluteImagePath)) {
      throw new Error(`Image file not found at: ${absoluteImagePath}`);
    }

    const connection = getConnection();
    const payer = getPayer();

    // Initialize Metaplex with Bundlr
    console.log("Initializing Metaplex with Bundlr...");
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
      .use(
        bundlrStorage({
          address: "https://node1.bundlr.network",
          providerUrl: connection.rpcEndpoint,
          timeout: 60000,
        })
      );

    // Read image file for size estimation
    console.log("Reading image file for cost estimation...");
    const imageBuffer = fs.readFileSync(absoluteImagePath);
    const imageFile = await toMetaplexFile(
      imageBuffer,
      path.basename(imagePath)
    );

    // Load metadata from default location or custom path
    let metadata: TokenMetadata;
    const defaultMetadataPath = path.join(
      __dirname,
      "../config/token-metadata.json"
    );
    const metadataPath = metadataFilePath || defaultMetadataPath;

    if (fs.existsSync(metadataPath)) {
      console.log("Loading metadata from:", metadataPath);
      const metadataContent = fs.readFileSync(metadataPath, "utf8");
      metadata = JSON.parse(metadataContent);
      // Update basic fields
      metadata.name = name;
      metadata.symbol = symbol;
      metadata.description = description;

      // Update creator address if not set
      if (metadata.properties?.creators) {
        metadata.properties.creators[0].address = payer.publicKey.toString();
      }
    } else {
      metadata = {
        name,
        symbol,
        description,
        image: "placeholder",
        attributes: [
          {
            trait_type: "Category",
            value: "Token",
          },
        ],
        properties: {
          files: [
            {
              uri: "placeholder",
              type: "image/png",
            },
          ],
          category: "image",
          creators: [
            {
              address: payer.publicKey.toString(),
              share: 100,
            },
          ],
        },
      };
    }

    // Estimate storage costs
    console.log("Estimating storage costs...");
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const metadataFile = await toMetaplexFile(metadataBuffer, "metadata.json");

    const [imageCost, metadataCost] = await Promise.all([
      metaplex.storage().getUploadPriceForFile(imageFile),
      metaplex.storage().getUploadPriceForFile(metadataFile),
    ]);
    const totalCost = imageCost.basisPoints.add(metadataCost.basisPoints);

    console.log("\nStorage Cost Estimation:");
    console.log("------------------------");
    console.log(
      `Image (${imageBuffer.length} bytes): ${imageCost.basisPoints.toNumber() / LAMPORTS_PER_SOL} SOL`
    );
    console.log(
      `Metadata (${metadataBuffer.length} bytes): ${metadataCost.basisPoints.toNumber() / LAMPORTS_PER_SOL} SOL`
    );
    console.log(`Total cost: ${totalCost.toNumber() / LAMPORTS_PER_SOL} SOL`);

    // Check wallet balance
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`\nWallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance < totalCost.toNumber()) {
      throw new Error(
        `Not enough SOL in wallet. Need ${totalCost.toNumber() / LAMPORTS_PER_SOL} SOL for storage fees, but wallet only has ${balance / LAMPORTS_PER_SOL} SOL`
      );
    }

    // Proceed with upload if balance is sufficient
    console.log("\nUploading image to Arweave...");
    const imageUri = await metaplex.storage().upload(imageFile);
    console.log("Image uploaded:", imageUri);

    // Update metadata with uploaded image URI
    metadata.image = imageUri;
    if (metadata.properties?.files) {
      metadata.properties.files[0].uri = imageUri;
    }

    console.log("Uploading metadata to Arweave...");
    const finalMetadataBuffer = Buffer.from(JSON.stringify(metadata));
    const finalMetadataFile = await toMetaplexFile(
      finalMetadataBuffer,
      "metadata.json"
    );
    const metadataUri = await metaplex.storage().upload(finalMetadataFile);
    console.log("Metadata uploaded:", metadataUri);

    return {
      imageUri,
      metadataUri,
    };
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if ("logs" in error) {
        console.error("Program logs:", (error as any).logs);
      }
    }
    throw error;
  }
}

// Update the CLI handling
if (require.main === module) {
  if (process.argv.length < 6) {
    console.log(`
Usage: ts-node src/token-creation/upload-to-arweave.ts <image-path> "<name>" "<symbol>" "<description>" [mainnet] [--metadata-file=<path>]

Examples:
# Basic usage (devnet):
ts-node src/token-creation/upload-to-arweave.ts devdots.png "DevDots" "DTS" "DevDots Meme token"

# With custom metadata (devnet):
ts-node src/token-creation/upload-to-arweave.ts devdots.png "DevDots" "DTS" "DevDots Meme token" --metadata-file=./metadata.json

# Mainnet with custom metadata:
ts-node src/token-creation/upload-to-arweave.ts devdots.png "DevDots" "DTS" "DevDots Meme token" mainnet --metadata-file=./metadata.json

Note: 
1. The image path is relative to the project root directory
2. For mainnet uploads, you need sufficient SOL for storage fees
3. Custom metadata file is optional but recommended for social links
    `);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const [imagePath, name, symbol, description, ...rest] = args;
  const isMainnet = rest.includes("mainnet");
  const metadataFilePath = rest
    .find((arg) => arg.startsWith("--metadata-file="))
    ?.split("=")?.[1];

  uploadToArweave(
    imagePath,
    name,
    symbol,
    description,
    !isMainnet,
    metadataFilePath
  )
    .then(({ imageUri, metadataUri }) => {
      console.log("\nUpload Summary:");
      console.log("---------------");
      console.log("Image URI:", imageUri);
      console.log("Metadata URI:", metadataUri);
      console.log(
        "\nNow you can update your token metadata with the new metadata URI:"
      );
      console.log(
        `npm run update-metadata -- YOUR_TOKEN_MINT "${name}" "${symbol}" "${metadataUri}"`
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to upload to Arweave:", error);
      process.exit(1);
    });
}
