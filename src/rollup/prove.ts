import { getNameInfo, getDatabase, getMap, getBlock } from "./blocks";
import { contractAddress, chain } from "./config";
import { debug } from "../debug";
import { load, save } from "../files";
import { RollupNFT, RedactedMinaNFT } from "minanft";
import { Encoding, JsonProof, verify } from "o1js";
import { FileType } from "../model/fileData";
import {
  RollupVerification,
  RollupVerifier,
  RollupVerifierProof,
  KeyVerification,
  KeyVerifier,
} from "./proof";
import { verifyKeyOnChain } from "./verify";
import { PublicKey } from "o1js";

export async function proveRollupMap(params: {
  name: string;
  keys: string[];
  nftType: FileType;
  onChain: boolean;
}) {
  const { name, keys, nftType, onChain } = params;
  console.log("proving RollupNFT keys", { name, keys });
  if (onChain && keys.length > 1) {
    throw new Error("Only one key can be proven on-chain");
  }
  const nameInfo = await getNameInfo({ contractAddress, chain, name });
  if (debug()) console.log("name info:", nameInfo);
  if (keys.length === 0) throw new Error("No keys to prove");
  const uri = await load({ filename: name, type: nftType });
  if (debug()) console.log("Rollup NFT metadata:\n", { uri });
  if (uri === undefined) throw new Error(`Rollup NFT ${name} not found`);
  const keyvalues = getKeys(uri, keys);
  if (debug()) console.log(`keyvalues:`, keyvalues);
  const block = await getBlock({ contractAddress, chain, blockType: "proved" });
  const map = await getMap(block.mapIPFS);
  const key = nameInfo.rollupNFT.name;
  const value = nameInfo.rollupNFT.data.hash();
  const witness = map.getWitness(key);
  console.time("RollupVerifier compiled");
  const { verificationKey } = await RollupVerifier.compile();
  console.timeEnd("RollupVerifier compiled");
  const rollupVerification = new RollupVerification({
    nft: nameInfo.rollupNFT,
    root: block.root,
  });
  const rollupProof = await RollupVerifier.verify(rollupVerification, witness);
  const rollupProofJson = rollupProof.toJSON();
  const ok = await verify(rollupProofJson, verificationKey);
  if (ok) console.log("Rollup NFT proof verified");
  else throw new Error("Rollup NFT proof verification failed");

  let keyProof: JsonProof | undefined = undefined;
  let keysProof: JsonProof | undefined = undefined;

  const nft = new RollupNFT();
  nft.loadMetadata(JSON.stringify(uri));
  const json = nft.toJSON({ includePrivateData: true });
  console.log("RollupNFT json:", json);

  if (onChain) {
    const key = Encoding.stringToFields(keys[0])[0];
    const kind = Encoding.stringToFields(uri.properties[keys[0]].kind)[0];
    const data = Encoding.stringToFields(uri.properties[keys[0]].data)[0];
    console.time("KeyVerifier compiled");
    const { verificationKey } = await KeyVerifier.compile();
    console.timeEnd("KeyVerifier compiled");
    const { root, map } = nft.getMetadataRootAndMap();
    const witness = map.getWitness(key);
    const proof = await KeyVerifier.verify(
      new KeyVerification({
        nft: nameInfo.rollupNFT,
        key,
        kind,
        data,
      }),
      witness
    );
    keyProof = proof.toJSON();
    await verifyKeyOnChain({
      verificationData: {
        blockAddress: PublicKey.fromBase58(block.address),
        blockRoot: block.root,
      },
      rollupProof,
      keyProof: proof,
    });
  } else {
    const redactedNFT = new RedactedMinaNFT(nft);
    for (const key of keys) {
      if (debug()) console.log(`key:`, key);
      redactedNFT.copyMetadata(key);
    }
    const proof = await redactedNFT.proof(debug());
    if (debug()) console.log(`proof:`, proof);
    keysProof = proof.toJSON();
  }

  const proofJson = {
    name: uri.name,
    address: uri.address,
    blockAddress: block.address,
    blockNumber: block.blockNumber,
    blockRoot: block.root.toJSON(),
    keys: keyvalues,
    rollupProof: rollupProofJson,
    keysProof,
    keyProof,
  };

  if (debug()) console.log("proofJSON", proofJson);
  const filename = await save({
    filename: name,
    type: "rollup.proof",
    data: proofJson,
    allowRewrite: true,
  });

  console.log(
    `Rollup NFT ${name} metadata has been proven and written to ${filename}`
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
