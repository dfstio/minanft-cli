import Jimp from "jimp";
import { debug } from "./debug";
import fs from "fs/promises";
import { Field } from "o1js";
import { MaskData } from "./model/maskData";

export async function redactpng(
  name: string,
  masks: MaskData[],
  redactedFilename: string
) {
  if (debug()) console.log(`pngtobinary: ${name}`);
  const file = await fs.readFile(name);
  const png = await Jimp.read(file);
  if (debug())
    console.log("redactpng: ", {
      width: png.bitmap.width,
      height: png.bitmap.height,
      length: png.bitmap.data.length,
    });
  const length = png.bitmap.data.length / 4;
  for (const mask of masks) {
    const start = mask.start < length ? mask.start : length;
    const end = mask.end < length ? mask.end : length;
    for (let i = start * 4; i < end * 4; i++) {
      png.bitmap.data[i] = 0;
    }
  }
  await png.writeAsync(redactedFilename);
}

export async function pngFoFields(filename: string) {
  if (debug()) console.log(`pngToFields: ${filename}`);
  const file = await fs.readFile(filename);
  const png = await Jimp.read(file);
  if (debug())
    console.log("pngToFields: ", {
      width: png.bitmap.width,
      height: png.bitmap.height,
      length: png.bitmap.data.length,
    });
  const fields = [];
  fields.push(Field(png.bitmap.width));
  fields.push(Field(png.bitmap.height));
  fields.push(Field(png.bitmap.data.length));
  for (let i = 0; i < png.bitmap.data.length; i += 4) {
    const value =
      BigInt(png.bitmap.data[i]) +
      (BigInt(png.bitmap.data[i + 1]) << BigInt(8)) +
      (BigInt(png.bitmap.data[i + 2]) << BigInt(16)) +
      (BigInt(png.bitmap.data[i + 3]) << BigInt(24));
    fields.push(Field(value));
  }
  return fields;
}
