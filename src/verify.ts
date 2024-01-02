import { Field, MerkleMapWitness, Encoding, MerkleWitness } from "o1js";

import cliProgress from "cli-progress";
import fs from "fs/promises";

class MerkleWitness2 extends MerkleWitness(2) {}
class MerkleWitness3 extends MerkleWitness(3) {}
class MerkleWitness4 extends MerkleWitness(4) {}
class MerkleWitness5 extends MerkleWitness(5) {}
class MerkleWitness6 extends MerkleWitness(6) {}
class MerkleWitness7 extends MerkleWitness(7) {}
class MerkleWitness8 extends MerkleWitness(8) {}
class MerkleWitness9 extends MerkleWitness(9) {}
class MerkleWitness10 extends MerkleWitness(10) {}
class MerkleWitness11 extends MerkleWitness(11) {}
class MerkleWitness12 extends MerkleWitness(12) {}
class MerkleWitness13 extends MerkleWitness(13) {}
class MerkleWitness14 extends MerkleWitness(14) {}
class MerkleWitness15 extends MerkleWitness(15) {}
class MerkleWitness16 extends MerkleWitness(16) {}
class MerkleWitness17 extends MerkleWitness(17) {}
class MerkleWitness18 extends MerkleWitness(18) {}
class MerkleWitness19 extends MerkleWitness(19) {}
class MerkleWitness20 extends MerkleWitness(20) {}
class MerkleWitness21 extends MerkleWitness(21) {}
class MerkleWitness22 extends MerkleWitness(22) {}
class MerkleWitness23 extends MerkleWitness(23) {}
class MerkleWitness24 extends MerkleWitness(24) {}
class MerkleWitness25 extends MerkleWitness(25) {}
class MerkleWitness26 extends MerkleWitness(26) {}
class MerkleWitness27 extends MerkleWitness(27) {}
class MerkleWitness28 extends MerkleWitness(28) {}
class MerkleWitness29 extends MerkleWitness(29) {}
class MerkleWitness30 extends MerkleWitness(30) {}
class MerkleWitness31 extends MerkleWitness(31) {}
class MerkleWitness32 extends MerkleWitness(32) {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWitness(height: number, w: any): any {
  switch (height) {
    case 2:
      return new MerkleWitness2(w);
    case 3:
      return new MerkleWitness3(w);
    case 4:
      return new MerkleWitness4(w);
    case 5:
      return new MerkleWitness5(w);
    case 6:
      return new MerkleWitness6(w);
    case 7:
      return new MerkleWitness7(w);
    case 8:
      return new MerkleWitness8(w);
    case 9:
      return new MerkleWitness9(w);
    case 10:
      return new MerkleWitness10(w);
    case 11:
      return new MerkleWitness11(w);
    case 12:
      return new MerkleWitness12(w);
    case 13:
      return new MerkleWitness13(w);
    case 14:
      return new MerkleWitness14(w);
    case 15:
      return new MerkleWitness15(w);
    case 16:
      return new MerkleWitness16(w);
    case 17:
      return new MerkleWitness17(w);
    case 18:
      return new MerkleWitness18(w);
    case 19:
      return new MerkleWitness19(w);
    case 20:
      return new MerkleWitness20(w);
    case 21:
      return new MerkleWitness21(w);
    case 22:
      return new MerkleWitness22(w);
    case 23:
      return new MerkleWitness23(w);
    case 24:
      return new MerkleWitness24(w);
    case 25:
      return new MerkleWitness25(w);
    case 26:
      return new MerkleWitness26(w);
    case 27:
      return new MerkleWitness27(w);
    case 28:
      return new MerkleWitness28(w);
    case 29:
      return new MerkleWitness29(w);
    case 30:
      return new MerkleWitness30(w);
    case 31:
      return new MerkleWitness31(w);
    default:
      return new MerkleWitness32(w);
  }
}

export async function verifyProof(file: string) {
  const proofString = await fs.readFile("./" + file, "utf8");
  const proof = JSON.parse(proofString);

  const text = proof.sanitizedText;
  const height = proof.height;
  const filename = proof.filename;
  if (height > 32) {
    console.error("File is too big");
    return;
  }

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(text.length - 1, 0);
  //console.log("Verifying proof...", text.length, height);
  const startTime = Date.now();
  let pass = true;

  const fieldFilename: Field = Encoding.stringToFields(filename)[0];
  const fieldHeight: Field = Encoding.stringToFields(`H/${filename}`)[0];
  const mapWitnessFilename: MerkleMapWitness = MerkleMapWitness.fromJSON(
    proof.map.witnessFilename
  );
  const mapWitnessHeight: MerkleMapWitness = MerkleMapWitness.fromJSON(
    proof.map.witnessHeight
  );
  const calculatedRootFilename: Field[] = mapWitnessFilename.computeRootAndKey(
    Field(proof.root)
  );
  const calculatedRootHeight: Field[] = mapWitnessHeight.computeRootAndKey(
    Field(height)
  );
  if (Field.toJSON(calculatedRootFilename[0]) !== proof.map.root) {
    console.error("wrong map");
    pass = false;
    return;
  }
  if (Field.toJSON(calculatedRootHeight[0]) !== proof.map.root) {
    console.error("wrong map");
    pass = false;
    return;
  }
  if (Field.toJSON(calculatedRootFilename[1]) !== Field.toJSON(fieldFilename)) {
    console.error("wrong map");
    pass = false;
    return;
  }
  if (Field.toJSON(calculatedRootHeight[1]) !== Field.toJSON(fieldHeight)) {
    console.error("wrong map");
    pass = false;
    return;
  }

  let i: number;

  for (i = 0; i < text.length; i++) {
    if (proof.witnesses[i][0].sibling !== "") {
      const data = proof.witnesses[i];
      const w = [];
      for (const item of data)
        w.push({ isLeft: item.isLeft, sibling: Field(item.sibling) });
      const mw = getWitness(height, w);
      const calculatedRoot: Field = mw.calculateRoot(
        Encoding.stringToFields(text.substr(i, 1))[0]
      );
      if (proof.root !== Field.toJSON(calculatedRoot)) pass = false;
    }
    bar.update(i);
  }
  bar.stop();
  const endTime = Date.now();
  const delay = formatWinstonTime(endTime - startTime);
  console.error(
    "Passed",
    pass,
    "\ntook",
    delay,
    "or",
    formatWinstonTime(
      parseInt(((endTime - startTime) / text.length).toString())
    ),
    "per char"
  );
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
