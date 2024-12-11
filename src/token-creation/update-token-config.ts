import * as fs from "fs";
import * as path from "path";

interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  initialSupply: number;
  image: string;
  externalUrl: string;
  disableMintingAfterInit: boolean;
  sellerFeeBasisPoints: number;
}

async function updateTokenConfig() {
  try {
    // Get user input
    const tokenDetails = {
      name: process.argv[2] || "Example Token",
      symbol: process.argv[3] || "EXTKN",
      description: process.argv[4] || "Example token for demonstration",
      decimals: parseInt(process.argv[5]) || 9,
      initialSupply: parseInt(process.argv[6]) || 1_000_000_000,
      image:
        process.argv[7] ||
        "https://raw.githubusercontent.com/your-repo/token-image.png",
      externalUrl: process.argv[8] || "https://your-project-website.com",
      disableMintingAfterInit: process.argv[9] === "true" || false,
      sellerFeeBasisPoints: parseInt(process.argv[10]) || 0,
    };

    // Update token config
    const configContent = `export const TOKEN_CONFIG = {
    name: "${tokenDetails.name}",
    symbol: "${tokenDetails.symbol}",
    description: "${tokenDetails.description}",
    decimals: ${tokenDetails.decimals},
    initialSupply: ${tokenDetails.initialSupply},
    image: "${tokenDetails.image}",
    externalUrl: "${tokenDetails.externalUrl}",
    disableMintingAfterInit: ${tokenDetails.disableMintingAfterInit},
    sellerFeeBasisPoints: ${tokenDetails.sellerFeeBasisPoints},
}`;

    // Update metadata JSON
    const metadataContent = {
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      description: tokenDetails.description,
      image: tokenDetails.image,
      external_url: tokenDetails.externalUrl,
      attributes: [
        {
          trait_type: "Category",
          value: "Token",
        },
      ],
      properties: {
        files: [
          {
            uri: tokenDetails.image,
            type: "image/png",
          },
        ],
      },
    };

    // Write the updated configurations
    fs.writeFileSync(
      path.join(__dirname, "../config/token-config.ts"),
      configContent
    );

    fs.writeFileSync(
      path.join(__dirname, "../config/token-metadata.json"),
      JSON.stringify(metadataContent, null, 4)
    );

    console.log("Token configuration updated successfully!");
    console.log("\nNew Token Details:");
    console.log("------------------");
    console.log(`Name: ${tokenDetails.name}`);
    console.log(`Symbol: ${tokenDetails.symbol}`);
    console.log(`Description: ${tokenDetails.description}`);
    console.log(`Decimals: ${tokenDetails.decimals}`);
    console.log(`Initial Supply: ${tokenDetails.initialSupply}`);
    console.log(`Image URI: ${tokenDetails.image}`);
    console.log(`External URL: ${tokenDetails.externalUrl}`);
    console.log(`Disable Minting: ${tokenDetails.disableMintingAfterInit}`);
    console.log(
      `Seller Fee (basis points): ${tokenDetails.sellerFeeBasisPoints}`
    );
  } catch (error) {
    console.error("Error updating token configuration:", error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  if (process.argv.length < 3) {
    console.log(`
Usage: yarn update-token-config <params>

Parameters (in order):
1. name             - Token name (e.g., "My Token")
2. symbol           - Token symbol (e.g., "MTKN")
3. description      - Token description
4. decimals         - Number of decimals (default: 9)
5. initialSupply    - Initial token supply (default: 1000000000)
6. image            - Token image URI
7. externalUrl      - Project website URL
8. disableMinting   - Whether to disable minting (true/false)
9. sellerFee        - Seller fee in basis points (100 = 1%)

Example:
yarn update-token-config "My Token" MTKN "My awesome token" 9 1000000000 "https://my-image.png" "https://mysite.com" false 0
        `);
    process.exit(1);
  }

  updateTokenConfig()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
