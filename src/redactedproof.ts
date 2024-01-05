import { debug } from "./debug";
import { write } from "./files";
import { RedactedTree, MinaNFTTreeVerifierFunction } from "minanft";
import { redactText } from "./redact";
import { MerkleTree, Field, Encoding, Poseidon, verify } from "o1js";
import fs from "fs/promises";
import { FileEncoding } from "./model/fileData";
import path from "path";

export async function redactedProof(
  originalFilename: string,
  maskFilename: string | undefined,
  redactedFilename: string | undefined,
  type: FileEncoding
) {
  if (debug())
    console.log("Creating redacted proof:\n", {
      originalFilename,
      maskFilename,
      redactedFilename,
      type,
    });

  const name = path.basename(originalFilename);
  const originalText = await fs.readFile(originalFilename, "utf8");
  if (originalText === undefined)
    throw new Error(`Original file ${originalFilename} not found`);
  const redactedText = await getRedactedText(
    originalText,
    maskFilename,
    redactedFilename
  );

  const proof = await generateRedactedTextProof(originalText, redactedText);
  await write({
    data: { filename: name, redactedText, ...proof },
    filename: name + ".redacted",
    type: "proof",
    allowRewrite: true,
  });
}

export async function getRedactedText(
  originalText: string,
  maskFilename: string | undefined,
  redactedFilename: string | undefined
) {
  let redactedText = "";
  if (redactedFilename !== undefined) {
    redactedText = await fs.readFile(redactedFilename, "utf8");
    if (redactedText === undefined)
      throw new Error(`Redacted file ${redactedFilename} not found`);
  } else if (maskFilename !== undefined) {
    redactedText = await redactText(originalText, maskFilename);
  } else throw new Error(`Either mask or redacted file must be provided`);
  if (originalText.length !== redactedText.length)
    throw new Error(`Original and redacted files have different length`);
  return redactedText;
}

export async function verifyRedactedProof(name: string) {
  if (debug()) console.log("Verifying redacted proof:\n", { name });
  const data = await fs.readFile(name, "utf8");
  if (data === undefined) throw new Error(`Proof ${name} not found`);
  const proof = JSON.parse(data)?.data;
  if (proof === undefined) throw new Error(`Proof ${name} has wrong format`);
  if (proof.length === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (proof.height === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (proof.count === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (proof.originalRoot === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (proof.redactedRoot === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (proof.proof === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (proof.redactedText === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (proof.proof.publicInput === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (
    proof.redactedText.length.toString() !== proof.length &&
    proof.originalRoot !== proof.proof.publicInput[0] &&
    proof.redactedRoot !== proof.proof.publicInput[1] &&
    proof.count !== proof.proof.publicInput[3]
  ) {
    console.error(`Proof ${name} is NOT valid`);
    return;
  }
  const redacted = await loadTextTree(proof.redactedText, true);
  if (redacted.root.toJSON() !== proof.proof.publicInput[1]) {
    if (debug()) console.log(`redacted.root`, redacted.root.toJSON());
    console.error(`Proof ${name} is NOT valid`);
    return;
  }
  if (
    redacted.count !== proof.count ||
    redacted.hash.toJSON() !== proof.proof.publicInput[2]
  ) {
    if (debug())
      console.log(
        `redacted.count`,
        redacted.count,
        `redacted.hash`,
        redacted.hash.toJSON()
      );
    console.error(`Proof ${name} is NOT valid`);
    return;
  }
  const contracts = MinaNFTTreeVerifierFunction(Number(proof.height));
  console.time(`compiled RedactedTreeCalculation`);
  const verificationKey = (
    await contracts.RedactedMinaNFTTreeCalculation.compile()
  ).verificationKey;
  console.timeEnd(`compiled RedactedTreeCalculation`);
  const ok = await verify(proof.proof, verificationKey);
  if (debug()) console.log(`proof verification result:`, ok);
  if (!ok) {
    console.error(`Proof ${name} is NOT valid`);
    return;
  }
  console.log(`Proof ${name} is valid`);
}

export async function generateRedactedTextProof(
  originalText: string,
  redactedText: string
) {
  if (debug())
    console.log("Creating redacted proof:\n", {
      originalText,
      redactedText,
    });

  if (originalText.length !== redactedText.length)
    throw new Error(`Original and redacted texts have different length`);
  if (originalText.length === 0) throw new Error(`Original text is empty`);

  const original = await loadTextTree(originalText);
  /*
  const redacted = await loadTextTree(redactedText);

  if (original.height !== redacted.height)
    throw new Error(`Original and redacted trees have different heights`);
  if (original.leavesNumber !== redacted.leavesNumber)
    throw new Error(
      `Original and redacted trees have different number of leaves`
    );
  */
  const length = original.leavesNumber;
  if (length !== originalText.length + 2)
    throw new Error(
      `Original text length is different from original tree length`
    );
  const redactedTree = new RedactedTree(original.height, original.tree);
  const spaceStr = " ";
  const space = Field.from(spaceStr.charCodeAt(0));
  if (debug()) console.log(`space`, space.toJSON());
  let count = 2;
  redactedTree.set(0, original.fields[0]);
  redactedTree.set(1, original.fields[1]);
  for (let i = 2; i < length; i++) {
    if (
      originalText[i - 2] === redactedText[i - 2] &&
      redactedText[i - 2] !== spaceStr
    ) {
      redactedTree.set(i, original.fields[i]);
      count++;
    } else if (redactedText[i - 2] !== spaceStr)
      throw new Error(`Redacted text is not equal to space at index ${i}`);
  }
  const proof = await redactedTree.proof();
  const proofJSON = proof.toJSON();
  if (debug()) console.log(`proof`, proofJSON);
  return {
    length: originalText.length,
    height: original.height,
    count,
    originalRoot: original.root.toJSON(),
    redactedRoot: redactedTree.redactedTree.getRoot().toJSON(),
    proof: proofJSON,
  };
}

async function loadBinaryTree(filename: string): Promise<{
  root: Field;
  height: number;
  leavesNumber: number;
  tree: MerkleTree;
  fields: Field[];
}> {
  const fields: Field[] = [];
  let remainder: Uint8Array = new Uint8Array(0);

  const file: fs.FileHandle = await fs.open(filename);
  const stream = file.createReadStream();
  for await (const chunk of stream) {
    const bytes: Uint8Array = new Uint8Array(remainder.length + chunk.length);
    if (remainder.length > 0) bytes.set(remainder);
    bytes.set(chunk as Buffer, remainder.length);
    const chunkSize = Math.floor(bytes.length / 31) * 31;
    fields.push(...Encoding.bytesToFields(bytes.slice(0, chunkSize)));
    remainder = bytes.slice(chunkSize);
  }
  if (remainder.length > 0) fields.push(...Encoding.bytesToFields(remainder));

  const height = Math.ceil(Math.log2(fields.length + 2)) + 1;
  const tree = new MerkleTree(height);
  if (fields.length > tree.leafCount)
    throw new Error(`File is too big for this Merkle tree`);
  // First field is the height, second number is the number of fields
  const fields2: Field[] = [
    Field.from(height),
    Field.from(fields.length),
    ...fields,
  ];
  tree.fill(fields2);
  const root = tree.getRoot();
  const leavesNumber = fields2.length;
  stream.close();
  if (debug())
    console.log(`Loaded binary tree from ${filename}:\n`, {
      root: root.toJSON(),
      height,
      leavesNumber,
    });
  return { root, height, leavesNumber, tree, fields: fields2 };
}

async function loadTextTree(
  text: string,
  skipSpaces = false
): Promise<{
  root: Field;
  height: number;
  leavesNumber: number;
  tree: MerkleTree;
  fields: Field[];
  count: number;
  hash: Field;
}> {
  const size = text.length;
  const height = Math.ceil(Math.log2(size + 2)) + 1;
  const tree = new MerkleTree(height);
  if (size + 2 > tree.leafCount)
    throw new Error(`Text is too big for this Merkle tree`);
  const fields: Field[] = [];
  tree.setLeaf(BigInt(0), Field.from(height));
  tree.setLeaf(BigInt(1), Field.from(size));
  fields.push(Field.from(height));
  fields.push(Field.from(size));
  let count = 2;
  let hash = Poseidon.hash([Field(0), Field.from(height)]).add(
    Poseidon.hash([Field(1), Field.from(size)])
  );
  for (let i = 0; i < size; i++) {
    const field = Field.from(text.charCodeAt(i));
    fields.push(field);
    if (skipSpaces === false || text[i] !== " ") {
      tree.setLeaf(BigInt(i + 2), field);
      count++;
      hash = hash.add(Poseidon.hash([Field(i + 2), field]));
    }
  }
  const root = tree.getRoot();
  const leavesNumber = fields.length;
  if (debug())
    console.log(`Loaded text tree:\n`, {
      root: root.toJSON(),
      height,
      leavesNumber,
      text,
      count,
      hash: hash.toJSON(),
    });
  return { root, height, leavesNumber, tree, fields, count, hash };
}
