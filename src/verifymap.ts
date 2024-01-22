import { debug } from "./debug";
import { loadPlain } from "./files";
import { offline } from "./offline";
import {
  PublicKey,
  Field,
  Poseidon,
  MerkleMap,
  fetchAccount,
  verify,
  JsonProof,
} from "o1js";
import {
  MinaNFT,
  MINANFT_NAME_SERVICE,
  MinaNFTContract,
  MinaNFTNameServiceContract,
  RedactedMinaNFTMapCalculation,
} from "minanft";

export async function verifyMap(name: string) {
  try {
    if (debug()) console.log("Verifying NFT metadata:\n", { name });
    const proofJson = await loadPlain({ filename: name, type: "proof" });
    if (debug()) console.log("proofJson:\n", { proofJson });
    if (proofJson === undefined) throw new Error(`Proof ${name} not found`);
    const proof = proofJson.proof;
    if (proof === undefined) throw new Error(`Proof ${name} not found`);
    const checkJson = await check(proofJson);
    if (!checkJson) throw new Error(`Proof ${name} is not valid`);
    else
      console.log(`Metadata check for ${name} passed, compiling contract...`);
    const verificationKey = (await RedactedMinaNFTMapCalculation.compile({}))
      .verificationKey;
    const ok = await verify(proof as JsonProof, verificationKey);
    if (!ok) throw new Error(`Proof ${name} is not valid`);

    console.log(`Proof ${name} is valid`);
  } catch (e) {
    console.error(`Proof ${name} is not valid:`, e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function check(json: any) {
  if (
    json.proof === undefined ||
    json.proof.publicInput === undefined ||
    json.proof.publicInput.length !== 6 ||
    json.keys === undefined ||
    json.keys.length !== parseInt(json.proof?.publicInput[5])
  ) {
    console.log("JSON proof error", json.proof);
    return false;
  }
  const data = new MerkleMap();
  const kind = new MerkleMap();
  let hash = Field(0);
  const str = MinaNFT.stringToField("string");
  for (let i = 0; i < json.keys.length; i++) {
    if (debug()) console.log("item", json.keys[i]);
    const key = MinaNFT.stringToField(json.keys[i].key);
    const value = MinaNFT.stringToField(json.keys[i].value);
    data.set(key, value);
    kind.set(key, str);
    /*
      hash: Poseidon.hash([
        element.key,
        element.value.data,
        element.value.kind,
      ]),
      hash: state1.hash.add(state2.hash),
      */
    hash = hash.add(Poseidon.hash([key, value, str]));
  }
  if (
    data.getRoot().toJSON() !== json.proof?.publicInput[2] ||
    kind.getRoot().toJSON() !== json.proof?.publicInput[3] ||
    hash.toJSON() !== json.proof?.publicInput[4]
  ) {
    console.error(
      "redacted metadata check error",
      data.getRoot().toJSON(),
      json.proof?.publicInput[2],
      kind.getRoot().toJSON(),
      json.proof?.publicInput[3]
    );
    return false;
  }
  if (!offline()) {
    MinaNFT.minaInit("berkeley");
    const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
    const zkNames = new MinaNFTNameServiceContract(nameServiceAddress);
    const zkApp = new MinaNFTContract(
      PublicKey.fromBase58(json.address),
      zkNames.token.id
    );
    await fetchAccount({ publicKey: zkApp.address, tokenId: zkNames.token.id });
    const metadata = zkApp.metadata.get();
    const version = zkApp.version.get();
    if (
      metadata.data.toJSON() !== json.proof?.publicInput[0] ||
      metadata.kind.toJSON() !== json.proof?.publicInput[1] ||
      version.toJSON() !== json.version.toString()
    ) {
      console.error(
        "metadata check error",
        metadata.data.toJSON(),
        json.proof?.publicInput[0],
        metadata.kind.toJSON(),
        json.proof?.publicInput[1],
        version.toJSON(),
        json.version.toString()
      );
      return false;
    }
  } else console.log("Offline mode, skipping on-chain metadata check");
  return true;
}
