import { debug } from "./debug";
import { load, save } from "./files";
import { offline } from "./offline";
import { MinaNFT, RedactedMinaNFT, MINANFT_NAME_SERVICE } from "minanft";
import { PublicKey } from "o1js";

export async function proveMap(name: string, keys: string[]) {
  if (keys.length === 0) throw new Error("No keys to prove");
  if (debug()) console.log("Proving NFT metadata:\n", { name, keys });
  const uri = await load({ filename: name, type: "nft" });
  if (debug()) console.log("NFT metadata:\n", { uri });
  if (uri === undefined) throw new Error(`NFT ${name} not found`);
  const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
  const nft = new MinaNFT({
    name: uri.name,
    address: PublicKey.fromBase58(uri.address),
    nameService: nameServiceAddress,
  });

  await nft.loadMetadata(JSON.stringify(uri));
  const loadedJson = nft.toJSON();
  if (debug()) console.log(`loadedJson:`, JSON.stringify(loadedJson, null, 2));

  if (!offline()) {
    MinaNFT.minaInit("testworld2");
    const checkNft = await nft.checkState();
    if (checkNft === false) {
      console.error("NFT checkState error");
      return;
    }
  }

  const redactedNFT = new RedactedMinaNFT(nft);
  for (const key of keys) {
    if (debug()) console.log(`key:`, key);
    redactedNFT.copyMetadata(key);
  }
  const proof = await redactedNFT.proof();
  if (debug()) console.log(`proof:`, proof);

  const proofJson = {
    name: uri.name,
    version: uri.version,
    address: uri.address,
    keys: getKeys(uri, keys),
    proof: proof.toJSON(),
  };

  if (debug()) console.log("proofJSON", proofJson);
  const filename = await save({
    filename: name,
    type: "proof",
    data: proofJson,
    allowRewrite: true,
  });

  console.log(
    `NFT ${name} metadata has been proven and written to ${filename}`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getKeys(uri: any, keys: string[]) {
  const result: { key: string; value: string }[] = [];
  keys.forEach((key) => {
    const row = uri.properties.find(key);
    if (row !== undefined)
      result.push({ key, value: uri.properties[key].data });
  });
  if (debug()) console.log(`getKeys:`, result);
  return result;
}
