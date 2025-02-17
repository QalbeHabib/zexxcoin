import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { getConnection, getPayer } from "../utils/connection";

async function updateTokenMetadata(
  mintAddress: string,
  name: string,
  symbol: string,
  uri: string
) {
  try {
    const connection = getConnection();
    const payer = getPayer();

    console.log("Updating metadata for token:", mintAddress);
    console.log("New URI:", uri);

    // Initialize Metaplex
    const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));

    const mintPubkey = new PublicKey(mintAddress);

    // Update the metadata
    const { response } = await metaplex.nfts().update({
      nftOrSft: await metaplex.nfts().findByMint({ mintAddress: mintPubkey }),
      name: name,
      symbol: symbol,
      uri: uri,
    });

    console.log("Metadata updated successfully!");
    console.log("Transaction signature:", response.signature);

    return response.signature;
  } catch (error) {
    console.error("Error updating token metadata:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if ("logs" in error) {
        console.error("Program logs:", (error as any).logs);
      }
    }
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  if (process.argv.length < 6) {
    console.log(`
Usage: ts-node src/token-creation/update-metadata.ts <mint-address> <name> <symbol> <uri>

Example:
ts-node src/token-creation/update-metadata.ts 25WNPZ5zuWgSB9PoY2nX15FBH7gNusHrmYuWw9Che73x "My Token" "MTK" "https://example.com/metadata.json"
    `);
    process.exit(1);
  }

  const [mintAddress, name, symbol, uri] = process.argv.slice(2);

  updateTokenMetadata(mintAddress, name, symbol, uri)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to update metadata:", error);
      process.exit(1);
    });
}
