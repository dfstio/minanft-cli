import { debug } from "./debug";
import { load, save } from "./files";
import { offline } from "./offline";
import { MinaNFT, RedactedMinaNFT, MINANFT_NAME_SERVICE } from "minanft";
import { PublicKey } from "o1js";
import { init } from "./mina";
import { FileType } from "./model/fileData";

export async function proveMap(params: {
  name: string;
  keys: string[];
  nftType: FileType;
}) {
  const { name, keys, nftType } = params;
  if (keys.length === 0) throw new Error("No keys to prove");
  if (debug()) console.log("Proving NFT metadata:\n", { name, keys });
  const uri = await load({ filename: name, type: nftType });
  if (debug()) console.log("NFT metadata:\n", { uri });
  if (uri === undefined) throw new Error(`NFT ${name} not found`);
  const keyvalues = getKeys(uri, keys);
  if (debug()) console.log(`keyvalues:`, keyvalues);
  const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
  let nft: MinaNFT;
  if (offline()) {
    nft = MinaNFT.fromJSON({
      metadataURI: JSON.stringify(uri),
      nameServiceAddress,
    });

    const loadedJson = nft.toJSON();
    if (debug())
      console.log(`loadedJson:`, JSON.stringify(loadedJson, null, 2));
  } else {
    init();
    nft = new MinaNFT({
      name: uri.name,
      address: PublicKey.fromBase58(uri.address),
      nameService: nameServiceAddress,
    });
    await nft.loadMetadata(JSON.stringify(uri));
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
    keys: keyvalues,
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

  Object.entries(uri.properties).forEach(([key, value]) => {
    if (typeof key !== "string")
      throw new Error("uri: NFT metadata key mismatch - should be string");
    if (typeof value !== "object")
      throw new Error("uri: NFT metadata value mismatch - should be object");

    // check if key is in the list
    if (keys.includes(key)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj = value as any;
      const data = obj.data;
      const kind = obj.kind;
      if (data === undefined)
        throw new Error(
          `uri: NFT metadata: data should present: ${key} : ${value} kind: ${kind} data: ${data}`
        );

      if (kind === undefined || typeof kind !== "string")
        throw new Error(
          `uri: NFT metadata: kind mismatch - should be string: ${key} : ${value}`
        );
      if (kind === "string") {
        result.push({ key, value: data });
      } else
        throw new Error(
          `uri: NFT metadata: kind ${kind} not supported for ${key} : ${value}`
        );
    }
  });
  return result;
}
