import { debug } from "./debug";
import { load, save } from "./files";
import { offline } from "./offline";
import {
  MinaNFT,
  RedactedMinaNFT,
  MINANFT_NAME_SERVICE,
  FileData,
} from "minanft";
import { PublicKey } from "o1js";

export async function proveFile(name: string, file: string) {
  if (debug()) console.log("Proving NFT file:\n", { name, file });
  const uri = await load({ filename: name, type: "nft" });
  if (debug()) console.log("NFT metadata:\n", { uri });
  if (uri === undefined) throw new Error(`NFT ${name} not found`);
  const fileJSON = getFile(uri, file);
  if (debug()) console.log(`fileJSON`, fileJSON);
  if (fileJSON === undefined)
    throw new Error(`File ${file} not found in NFT ${name}`);
  const fileData = FileData.fromJSON(fileJSON.value);
  if (debug()) console.log(`fileData`, fileData);
  const fileProof = await fileData.proof();

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
    MinaNFT.minaInit("testworld2");
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
  redactedNFT.copyMetadata(file);
  const proof = await redactedNFT.proof();
  if (debug()) console.log(`proof:`, proof);

  const files = [
    {
      key: fileJSON.key,
      value: fileJSON.value,
      fileProof: fileProof.toJSON(),
      proof: proof.toJSON(),
    },
  ];

  const proofJson = {
    name: uri.name,
    version: uri.version,
    address: uri.address,
    files,
  };

  if (debug()) console.log("proofJSON", proofJson);
  const filename = await save({
    filename: name + "." + file,
    type: "proof",
    data: proofJson,
    allowRewrite: true,
  });

  console.log(`NFT ${name} file has been proven and written to ${filename}`);
}

export function getFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uri: any,
  file: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { key: string; value: any } | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: { key: string; value: any } | undefined = undefined;

  Object.entries(uri.properties).forEach(([key, value]) => {
    if (typeof key !== "string")
      throw new Error("uri: NFT metadata key mismatch - should be string");
    if (typeof value !== "object")
      throw new Error("uri: NFT metadata value mismatch - should be object");

    // check if key is in the list
    if (file === key) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj = value as any;
      const data = obj.data;
      const kind = obj.kind;
      const linkedObject = obj.linkedObject;
      if (data === undefined)
        throw new Error(
          `uri: NFT metadata: data should present: ${key} : ${value} kind: ${kind} data: ${data}`
        );

      if (kind === undefined || typeof kind !== "string")
        throw new Error(
          `uri: NFT metadata: kind mismatch - should be string: ${key} : ${value}`
        );
      if (linkedObject === undefined)
        throw new Error(
          `uri: NFT metadata: linkedObject should present: ${key} : ${value} kind: ${kind} data: ${data}`
        );
      if (kind === "file" || kind === "image") {
        result = { key, value };
      } else
        throw new Error(
          `uri: NFT metadata: kind ${kind} not supported for ${key} : ${value}`
        );
    }
  });
  return result;
}
