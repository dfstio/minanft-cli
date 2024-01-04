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
  FileData,
  MinaNFT,
  MINANFT_NAME_SERVICE,
  MinaNFTContract,
  MinaNFTNameServiceContract,
  RedactedMinaNFTMapCalculation,
  File,
  FILE_TREE_HEIGHT,
  FILE_TREE_ELEMENTS,
  MinaNFTTreeVerifierFunction,
} from "minanft";

export async function verifyFile(name: string, key: string, file: string) {
  try {
    if (debug()) console.log("Verifying NFT file:\n", { name });
    const proofJson = await loadPlain({
      filename: name + "." + key,
      type: "proof",
    });
    if (debug()) console.log("proofJson:\n", { proofJson });
    if (proofJson === undefined) throw new Error(`Proof ${name} not found`);
    const files = proofJson.files;
    if (files === undefined) throw new Error(`Proof for ${name} not found`);
    if (files.length < 1) throw new Error(`Proof for ${name} is empty`);
    const checkFileResult = await checkFile(file, files[0].value);
    if (!checkFileResult) throw new Error(`Proof for ${name} is not valid`);
    const proof = files[0].proof;
    if (proof === undefined) throw new Error(`Proof ${name} is empty`);
    const checkJson = await check(
      files[0],
      [
        {
          key,
          kind: files[0].value.kind,
          value: Field.fromJSON(files[0].value.data),
        },
      ],
      proofJson.address,
      proofJson.version
    );
    if (!checkJson) throw new Error(`Proof ${name} is not valid`);
    else
      console.log(`Metadata check for ${name} passed, compiling contracts...`);
    const contracts = MinaNFTTreeVerifierFunction(FILE_TREE_HEIGHT);
    const fileVerificationKey = (
      await contracts.RedactedMinaNFTTreeCalculation.compile()
    ).verificationKey;
    const fileOk = verify(files[0].fileProof, fileVerificationKey);
    if (!fileOk) throw new Error(`Proof ${name} is not valid`);
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
async function checkFile(filename: string, data: any): Promise<boolean> {
  const file = new File(filename);
  await file.setMetadata();
  await file.treeData(false);
  await file.sha3_512();
  const fileData: FileData = await file.data();
  if (debug()) console.log("fileData", fileData);
  const proofData = FileData.fromJSON(data);
  if (debug()) console.log("proofData", proofData);
  fileData.storage = proofData.storage;
  fileData.fileRoot = proofData.fileRoot;
  fileData.height = proofData.height;
  const { fields: fileFields } = fileData.buildTree();
  const { fields: proofFields } = proofData.buildTree();
  if (
    fileFields.length !== proofFields.length ||
    fileFields.length !== FILE_TREE_ELEMENTS
  ) {
    console.error(
      "File data length mismatch",
      fileFields.length,
      proofFields.length
    );
    return false;
  }
  for (let i = 0; i < fileFields.length; i++) {
    if (fileFields[i].toJSON() !== proofFields[i].toJSON()) {
      console.error(
        "File data mismatch",
        fileFields[i].toJSON(),
        proofFields[i].toJSON()
      );
      return false;
    }
  }
  return true;
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
    MinaNFT.minaInit("testworld2");
    const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
    const zkNames = new MinaNFTNameServiceContract(nameServiceAddress);
    const zkApp = new MinaNFTContract(
      PublicKey.fromBase58(address),
      zkNames.token.id
    );
    await fetchAccount({ publicKey: zkApp.address, tokenId: zkNames.token.id });
    const metadata = zkApp.metadata.get();
    const version = zkApp.version.get();
    if (
      metadata.data.toJSON() !== json.proof?.publicInput[0] ||
      metadata.kind.toJSON() !== json.proof?.publicInput[1] ||
      version.toJSON() !== version.toString()
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
