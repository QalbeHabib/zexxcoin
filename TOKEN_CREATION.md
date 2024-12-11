# SPL Token Creation Guide

This guide explains how to create and configure your SPL token using our token creation tools. The process includes creating the token, setting up metadata, uploading assets to Arweave, and preparing it for the presale.

## Features

- Create SPL tokens with metadata
- Configure token parameters (supply, decimals, etc.)
- Upload token images to Arweave
- Create and upload metadata to Arweave
- Update token configuration
- Automatic metadata account creation
- Devnet testing support

## Directory Structure

```
src/
├── config/
│   ├── token-config.ts         # Token configuration
│   └── token-metadata.json     # Token metadata template
├── token-creation/
│   ├── create-token.ts         # Token creation script
│   ├── update-token-config.ts  # Configuration update script
│   └── upload-token-assets.ts  # Asset upload script
└── utils/
    ├── connection.ts           # Solana connection utilities
    ├── upload-metadata.ts      # Arweave upload utilities
    └── airdrop.ts             # Devnet SOL airdrop utility
```

## Prerequisites

1. **Environment Setup**

   ```bash
   # Install dependencies
   yarn install

   # Copy environment template
   cp .env.example .env
   ```

2. **Configure Environment**
   ```env
   # .env file
   SOLANA_RPC_URL=https://api.devnet.solana.com
   WALLET_PRIVATE_KEY=your,wallet,private,key,as,comma,separated,numbers
   ```

## Complete Token Creation Process

### 1. Update Token Configuration

```bash
yarn update-token-config "Token Name" "SYMBOL" "Description" 9 1000000000 "https://placeholder-url.png" "https://your-website.com" false 0
```

Parameters:

1. `name` - Token name
2. `symbol` - Token symbol (e.g., "BTC")
3. `description` - Token description
4. `decimals` - Decimal places (default: 9)
5. `initialSupply` - Initial token supply
6. `image` - Temporary image URL (will be updated after upload)
7. `externalUrl` - Project website
8. `disableMinting` - Disable future minting (true/false)
9. `sellerFee` - Seller fee basis points (100 = 1%)

### 2. Upload Token Assets to Arweave

```bash
# Upload token image and create metadata
yarn upload-assets ./path/to/your/token-image.png
```

This will:

- Upload your image to Arweave
- Create and upload metadata to Arweave
- Update token configuration with permanent URIs
- Store permanent links in your configuration

### 3. Create Token

```bash
# Create token with metadata
yarn create-token
```

## Metadata Structure

```json
{
  "name": "Your Token Name",
  "symbol": "SYMBOL",
  "description": "Your token description",
  "image": "arweave://your-image-uri",
  "external_url": "https://your-website.com",
  "attributes": [
    {
      "trait_type": "Category",
      "value": "Token"
    },
    {
      "trait_type": "Standard",
      "value": "SPL Token"
    }
  ],
  "properties": {
    "category": "Token",
    "creators": [
      {
        "address": "your-wallet-address",
        "share": 100
      }
    ],
    "files": [
      {
        "uri": "arweave://your-image-uri",
        "type": "image/png"
      }
    ]
  }
}
```

## Advanced Configuration Options

### 1. Freeze Authority

```typescript
// During token creation, you can set freeze authority
const mint = await createMint(
  connection,
  payer,
  payer.publicKey, // Mint Authority
  payer.publicKey, // Freeze Authority (set to null to disable)
  decimals
);
```

### 2. Metadata Mutability

The `isMutable` flag determines if token metadata can be updated after creation:

```typescript
{
    createMetadataAccountArgsV3: {
        data: {
            // ... metadata fields
        },
        isMutable: true,  // Set to false to make metadata permanent
        collectionDetails: null,
    }
}
```

### 3. Token Standards

This implementation uses:

- SPL Token Program for token creation
- Metaplex Token Metadata Program for metadata
- Arweave for permanent storage

## Cost Breakdown

1. **Token Creation**

   - Mint account: ~0.0014 SOL
   - Metadata account: ~0.0015 SOL
   - Token account: ~0.002 SOL
   - Total: ~0.005 SOL

2. **Arweave Storage**
   - Image upload: ~0.01-0.1 SOL (depends on size)
   - Metadata upload: ~0.001-0.01 SOL
   - Total: ~0.011-0.11 SOL

## Best Practices

1. **Image Preparation**

   - Use PNG format
   - Recommended size: 512x512 pixels
   - Keep file size under 1MB
   - Use transparent background if possible

2. **Metadata**

   - Provide comprehensive description
   - Use meaningful attributes
   - Include all relevant links
   - Double-check all URIs

3. **Testing**

   ```bash
   # Get devnet SOL
   yarn airdrop

   # Test on devnet first
   yarn create-token

   # Verify metadata
   solana account <metadata-address>
   ```

## Troubleshooting

1. **Arweave Upload Issues**

   ```bash
   # Check SOL balance (needed for upload)
   solana balance

   # Get more devnet SOL if needed
   yarn airdrop
   ```

2. **Metadata Verification**

   ```bash
   # Get metadata account info
   solana account <metadata-address>
   ```

3. **Common Issues**
   - Insufficient SOL for Arweave upload
   - Invalid image format
   - Network timeouts
   - Invalid metadata format

## Error Handling

### Common Errors and Solutions

1. **Transaction Simulation Failed**

   ```bash
   Error: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1
   ```

   Solution: Check SOL balance and account permissions

2. **Metadata Account Already Exists**

   ```bash
   Error: Account already exists
   ```

   Solution: Use a new mint address or update existing metadata

3. **Invalid Owner**

   ```bash
   Error: Invalid program owner
   ```

   Solution: Ensure correct program IDs are used

4. **Arweave Upload Failures**
   ```bash
   Error: Failed to upload to Arweave
   ```
   Solutions:
   - Check SOL balance (needed for upload fees)
   - Verify file size and format
   - Check network connectivity
   - Try alternative Bundlr nodes

### Prevention Tips

1. **Before Token Creation**

   - Verify all configuration parameters
   - Ensure sufficient SOL balance
   - Test metadata URI accessibility
   - Validate image formats and sizes

2. **During Token Creation**

   - Monitor transaction status
   - Keep track of all generated addresses
   - Verify account creations
   - Check token supply calculations

3. **After Token Creation**
   - Verify metadata account
   - Check token account balances
   - Test token transfers
   - Validate metadata URI resolution

## Integration with Presale

After successful token creation:

1. Save your token addresses:

   ```typescript
   const tokenAddresses = {
     mint: "your-token-mint-address",
     metadata: "your-metadata-address",
   };
   ```

2. Use in presale initialization:
   ```typescript
   const presaleParams = {
     tokenMintAddress: new PublicKey(tokenAddresses.mint),
     // ... other params
   };
   ```

## Support

For issues and support:

1. Check the troubleshooting guide
2. Review common issues section
3. Open a GitHub issue
4. Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.
