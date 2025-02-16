import * as anchor from "@coral-xyz/anchor";
import type { ZexxcoinPresale } from "../../target/types/zexxcoin_presale";
import idl from "../../target/idl/zexxcoin_presale.json";
import { authorityKeypair, PROGRAM_ID } from "../constants";

export const connection = new anchor.web3.Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

export const provider = new anchor.AnchorProvider(
  connection,
  new anchor.Wallet(authorityKeypair),
  anchor.AnchorProvider.defaultOptions()
);

anchor.setProvider(provider);

export const program = new anchor.Program<ZexxcoinPresale>(
  idl as any,
  provider
);
