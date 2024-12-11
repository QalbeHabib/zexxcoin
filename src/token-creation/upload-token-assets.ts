import { uploadMetadata, createMetadata } from "../utils/upload-metadata";
import { TOKEN_CONFIG } from "../config/token-config";
import * as fs from "fs";
import * as path from "path";

async function uploadTokenAssets() {
  try {
    // Check if image exists
    const imagePath = process.argv[2];
    if (!imagePath) {
      throw new Error(
        "Please provide path to token image: yarn upload-assets ./path/to/image.png"
      );
    }

    // Read image file
    const image = fs.readFileSync(imagePath);

    // Create metadata
    const metadata = createMetadata(
      TOKEN_CONFIG.name,
      TOKEN_CONFIG.symbol,
      TOKEN_CONFIG.description,
      TOKEN_CONFIG.externalUrl
    );

    // Upload to Arweave
    console.log("Uploading to Arweave...");
    const { imageUri, metadataUri } = await uploadMetadata({
      image,
      metadata,
    });

    // Update token config with new URIs
    const configPath = path.join(__dirname, "../config/token-config.ts");
    const currentConfig = fs.readFileSync(configPath, "utf8");

    const updatedConfig = currentConfig
      .replace(/image: ".*"/, `image: "${imageUri}"`)
      .replace(/uri: ".*"/, `uri: "${metadataUri}"`);

    fs.writeFileSync(configPath, updatedConfig);

    console.log("\nAssets Upload Summary:");
    console.log("---------------------");
    console.log(`Image URI: ${imageUri}`);
    console.log(`Metadata URI: ${metadataUri}`);
    console.log("\nToken configuration has been updated with permanent URIs");
  } catch (error) {
    console.error("Error uploading token assets:", error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  uploadTokenAssets()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
