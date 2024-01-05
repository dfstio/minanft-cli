import { loadBinary, loadText, load, saveBinary, saveText } from "./files";
import { FileEncoding } from "./model/fileData";
import { MaskData } from "./model/maskData";
import { debug } from "./debug";
import path from "path";

export async function redact(name: string, mask: string, type: FileEncoding) {
  if (debug()) console.log("Redacting file", { name, mask, type });
  const redactedFilename = "./data/redacted_" + path.basename(name);
  const masks: MaskData[] = await loadMask(mask);
  if (type === "text") {
    if (debug()) console.log("Redacting text file", { name, mask, type });
    let data = await loadText(name);
    if (data === undefined) throw new Error(`File ${name} not found`);
    const length = data.length;
    for (const mask of masks) {
      const start = mask.start < length ? mask.start : length;
      const end = mask.end < length ? mask.end : length;
      data = data.slice(0, start).padEnd(end) + data.slice(end, length);
      if (data.length !== length)
        throw new Error(`Redacted data length is wrong`);
    }
    if (debug()) console.log("Redacted text:\n", data);
    await saveText({ data, filename: redactedFilename });
  }
}

export async function redactText(
  originalText: string,
  mask: string
): Promise<string> {
  if (debug()) console.log("Redacting text", { originalText, mask });
  const masks: MaskData[] = await loadMask(mask);
  let data = originalText;
  const length = data.length;
  for (const mask of masks) {
    const start = mask.start < length ? mask.start : length;
    const end = mask.end < length ? mask.end : length;
    data = data.slice(0, start).padEnd(end) + data.slice(end, length);
    if (data.length !== length)
      throw new Error(`Redacted data length is wrong`);
  }
  if (debug()) console.log("Redacted text:\n", data);
  return data;
}

export async function loadMask(mask: string): Promise<MaskData[]> {
  const data = await load({ filename: mask, type: "mask" });
  if (debug()) console.log(`masks`, data);
  if (data === undefined) throw new Error(`Mask ${mask} not found`);
  if (data.mask === undefined) throw new Error(`Mask ${mask} has no mask`);
  if (data.mask.length === 0) throw new Error(`Mask ${mask} has no mask`);
  for (const mask of data.mask) {
    if (mask.start >= mask.end) {
      console.error(
        `Mask ${mask} has wrong start and end:`,
        mask.start,
        mask.end
      );
      throw new Error(`Mask has invalid format`);
    }
  }
  return data.mask;
}
