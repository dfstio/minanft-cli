import {
  MinaNFT,
  api,
  MINANFT_NAME_SERVICE,
  VERIFICATION_KEY_HASH,
  NAMES_ORACLE,
  MinaNFTNameService,
  Memory,
} from "minanft";
import { getJWT, getArweaveKey, getPinataJWT } from "./jwt";
import { getAccount } from "./account";
import { debug } from "./debug";
import { load, write } from "./files";
import { createAccount } from "./account";
import { offline } from "./offline";
import { getCommands } from "./nftcli";
import { PublicKey, PrivateKey, Poseidon, Field, Signature } from "o1js";

let minaNFT: MinaNFT | undefined;
export let arweaveKey: string | undefined;
export let pinataJWT: string | undefined;
let ownerField: Field | undefined;
let signature: string | undefined;
let privateKey: string | undefined;
let useArweave = false;

export function nft() {
  if (minaNFT === undefined) throw new Error("NFT not initialized");
  return minaNFT;
}

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
      if (debug())
        console.log("reserveName: Reserving name:", { nftName, publicKey });
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
  if (debug()) console.log("Reserving name:", { name, acc, account, nftName });
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
  arweave: boolean,
  creator: string | undefined
) {
  try {
    if (debug()) console.log("Creating NFT:\n", { name, owner, arweave });
    useArweave = arweave;

    const nameData = await load({ filename: name, type: "name" });
    const nftAccount = await getAccount(nameData.account);
    const nftPrivateKey = nftAccount?.privateKey;
    const nftPublicKey = nftAccount?.publicKey;
    if (nftPublicKey === undefined || nftPublicKey === "")
      throw new Error(`NFT account has no public key`);

    if (nftPublicKey !== nameData.address)
      throw new Error(`NFT account public key does not match name data`);
    if (debug()) console.log("Signature:", nameData.signature);
    signature = nameData.signature;
    if (!owner) await createAccount({ name: name + ".owner" });
    const ownerAccount = owner
      ? await getAccount(owner)
      : await getAccount(name + ".owner");
    const ownerPrivateKey = ownerAccount?.privateKey;
    const ownerPublicKey = ownerAccount?.publicKey;
    if (nftPrivateKey === undefined || nftPrivateKey === "")
      throw new Error(`Account ${nameData.account} has no private key`);
    privateKey = nftPrivateKey;
    if (ownerPrivateKey === undefined || ownerPrivateKey === "")
      throw new Error(`Owner account has no private key`);
    if (ownerPublicKey === undefined || ownerPublicKey === "")
      throw new Error(`Owner account has no public key`);
    ownerField = Poseidon.hash(PublicKey.fromBase58(ownerPublicKey).toFields());
    const address = PrivateKey.fromBase58(nftPrivateKey).toPublicKey();
    if (address.toBase58() !== nameData.address)
      throw new Error(`NFT account public key does not match name data`);

    minaNFT = new MinaNFT({
      name,
      address,
      owner: ownerField,
      creator: creator ?? "MinaNFT CLI tool",
    });
    const fields: Field[] = [
      ...nft().address.toFields(),
      MinaNFT.stringToField(nft().name),
      Field.fromJSON(VERIFICATION_KEY_HASH),
      ...PublicKey.fromBase58(MINANFT_NAME_SERVICE).toFields(),
    ];
    if (signature === undefined) throw new Error("Signature is not set");
    const ok = Signature.fromBase58(signature)
      .verify(PublicKey.fromBase58(NAMES_ORACLE), fields)
      .toBoolean();
    if (debug()) console.log("address", nft().address.toBase58());
    if (debug()) console.log("name", nft().name);
    if (debug()) console.log("name service", MINANFT_NAME_SERVICE);
    if (!ok) throw new Error(`Signature verification failed`);
    if (arweave) {
      arweaveKey = await getArweaveKey();
      if (arweaveKey === undefined || arweaveKey === "")
        throw new Error(
          `Arweave key is not set. Please run 'minanft arweave' command`
        );
    } else {
      pinataJWT = await getPinataJWT();
      if (pinataJWT === undefined || pinataJWT === "")
        throw new Error(
          `Pinata JWT token is not set. Please run 'minanft pinata' command`
        );
    }
    console.log("After adding metadata and files, execute mint command.");
    console.log("To exit without minting, execute exit command.");
    await getCommands();
  } catch (e) {
    console.error("Error creating NFT:", e);
  }
}

export async function mint() {
  try {
    if (offline()) {
      const uri = nft().exportToString({
        increaseVersion: true,
        includePrivateData: false,
      });
      const filename = await write({
        data: { request: "mint", uri, signature, privateKey, useArweave },
        filename: "mint",
        type: "request",
      });
      if (!filename) {
        console.error(`Error creating mint request file`);
        return;
      } else {
        console.log(
          `Created mint request file ${filename}, please send it to the online computer and execute on https://minanft.io/tools`
        );
        const uri = nft().exportToJSON(true);
        await write({ filename: nft().name, type: "nft", data: uri });
      }
    } else {
      MinaNFT.minaInit("testworld2");
      const deployer = await getAccount("deployer");
      if (deployer === undefined) throw new Error("Deployer account not found");
      if (deployer.privateKey === undefined || deployer.privateKey === "")
        throw new Error("Deployer account has no private key");
      if (ownerField === undefined) throw new Error("Owner is not set");
      if (signature === undefined) throw new Error("Signature is not set");
      if (privateKey === undefined) throw new Error("Private key is not set");
      const deployerPrivateKey = PrivateKey.fromBase58(deployer.privateKey);
      const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
      const nameService = new MinaNFTNameService({
        address: nameServiceAddress,
      });
      Memory.info(`before minting`);
      const tx = await nft().mint({
        deployer: deployerPrivateKey,
        owner: ownerField,
        pinataJWT,
        arweaveKey,
        nameService,
        signature: Signature.fromBase58(signature),
        privateKey: PrivateKey.fromBase58(privateKey),
      });
      if (tx === undefined)
        throw new Error("Error minting NFT: cannot send transaction");
      Memory.info(`minted`);
      const uri = nft().exportToJSON(false);
      await write({ filename: nft().name, type: "nft", data: uri });
    }
  } catch (e) {
    console.error("Error minting NFT:", e);
  }
}

export async function indexName(name: string) {
  if (offline()) throw new Error("Cannot index NFT in offline mode");
  const JWT = await getJWT();
  if (JWT === undefined)
    throw new Error("JWT token is not set. Please run 'minanft jwt' command");
  const minanft = new api(JWT);
  const nftName = name[0] === "@" ? name : "@" + name;
  if (debug()) console.log("indexName: Indexing name:", { nftName });
  const indexed = await minanft.indexName({ name });
  console.log("NFT indexation result:\n", indexed);
}
