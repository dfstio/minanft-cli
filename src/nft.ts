import {
  MinaNFT,
  MapData,
  MinaNFTNameService,
  accountBalanceMina,
  makeString,
  api,
} from "minanft";
import { getJWT } from "./jwt";
import { getAccount } from "./account";
import { debug } from "./debug";
import { write } from "./files";
import { createAccount } from "./account";
import { offline } from "./offline";
import { getCommands } from "./nftcli";

export async function reserveName(
  name: string,
  publicKey: string,
  account: string
) {
  try {
    if (offline()) {
      const filename = await write({
        data: { request: "ReserveName", name, publicKey, account },
        filename: "reservename",
        type: "request",
      });
      if (!filename) {
        console.error(`Error creating name reservation request file`);
        return;
      } else {
        console.log(
          `Created name reservation request file ${filename}, please send it to the online computer and execute on https://minanft.io/tools`
        );
      }
      return undefined;
    } else {
      const JWT = await getJWT();
      if (JWT === undefined)
        throw new Error(
          "JWT token is not set. Please run 'minanft jwt' command"
        );
      const minanft = new api(JWT);
      const nftName = name[0] === "@" ? name : "@" + name;
      const reserved = await minanft.reserveName({
        name: nftName,
        publicKey,
      });
      console.log("Name reservation result:", reserved);
      return reserved;
    }
  } catch (e) {
    console.error("Error reserving name:", e);
  }
}

export async function reserve(name: string, account: string) {
  if (debug()) console.log("Reserving NFT name:\n", { name, account });
  const nftName = name[0] === "@" ? name : "@" + name;
  if (account === undefined || account === "") {
    await createAccount({ name: nftName });
  }
  const acc = await getAccount(account ?? nftName);
  if (acc === undefined) throw new Error(`Account ${account} not found`);
  if (acc.privateKey === undefined || acc.privateKey === "")
    throw new Error(`Account ${account} has no private key`);
  const reserved = await reserveName(name, acc.publicKey, account ?? nftName);
  if (!offline()) {
    if (reserved === undefined) throw new Error(`Error reserving name ${name}`);
    if (reserved.isReserved) {
      console.log(`Name ${name} has been reserved`);
      await write({
        filename: name,
        type: "name",
        data: {
          name,
          account: account ?? nftName,
          address: acc.publicKey,
          signature: reserved.signature,
        },
      });
    } else
      console.error(
        `Name ${name} has not been reserved: ${reserved.error ?? ""} ${
          reserved.reason ?? ""
        }`
      );
    return reserved;
  }
}

export async function createNFT(
  name: string,
  owner: string | undefined,
  arweave: boolean
) {
  if (debug()) console.log("Creating NFT:\n", { name, owner, arweave });
  console.log("After adding metadata and files, execute mint command.");
  console.log("To exit without minting, execute exit command.");
  await getCommands();
}
