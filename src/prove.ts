import { Field, MerkleTree, MerkleMapWitness, Encoding, MerkleMap } from "o1js";

import cliProgress from "cli-progress";
import fs from "fs/promises";

function calculateMerkleTreeHeight(n: number): number {
  // We'll use the Math.log2 function to calculate the log base 2 of n,
  // and Math.ceil to round up to the nearest integer
  const result: number = Math.ceil(Math.log2(n)) + 1;
  return result < 2 ? 2 : result;
}

export async function prove(file: string, sanitized: string) {
  const filename = file;
  const text = await fs.readFile("./" + file, "utf8");
  //console.log(text);
  const sanitizedText =
    sanitized == "" ? text : await fs.readFile("./" + sanitized, "utf8");
  //console.log(sanitizedText);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(text.length * 2 - 2, 0);

  const height: number = calculateMerkleTreeHeight(text.length);
  if (height > 32) {
    console.error("File is too big");
    return;
  }
  const tree: MerkleTree = new MerkleTree(height);
  let i: number;
  const textFields: Field[] = [];

  const startTime = Date.now();

  for (i = 0; i < text.length; i++) {
    textFields.push(Encoding.stringToFields(text.substr(i, 1))[0]);
    bar.update(i);
  }
  await tree.fill(textFields);
  const root: Field = tree.getRoot();

  const map: MerkleMap = new MerkleMap();
  const fieldFilename: Field = Encoding.stringToFields(filename)[0];
  const fieldHeight: Field = Encoding.stringToFields(`H/${filename}`)[0];
  map.set(fieldFilename, root);
  map.set(fieldHeight, Field(height));
  const mapWitnessFilename: MerkleMapWitness = map.getWitness(fieldFilename);
  const mapWitnessHeight: MerkleMapWitness = map.getWitness(fieldHeight);

  const wa = [];
  for (i = 0; i < text.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wt: any;
    if (sanitizedText.substr(i, 1) !== "X") wt = tree.getWitness(BigInt(i));
    else wt = [{ isLeft: false, sibling: "" }];
    wa.push(wt);
    bar.update(i + text.length);
  }
  bar.stop();
  const endTime = Date.now();
  const delay = formatWinstonTime(endTime - startTime);

  console.error(
    "Took",
    delay,
    "or",
    formatWinstonTime(
      parseInt(((endTime - startTime) / text.length).toString())
    ),
    "per char"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proof: any = {
    name: "@john",
    filename,
    map: {
      root: map.getRoot(),
      witnessFilename: mapWitnessFilename.toJSON(),
      witnessHeight: mapWitnessHeight.toJSON(),
    },
    height,
    root: Field.toJSON(root),
    sanitizedText,
    witnesses: wa,
  };

  const writeData = JSON.stringify(proof, (_, v) =>
    typeof v === "bigint" ? v.toString() : v
  )
    .replaceAll("},", "},\n")
    .replaceAll("[", "[\n")
    .replaceAll("]", "\n]");
  //console.log(writeData);

  const proofFilename = filename + ".json";
  await fs.writeFile(proofFilename, writeData);
  console.log("Proof is written to", proofFilename);
}

function formatWinstonTime(ms: number): string {
  if (ms === undefined) return "";
  if (ms < 1000) return ms.toString() + " ms";
  if (ms < 60 * 1000)
    return parseInt((ms / 1000).toString()).toString() + " sec";
  if (ms < 60 * 60 * 1000)
    return parseInt((ms / 1000 / 60).toString()).toString() + " min";
  return parseInt((ms / 1000 / 60 / 60).toString()).toString() + " h";
}
