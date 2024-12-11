import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";
import { getConnection, getPayer } from "./connection";

interface MetadataFiles {
  image: Buffer;
  metadata: any;
}

export async function uploadMetadata(files: MetadataFiles) {
  try {
    const connection = getConnection();
    const payer = getPayer();

    // Initialize Metaplex with Bundlr (Arweave)
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
      .use(
        bundlrStorage({
          address: "https://node1.bundlr.network",
          providerUrl: connection.rpcEndpoint,
          timeout: 60000,
        })
      );

    console.log("Uploading image to Arweave...");
    const metaplexFile = await toMetaplexFile(files.image, "image.png");
    const imageUri = await metaplex.storage().upload(metaplexFile);
    console.log("Image uploaded:", imageUri);

    // Update metadata with permanent image URI
    const metadata = {
      ...files.metadata,
      image: imageUri,
      properties: {
        ...files.metadata.properties,
        files: [
          {
            uri: imageUri,
            type: "image/png",
          },
        ],
      },
    };

    console.log("Uploading metadata to Arweave...");
    const metadataUri = await metaplex.storage().upload(metadata);
    console.log("Metadata uploaded:", metadataUri);

    return {
      imageUri,
      metadataUri,
    };
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    throw error;
  }
}

// Example metadata structure
export const createMetadata = (
  name: string,
  symbol: string,
  description: string,
  externalUrl: string
) => ({
  name,
  symbol,
  description,
  external_url: externalUrl,
  attributes: [
    {
      trait_type: "Category",
      value: "Token",
    },
    {
      trait_type: "Standard",
      value: "SPL Token",
    },
  ],
  properties: {
    category: "Token",
    creators: [
      {
        address: getPayer().publicKey.toBase58(),
        share: 100,
      },
    ],
  },
});
