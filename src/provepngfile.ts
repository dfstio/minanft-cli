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
import {
  loadBinaryTreeFromFields,
  generateRedactedBinaryProof,
} from "./redactedproof";
import { pngFoFields } from "./png";

export async function provePNGFile(
  name: string,
  key: string,
  originalFilename: string,
  redactedFilename: string
) {
  if (debug())
    console.log("Proving NFT png file:\n", {
      name,
      key,
      originalFilename,
      redactedFilename,
    });

  const { uri, fileJSON } = await getPNGByKey(name, key);
  if (fileJSON === undefined)
    throw new Error(`File ${key} not found in NFT ${name}`);
  const fileData = FileData.fromJSON(fileJSON.value);
  if (debug()) console.log(`fileData`, fileData);
  const fileProof = await fileData.proof(debug());

  if (redactedFilename === undefined)
    throw new Error(`Redacted file must be provided for png files`);
  const originalFields = await pngFoFields(originalFilename);
  const redactedFields = await pngFoFields(redactedFilename);
  if (originalFields.length !== redactedFields.length)
    throw new Error(`Original and redacted files have different length`);
  const original = loadBinaryTreeFromFields(originalFields);
  const redacted = loadBinaryTreeFromFields(redactedFields, true);
  if (original.height !== redacted.height)
    throw new Error(`Original and redacted trees have different heights`);
  if (original.leavesNumber !== redacted.leavesNumber)
    throw new Error(
      `Original and redacted trees have different number of leaves`
    );
  const pngProof = await generateRedactedBinaryProof(original, redacted);
  if (debug()) console.log(`png proof`, fileProof);

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
    MinaNFT.minaInit("berkeley");
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
  redactedNFT.copyMetadata(key);
  const proof = await redactedNFT.proof();
  if (debug()) console.log(`proof:`, proof);

  const files = [
    {
      key: fileJSON.key,
      value: fileJSON.value,
      pngProof,
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
    filename: name + "." + key,
    type: "proof",
    data: proofJson,
    allowRewrite: true,
  });

  console.log(`NFT ${name} file has been proven and written to ${filename}`);
}

export async function getPNGByKey(name: string, key: string) {
  const uri = await load({ filename: name, type: "nft" });
  if (debug()) console.log("NFT metadata:\n", { uri });
  if (uri === undefined) throw new Error(`NFT ${name} not found`);
  const fileJSON = getPNG(uri, key);
  if (debug()) console.log(`fileJSON`, fileJSON);
  if (fileJSON === undefined)
    throw new Error(`File ${key} not found in NFT ${name}`);
  return { uri, fileJSON };
}

export function getPNG(
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
      if (kind === "file" || kind === "image" || kind === "png") {
        result = { key, value };
      } else
        throw new Error(
          `uri: NFT metadata: kind ${kind} not supported for ${key} : ${value}`
        );
    }
  });
  return result;
}
