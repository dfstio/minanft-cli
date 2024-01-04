import { loadBinary, loadText, load, saveBinary, saveText } from "./files";
import { FileEncoding } from "./model/fileData";
import { debug } from "./debug";
import path from "path";

export async function redact(name: string, mask: string, type: FileEncoding) {
  if (debug()) console.log("Redacting file", { name, mask, type });
  const redactedFilename = "./data/redacted_" + path.basename(name);
  const masks = await load({ filename: mask, type: "mask" });
  console.log(`masks`, masks);
  if (masks === undefined) throw new Error(`Mask ${mask} not found`);
  if (masks.mask === undefined) throw new Error(`Mask ${mask} has no mask`);
  if (masks.mask.length === 0) throw new Error(`Mask ${mask} has no mask`);
  for (const mask of masks.mask) {
    if (mask.start >= mask.end) {
      console.error(
        `Mask ${mask} has wrong start and end:`,
        mask.start,
        mask.end
      );
      return;
    }
  }
  if (type === "text") {
    if (debug()) console.log("Redacting text file", { name, mask, type });
    let data = await loadText(name);
    if (data === undefined) throw new Error(`File ${name} not found`);
    const length = data.length;
    for (const mask of masks.mask) {
      for (let i = mask.start; i < mask.end; i++) {
        const start = mask.start < length ? mask.start : length;
        const end = mask.end < length ? mask.end : length;

        data = data.slice(0, start).padEnd(end) + data.slice(end, length);
        if (data.length !== length)
          throw new Error(`Redacted data length is wrong`);
      }
    }
    if (debug()) console.log("Redacted text:\n", data);
    await saveText({ data, filename: redactedFilename });
  }
}
