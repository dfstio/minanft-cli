import { debug } from "./debug";
import { write } from "./files";
import { RedactedTree, MinaNFTTreeVerifierFunction } from "minanft";
import { redactText } from "./redact";
import { MerkleTree, Field, Poseidon, verify } from "o1js";
import fs from "fs/promises";
import { RedactedFileEncoding, FileTreeData } from "./model/fileData";
import path from "path";
import { pngFoFields } from "./png";

const BINARY_ZERO = 0;

export async function redactedProof(
  originalFilename: string,
  maskFilename: string | undefined,
  redactedFilename: string | undefined,
  type: RedactedFileEncoding
) {
  if (debug())
    console.log("Creating redacted proof:\n", {
      originalFilename,
      maskFilename,
      redactedFilename,
      type,
    });

  const name = path.basename(originalFilename);
  if (type === "text") {
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
      data: { filename: name, ...proof },
      filename: name + ".redacted",
      type: "proof",
      allowRewrite: true,
    });
  } else if (type === "png") {
    if (maskFilename !== undefined)
      throw new Error(`Mask file is not supported for png files`);
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
    const proof = await generateRedactedBinaryProof(original, redacted);
    if (debug()) console.log(`png proof`, proof);
    const filename = await write({
      data: { filename: name, ...proof },
      filename: name + ".redacted",
      type: "proof",
      allowRewrite: true,
    });
    console.log(`Redacted proof for ${name} has been written to ${filename}`);
  } else throw new Error(`Unknown redacted file type ${type}`);
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

export async function verifyRedactedProof(
  name: string,
  png: string | undefined
) {
  if (debug()) console.log("Verifying redacted proof:\n", { name });
  const data = await fs.readFile(name, "utf8");
  if (data === undefined) throw new Error(`Proof ${name} not found`);
  const proof = JSON.parse(data)?.data;
  if (proof === undefined) throw new Error(`Proof ${name} has wrong format`);
  if (png === undefined) {
    const ok = await verifyRedactedTextProofJSON(proof, name);
    if (ok) console.log(`Proof ${name} is valid`);
  } else {
    const ok = await verifyRedactedPNGProofJSON(proof, name, png);
    if (ok) console.log(`Proof ${name} is valid`);
  }
}

export async function verifyRedactedPNGProofJSON(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proof: any,
  name: string,
  png: string
): Promise<boolean> {
  /*
    "length": 30,
    "height": 6,
    "count": 15,
    "originalRoot": "19111215407736447392962954633966993967454133223071387177311565127363332333909",
    "redactedRoot": "1515893462417911403681054509924994231732480396944012764047484206115367514910",
    "proof": {
  */
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
  if (proof.proof.publicInput === undefined)
    throw new Error(`Proof ${name} has wrong format`);
  if (
    proof.originalRoot !== proof.proof.publicInput[0] &&
    proof.redactedRoot !== proof.proof.publicInput[1] &&
    proof.count !== proof.proof.publicInput[3]
  ) {
    console.error(`Proof ${name} is NOT valid`);
    return false;
  }

  const redactedFields = await pngFoFields(png);

  const redacted = loadBinaryTreeFromFields(redactedFields, true);
  if (proof.height !== redacted.height)
    throw new Error(`Original and redacted trees have different heights`);
  if (proof.length !== redacted.leavesNumber)
    throw new Error(`Proof and redacted files have different length`);

  if (redacted.root.toJSON() !== proof.proof.publicInput[1]) {
    if (debug()) console.log(`redacted.root`, redacted.root.toJSON());
    console.error(`Proof ${name} is NOT valid`);
    return false;
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
    return false;
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
    return false;
  }
  return true;
}

export async function verifyRedactedTextProofJSON(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proof: any,
  name: string
): Promise<boolean> {
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
    return false;
  }
  const redacted = await loadTextTree(proof.redactedText, true);
  if (redacted.root.toJSON() !== proof.proof.publicInput[1]) {
    if (debug()) console.log(`redacted.root`, redacted.root.toJSON());
    console.error(`Proof ${name} is NOT valid`);
    return false;
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
    return false;
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
    return false;
  }
  return true;
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
  const proof = await redactedTree.proof(debug());
  const proofJSON = proof.toJSON();
  if (debug()) console.log(`proof`, proofJSON);
  return {
    length: originalText.length,
    height: original.height,
    count,
    redactedText,
    originalRoot: original.root.toJSON(),
    redactedRoot: redactedTree.redactedTree.getRoot().toJSON(),
    proof: proofJSON,
  };
}

export async function generateRedactedBinaryProof(
  original: FileTreeData,
  redacted: FileTreeData
) {
  if (debug()) console.log("Creating redacted binary proof:\n");

  if (original.leavesNumber !== redacted.leavesNumber)
    throw new Error(`Original and redacted files have different length`);
  if (original.leavesNumber <= 2) throw new Error(`Original file is empty`);

  const redactedTree = new RedactedTree(original.height, original.tree);
  const zero = Field.from(BINARY_ZERO);
  if (debug()) console.log(`zero`, zero.toJSON());
  let count = 2;
  redactedTree.set(0, original.fields[0]);
  redactedTree.set(1, original.fields[1]);
  for (let i = 2; i < original.leavesNumber; i++) {
    if (
      original.fields[i].equals(redacted.fields[i]).toBoolean() === true &&
      redacted.fields[i].equals(zero).toBoolean() === false
    ) {
      redactedTree.set(i, original.fields[i]);
      count++;
    } else if (redacted.fields[i].equals(zero).toBoolean() === false)
      throw new Error(
        `Redacted field ${redacted.fields[
          i
        ].toJSON()} is not equal to zero at index ${i}`
      );
  }
  const proof = await redactedTree.proof(debug());
  const proofJSON = proof.toJSON();
  if (debug()) console.log(`proof`, proofJSON);
  return {
    length: original.leavesNumber,
    height: original.height,
    count,
    originalRoot: original.root.toJSON(),
    redactedRoot: redactedTree.redactedTree.getRoot().toJSON(),
    proof: proofJSON,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loadBinaryTree(
  filename: string,
  skipZeros = false
): Promise<FileTreeData> {
  const fields: Field[] = [];
  let remainder: Uint8Array = new Uint8Array(0);

  const file: fs.FileHandle = await fs.open(filename);
  const stream = file.createReadStream();

  function fillFields(bytes: Uint8Array): void {
    let currentBigInt = BigInt(0);
    let bitPosition = BigInt(0);
    for (const byte of bytes) {
      currentBigInt += BigInt(byte) << bitPosition;
      bitPosition += BigInt(8);
      if (bitPosition === BigInt(248)) {
        fields.push(Field(currentBigInt.toString()));
        currentBigInt = BigInt(0);
        bitPosition = BigInt(0);
      }
    }
    if (Number(bitPosition) > 0) fields.push(Field(currentBigInt.toString()));
  }
  for await (const chunk of stream) {
    if (debug()) console.log(`chunk`, chunk);
    const bytes: Uint8Array = new Uint8Array(remainder.length + chunk.length);
    if (remainder.length > 0) bytes.set(remainder);
    bytes.set(chunk as Buffer, remainder.length);
    const fieldsNumber = Math.floor(bytes.length / 31);
    const chunkSize = fieldsNumber * 31;
    fillFields(bytes.slice(0, chunkSize));
    remainder = bytes.slice(chunkSize);
  }
  if (debug()) console.log(`remainder`, remainder.length);
  if (remainder.length > 0) fillFields(remainder);

  if (debug()) console.log(`fields length`, fields.length);
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
  let count = 2;
  let hash = Poseidon.hash([Field(0), Field.from(height)]).add(
    Poseidon.hash([Field(1), Field.from(fields.length)])
  );
  const zero = Field.from(BINARY_ZERO).toJSON();
  for (let i = 0; i < fields.length; i++) {
    if (skipZeros === false || fields[i].toJSON() !== zero) {
      count++;
      hash = hash.add(Poseidon.hash([Field(i + 2), fields[i]]));
    }
  }
  if (debug())
    console.log(`Loaded binary tree from ${filename}:\n`, {
      root: root.toJSON(),
      height,
      leavesNumber,
    });
  return {
    root,
    height,
    leavesNumber,
    tree,
    fields: fields2,
    count,
    hash,
  } as FileTreeData;
}

export function loadBinaryTreeFromFields(
  fields: Field[],
  skipZeros = false
): FileTreeData {
  if (debug()) console.log(`fields length`, fields.length);
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
  let count = 2;
  let hash = Poseidon.hash([Field(0), Field.from(height)]).add(
    Poseidon.hash([Field(1), Field.from(fields.length)])
  );
  const zero = Field.from(BINARY_ZERO).toJSON();
  for (let i = 0; i < fields.length; i++) {
    if (skipZeros === false || fields[i].toJSON() !== zero) {
      count++;
      hash = hash.add(Poseidon.hash([Field(i + 2), fields[i]]));
    }
  }
  if (debug())
    console.log(`Loaded binary tree:\n`, {
      root: root.toJSON(),
      height,
      leavesNumber,
    });
  return {
    root,
    height,
    leavesNumber,
    tree,
    fields: fields2,
    count,
    hash,
  } as FileTreeData;
}

async function loadTextTree(
  text: string,
  skipSpaces = false
): Promise<FileTreeData> {
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
  return {
    root,
    height,
    leavesNumber,
    tree,
    fields,
    count,
    hash,
  } as FileTreeData;
}
