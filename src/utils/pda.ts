import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, authorityKeypair, buyerKeypair } from "../constants";

export const derivePresaleAddress = async () => {
  const [presaleAddress, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("presale"), authorityKeypair.publicKey.toBuffer()],
    PROGRAM_ID
  );
  return { presaleAddress, bump };
};

export const derivePresaleVaultAddress = async () => {
  const [presaleVault, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    PROGRAM_ID
  );
  return { presaleVault, bump };
};

export const deriveUserInfoAddress = async (buyer?: PublicKey) => {
  const { presaleAddress } = await derivePresaleAddress();
  const [userInfoAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("user"),
      presaleAddress.toBuffer(),
      (buyer || buyerKeypair.publicKey).toBuffer(),
    ],
    PROGRAM_ID
  );
  return userInfoAddress;
};
