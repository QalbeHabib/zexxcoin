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
  // New social media fields
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
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
      image: process.argv[7] || "<will-be-replaced-with-uploaded-image-url>",
      externalUrl: process.argv[8] || "https://your-project-website.com",
      website: process.argv[9] || "https://your-project-website.com",
      twitter: process.argv[10] || "https://twitter.com/yourhandle",
      telegram: process.argv[11] || "https://t.me/yourchannel",
      discord: process.argv[12] || "https://discord.gg/yourinvite",
      github: process.argv[13] || "https://github.com/yourrepo",
      disableMintingAfterInit: process.argv[14] === "true" || false,
      sellerFeeBasisPoints: parseInt(process.argv[15]) || 0,
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
    website: "${tokenDetails.website}",
    twitter: "${tokenDetails.twitter}",
    telegram: "${tokenDetails.telegram}",
    discord: "${tokenDetails.discord}",
    github: "${tokenDetails.github}",
    disableMintingAfterInit: ${tokenDetails.disableMintingAfterInit},
    sellerFeeBasisPoints: ${tokenDetails.sellerFeeBasisPoints},
}`;

    // Update metadata JSON with enhanced structure
    const metadataContent = {
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      description: tokenDetails.description,
      image: tokenDetails.image,
      external_url: tokenDetails.externalUrl,
      attributes: [
        {
          trait_type: "Category",
          value: "Utility Token",
        },
        {
          trait_type: "Website",
          value: tokenDetails.website,
        },
        {
          trait_type: "Twitter",
          value: tokenDetails.twitter,
        },
        {
          trait_type: "Telegram",
          value: tokenDetails.telegram,
        },
        {
          trait_type: "Discord",
          value: tokenDetails.discord,
        },
        {
          trait_type: "GitHub",
          value: tokenDetails.github,
        },
        {
          trait_type: "Total Supply",
          value: tokenDetails.initialSupply.toLocaleString(),
        },
        {
          trait_type: "Decimals",
          value: tokenDetails.decimals.toString(),
        },
      ],
      properties: {
        files: [
          {
            uri: tokenDetails.image,
            type: "image/png",
          },
        ],
        category: "image",
        creators: [
          {
            address: "<your-wallet-address>",
            share: 100,
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
    console.log("\nSocial Links:");
    console.log(`Website: ${tokenDetails.website}`);
    console.log(`Twitter: ${tokenDetails.twitter}`);
    console.log(`Telegram: ${tokenDetails.telegram}`);
    console.log(`Discord: ${tokenDetails.discord}`);
    console.log(`GitHub: ${tokenDetails.github}`);
    console.log("\nToken Settings:");
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
1. name                 - Token name (e.g., "My Token")
2. symbol               - Token symbol (e.g., "MTKN")
3. description          - Token description
4. decimals             - Number of decimals (default: 9)
5. initialSupply        - Initial token supply (default: 1000000000)
6. image                - Token image URI
7. externalUrl          - Project website URL
8. website              - Website URL (can be same as externalUrl)
9. twitter              - Twitter profile URL
10. telegram           - Telegram group/channel URL
11. discord            - Discord invite URL
12. github             - GitHub repository URL
13. disableMinting     - Whether to disable minting (true/false)
14. sellerFee          - Seller fee in basis points (100 = 1%)

Example:
yarn update-token-config "DevDots" "DDT" "DevDots Token" 9 1000000 \\
  "https://image.url" "https://devdots.org" \\
  "https://devdots.org" "https://twitter.com/devdots" \\
  "https://t.me/devdots" "https://discord.gg/devdots" \\
  "https://github.com/devdots" false 0
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
