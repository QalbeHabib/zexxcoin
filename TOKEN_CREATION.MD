# Token Creation and Management Guide

## Complete Token Creation Flow

### Prerequisites

1. Install dependencies:

```bash
npm install
```

2. Set up your environment:
   - Copy `.env.example` to `.env`
   - Add your wallet private key to `.env`
   - Configure RPC URL (defaults to devnet)

### Step 1: Configure Token Details

You can configure your token details in two ways:

1. Using the configuration script:

```bash
yarn update-token-config <params>
```

Required parameters (in order):

1. name - Token name (e.g., "DevDots")
2. symbol - Token symbol (e.g., "DDT")
3. description - Token description
4. decimals - Number of decimals (default: 9)
5. initialSupply - Initial token supply (default: 1000000000)
6. image - Token image URI
7. externalUrl - Project website URL
8. website - Website URL (can be same as externalUrl)
9. twitter - Twitter profile URL
10. telegram - Telegram group/channel URL
11. discord - Discord invite URL
12. github - GitHub repository URL
13. disableMinting - Whether to disable minting (true/false)
14. sellerFee - Seller fee in basis points (100 = 1%)

Example:

```bash
yarn update-token-config "DevDots" "DDT" "DevDots Token" 9 1000000 \
  "https://image.url" "https://devdots.org" \
  "https://devdots.org" "https://twitter.com/devdots" \
  "https://t.me/devdots" "https://discord.gg/devdots" \
  "https://github.com/devdots" false 0
```

2. Manually editing the configuration files:
   - `src/config/token-config.ts`: For program configuration
   - `src/config/token-metadata.json`: For token metadata

### Token Metadata Structure

The metadata JSON structure includes:

```json
{
  "name": "Your Token Name",
  "symbol": "TKN",
  "description": "Your token description",
  "image": "<will-be-replaced-with-uploaded-image-url>",
  "external_url": "https://yourproject.com",
  "attributes": [
    {
      "trait_type": "Category",
      "value": "Utility Token"
    },
    {
      "trait_type": "Website",
      "value": "https://yourproject.com"
    },
    {
      "trait_type": "Twitter",
      "value": "https://twitter.com/yourhandle"
    },
    {
      "trait_type": "Telegram",
      "value": "https://t.me/yourchannel"
    },
    {
      "trait_type": "Discord",
      "value": "https://discord.gg/yourinvite"
    },
    {
      "trait_type": "GitHub",
      "value": "https://github.com/yourrepo"
    },
    {
      "trait_type": "Total Supply",
      "value": "1,000,000"
    },
    {
      "trait_type": "Decimals",
      "value": "9"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "<will-be-replaced-with-uploaded-image-url>",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "<your-wallet-address>",
        "share": 100
      }
    ]
  }
}
```

### Step 2: Create Token

```bash
npm run create-token -- "<token_name>" "<symbol>" <decimals>
```

Example:

```bash
npm run create-token -- "Dev Token" "DEV" 9
```

This will:

- Create a new token mint
- Set up initial supply
- Save the mint address for future use
- Output the token mint address

Save your token mint address for the next steps!

### Step 3: Prepare Token Assets

1. Prepare your token image (recommended: PNG under 1MB)
2. Place it in your project directory (e.g., `./assets/token.png`)
3. Decide on your token's metadata:
   - Name
   - Symbol
   - Description
   - Social Links and External URLs:
     - Website
     - Twitter
     - Telegram
     - Discord
     - GitHub
   - Additional attributes (optional)

### Step 4: Upload Assets to Arweave

#### Metadata Structure with Social Links

Create a JSON file (e.g., `metadata.json`) with your token's information:

```json
{
  "name": "Your Token Name",
  "symbol": "SYMBOL",
  "description": "Your token description",
  "image": "<will-be-replaced-with-uploaded-image-url>",
  "external_url": "https://yourwebsite.com",
  "attributes": [
    {
      "trait_type": "Website",
      "value": "https://yourwebsite.com"
    },
    {
      "trait_type": "Twitter",
      "value": "https://twitter.com/yourhandle"
    },
    {
      "trait_type": "Telegram",
      "value": "https://t.me/yourchannel"
    },
    {
      "trait_type": "Discord",
      "value": "https://discord.gg/yourinvite"
    },
    {
      "trait_type": "GitHub",
      "value": "https://github.com/yourrepo"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "<will-be-replaced-with-uploaded-image-url>",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "<your-wallet-address>",
        "share": 100
      }
    ]
  }
}
```

For testing (devnet):

```bash
npm run upload-to-arweave -- ./assets/token.png "Dev Token" "DEV" "Your token description" --metadata-file=./metadata.json
```

For production (mainnet):

```bash
npm run upload-to-arweave -- ./assets/token.png "Dev Token" "DEV" "Your token description" mainnet --metadata-file=./metadata.json
```

Save the returned metadata URI for the next step!

### Step 5: Update Token Metadata

```bash
npm run update-metadata -- <mint_address> "<token_name>" "<symbol>" "<metadata_uri>"
```

Example:

```bash
npm run update-metadata -- Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr "Dev Token" "DEV" "https://arweave.net/your-metadata-uri"
```

### Step 6: Verify Token

1. Check token in Solana Explorer:

   - Devnet: `https://explorer.solana.com/address/<mint_address>?cluster=devnet`
   - Mainnet: `https://explorer.solana.com/address/<mint_address>`

2. Verify metadata is displayed correctly:
   - Token name
   - Symbol
   - Image
   - Description

### Optional Steps

#### Update Token Configuration

If you need to modify token parameters:

```bash
npm run update-token-config -- <mint_address> <key> <value>
```

#### Airdrop Tokens (Development)

For testing on devnet:

```bash
npm run airdrop -- <amount>
```

## Troubleshooting

### Common Issues

1. "Not enough SOL for storage fees"

   - Solution: Ensure wallet has sufficient SOL for Arweave upload

2. "Authority mismatch"

   - Solution: Use the same wallet that created the token

3. "Image upload failed"
   - Solution: Check image size and format
   - Try reducing image size if over 1MB

### Best Practices

1. Always test on devnet first
2. Keep image sizes reasonable
3. Double-check all parameters before mainnet deployment
4. Save all important addresses and URIs
5. Verify metadata before proceeding to next steps

## Updating Token Metadata

To update your token's metadata, use the following command:

```bash
npm run update-metadata -- <mint_address> "<token_name>" "<symbol>" "<uri>"
```

Example:

```bash
npm run update-metadata -- Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr "Dev Token" "DEV" "https://arweave.net/your-metadata-uri"
```

The script will:

1. Connect to your configured network (devnet/mainnet)
2. Use your wallet to sign the transaction
3. Update the token's on-chain metadata

**Note**: Make sure you're using the wallet that created the token, as only the token authority can update metadata.

## Uploading Token Assets to Arweave

### For Testing (Devnet)

```bash
npm run upload-to-arweave -- <image_path> "<name>" "<symbol>" "<description>"
```

Example:

```bash
npm run upload-to-arweave -- ./devdots.png "DevDots" "DTS" "DevDots Meme token"
```

This will:

- Use placeholder URLs for testing
- Not require any SOL payment
- Return temporary URIs for development

### For Production (Mainnet)

```bash
npm run upload-to-arweave -- <image_path> "<name>" "<symbol>" "<description>" mainnet
```

Example:

```bash
npm run upload-to-arweave -- ./devdots.png "DevDots" "DTS" "DevDots Meme token" mainnet
```

This will:

1. Estimate storage costs for both image and metadata
2. Check your wallet balance
3. Upload to Arweave if sufficient funds are available
4. Return permanent URIs for your token

### Storage Cost Estimation

Before uploading to Arweave, the script will show:

- Image file size and cost
- Metadata size and cost
- Total cost in SOL
- Your wallet balance

Example output:

```
Storage Cost Estimation:
------------------------
Image (123456 bytes): 0.0023 SOL
Metadata (512 bytes): 0.0001 SOL
Total cost: 0.0024 SOL

Wallet balance: 0.5 SOL
```

### Complete Flow Example

1. Upload assets to Arweave:

```bash
npm run upload-to-arweave -- ./devdots.png "DevDots" "DTS" "DevDots Meme token" mainnet
```

2. Use the returned metadata URI to update your token:

```bash
npm run update-metadata -- YOUR_TOKEN_MINT "DevDots" "DTS" "https://arweave.net/returned-metadata-uri"
```

### Important Notes

1. For mainnet uploads, ensure you have enough SOL for storage fees
2. Only the token authority can update metadata
3. Image files should be reasonably sized (preferably under 1MB)
4. Arweave uploads are permanent and cannot be changed
5. For devnet testing, use the default mode without 'mainnet' parameter

## Advanced Metadata Features

### Social Links and External URLs

Your token can include various external links and social media information:

1. **Required Fields**:

   - `name`
   - `symbol`
   - `description`
   - `image`

2. **Recommended Additional Fields**:

   - `external_url`: Main website
   - `attributes`: Array of trait_type/value pairs for:
     - Website
     - Social media links
     - Community channels
     - Additional characteristics

3. **Optional Fields**:
   - `animation_url`: For animated content
   - `youtube_url`: For video content
   - Custom attributes for specific features

### Example Attributes

```json
"attributes": [
  {
    "trait_type": "Category",
    "value": "Utility Token"
  },
  {
    "trait_type": "Total Supply",
    "value": "1,000,000"
  },
  {
    "trait_type": "Website",
    "value": "https://yourproject.com"
  },
  {
    "trait_type": "Twitter",
    "value": "@yourhandle"
  }
]
```

### Best Practices for Metadata

1. Keep URLs current and active
2. Use HTTPS for all external links
3. Verify all social links before deployment
4. Include comprehensive project information
5. Keep metadata size reasonable (under 100KB)

### Metadata and Social Links

Your token can include various metadata and social links:

1. **Basic Information**:

   - Name
   - Symbol
   - Description
   - Image
   - External URL

2. **Social Links**:

   - Website
   - Twitter
   - Telegram
   - Discord
   - GitHub

3. **Token Details**:

   - Total Supply
   - Decimals
   - Category
   - Creator Information

4. **Additional Attributes**:
   - Custom traits
   - Project-specific information
   - Community links

### Best Practices for Token Configuration

1. **Social Links**:

   - Use HTTPS URLs
   - Verify all links are active
   - Keep social media handles consistent
   - Update links when they change

2. **Token Details**:

   - Set appropriate decimals (9 is standard)
   - Choose reasonable initial supply
   - Consider whether minting should be disabled
   - Set seller fees carefully

3. **Metadata**:

   - Keep descriptions concise but informative
   - Use high-quality images
   - Include all relevant social links
   - Update metadata when project details change

4. **Configuration Updates**:
   - Test changes on devnet first
   - Backup configuration files
   - Verify all parameters before updating
   - Keep social links current
