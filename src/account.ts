import { PrivateKey, PublicKey } from "o1js";
import { write, load } from "./files";
import { debug } from "./debug";
import { offline } from "./offline";
import { accountBalanceMina } from "minanft";
import { init } from "./mina";

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
    await write({ data: acc, filename: name, type: "account" });
  } catch (e) {
    console.error(e);
  }
}

export async function exportAccount(name: string): Promise<void> {
  const acc: AccountData = await load({ filename: name, type: "account" });
  console.log(acc);
}

export async function balance(name: string): Promise<void> {
  try {
    const acc: AccountData = await load({ filename: name, type: "account" });
    if (offline()) {
      const filename = await write({
        data: { request: "balance", name, publicKey: acc.publicKey },
        filename: "balance",
        type: "request",
      });
      if (!filename) {
        console.error(`Error creating balance request file`);
        return;
      } else {
        console.log(
          `Created balance request file ${filename}, please send it to the online computer and execute on https://minanft.io/tools`
        );
      }
    } else {
      init();
      const balance = await accountBalanceMina(
        PublicKey.fromBase58(acc.publicKey)
      );
      console.log(`Balance of ${acc.publicKey} is ${balance} MINA`);
    }
  } catch (e) {
    console.error(`Error receiving balance of the account`, e);
  }
}
