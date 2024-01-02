import { PrivateKey } from "o1js";
import { write, load } from "./files";
import { debug } from "./debug";

import AccountData from "./model/accountData";

export async function createAccount(
  name: string,
  privateKey: string | undefined,
  publicKey: string | undefined
): Promise<void> {
  if (debug())
    console.log("Creating account:\n", { name, privateKey, publicKey });
  try {
    let sk = privateKey ?? "";
    let pk = publicKey ?? "";
    if (!privateKey && !publicKey) sk = PrivateKey.random().toBase58();
    if (!publicKey) pk = PrivateKey.fromBase58(sk).toPublicKey().toBase58();
    else if (
      privateKey &&
      PrivateKey.fromBase58(sk).toPublicKey().toBase58() !== publicKey
    ) {
      console.error("Private and public keys do not match");
      return;
    }

    const acc: AccountData = {
      publicKey: pk,
      privateKey: sk,
    };
    await write(acc, name, "account");
  } catch (e) {
    console.error(e);
  }
}

export async function exportAccount(name: string): Promise<void> {
  const acc: AccountData = await load(name, "account");
  console.log(acc);
}
