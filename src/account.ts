import { PrivateKey, PublicKey } from "o1js";

import AccountData from "./model/accountData";

export function formatWinstonTime(ms: number): string {
  if (ms === undefined) return "";
  if (ms < 1000) return ms.toString() + " ms";
  if (ms < 60 * 1000)
    return parseInt((ms / 1000).toString()).toString() + " sec";
  if (ms < 60 * 60 * 1000)
    return parseInt((ms / 1000 / 60).toString()).toString() + " min";
  return parseInt((ms / 1000 / 60 / 60).toString()).toString() + " h";
}

function generateAccount(): AccountData {
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppPrivateKeyString = PrivateKey.toBase58(zkAppPrivateKey);
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  const zkAppAddressString = PublicKey.toBase58(zkAppAddress);

  return {
    privateKey: zkAppPrivateKeyString,
    publicKey: zkAppAddressString,
  };
}

export async function account(): Promise<void> {
  const acc = generateAccount();
  console.log("Created account:\n", acc);
}
