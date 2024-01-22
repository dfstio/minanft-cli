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
import { verifyRedactedTextProofJSON } from "./redactedproof";

export async function verifyText(name: string, key: string) {
  try {
    if (debug()) console.log("Verifying NFT text:\n", { name, key });
    const proofJson = await loadPlain({
      filename: name + "." + key,
      type: "proof",
    });
    if (debug()) console.log("proofJson:\n", { proofJson });
    if (proofJson === undefined) throw new Error(`Proof ${name} not found`);
    const files = proofJson.texts;
    if (files === undefined) throw new Error(`Proof for ${name} not found`);
    if (files.length < 1) throw new Error(`Proof for ${name} is empty`);
    const proof = files[0].textProof;
    if (proof === undefined) throw new Error(`Proof ${name} is empty`);
    if (proof.originalRoot === undefined)
      throw new Error(`Proof ${name} is not valid`);
    const hash = Poseidon.hash([
      MinaNFT.stringToField(key),
      Field.fromJSON(proof.originalRoot),
      MinaNFT.stringToField("text"),
    ]);

    if (hash.toJSON() !== files[0].proof.publicInput[4])
      throw new Error(`Proof ${name} is not valid`);

    const checkJson = await check(
      files[0],
      [
        {
          key,
          kind: "text",
          value: Field.fromJSON(proof.originalRoot),
        },
      ],
      proofJson.address,
      proofJson.version
    );
    if (!checkJson) throw new Error(`Proof ${name} is not valid`);
    else
      console.log(`Metadata check for ${name} passed, compiling contracts...`);
    const checkText = await verifyRedactedTextProofJSON(
      proof,
      name + "." + key
    );
    if (!checkText) throw new Error(`Proof for ${name} is not valid`);

    const verificationKey = (await RedactedMinaNFTMapCalculation.compile({}))
      .verificationKey;
    const ok = await verify(files[0].proof as JsonProof, verificationKey);
    if (!ok) throw new Error(`Proof ${name} is not valid`);

    console.log(`Proof for the text ${key} of the NFT ${name} is valid`);
  } catch (e) {
    console.error(`Proof for ${name} is not valid:`, e);
  }
}

async function check(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any,
  keys: { key: string; kind: string; value: Field }[],
  address: string,
  version: string
): Promise<boolean> {
  if (
    json.proof === undefined ||
    json.proof.publicInput === undefined ||
    json.proof.publicInput.length !== 6 ||
    keys === undefined ||
    keys.length !== parseInt(json.proof?.publicInput[5])
  ) {
    console.log("JSON proof error", json.proof);
    return false;
  }
  const data = new MerkleMap();
  const kind = new MerkleMap();
  let hash = Field(0);

  for (let i = 0; i < keys.length; i++) {
    if (debug()) console.log("item", keys[i]);
    const key = MinaNFT.stringToField(keys[i].key);
    const value = keys[i].value;
    const kindField = MinaNFT.stringToField(keys[i].kind);
    data.set(key, value);
    kind.set(key, kindField);
    /*
      hash: Poseidon.hash([
        element.key,
        element.value.data,
        element.value.kind,
      ]),
      hash: state1.hash.add(state2.hash),
      */
    hash = hash.add(Poseidon.hash([key, value, kindField]));
  }
  if (
    data.getRoot().toJSON() !== json.proof?.publicInput[2] ||
    kind.getRoot().toJSON() !== json.proof?.publicInput[3] ||
    hash.toJSON() !== json.proof?.publicInput[4]
  ) {
    console.error(
      "redacted metadata check error\n",
      data.getRoot().toJSON(),
      "\n",
      json.proof?.publicInput[2],
      "\n",
      kind.getRoot().toJSON(),
      "\n",
      json.proof?.publicInput[3]
    );
    return false;
  }
  if (!offline()) {
    MinaNFT.minaInit("berkeley");
    const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
    const zkNames = new MinaNFTNameServiceContract(nameServiceAddress);
    const zkApp = new MinaNFTContract(
      PublicKey.fromBase58(address),
      zkNames.token.id
    );
    await fetchAccount({ publicKey: zkApp.address, tokenId: zkNames.token.id });
    const metadata = zkApp.metadata.get();
    const versionApp = zkApp.version.get();
    if (
      metadata.data.toJSON() !== json.proof?.publicInput[0] ||
      metadata.kind.toJSON() !== json.proof?.publicInput[1] ||
      versionApp.toJSON() !== version.toString()
    ) {
      console.error(
        "metadata check error",
        metadata.data.toJSON(),
        json.proof?.publicInput[0],
        metadata.kind.toJSON(),
        json.proof?.publicInput[1],
        versionApp.toJSON(),
        version.toString()
      );
      return false;
    }
  } else console.log("Offline mode, skipping on-chain metadata check");
  return true;
}
