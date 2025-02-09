import * as anchor from "@coral-xyz/anchor";
import type { TerminusPresale } from "../../target/types/terminus_presale";
import idl from "../../target/idl/terminus_presale.json";
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

export const program = new anchor.Program<TerminusPresale>(
  idl as any,
  provider
);
