import { loadText, saveText } from "./files";
import { debug } from "./debug";
import path from "path";

export async function regexp(name: string, mask: string) {
  if (debug()) console.log("Redacting file", { name, mask });
  const redactedFilename = "./data/redacted_" + path.basename(name);
  let data = await loadText(name);
  if (data === undefined) throw new Error(`File ${name} not found`);
  if (debug()) console.log("Original text:", data);
  if (debug()) console.log(data);
  if (debug()) console.log("Mask:");
  if (debug()) console.log(mask);
  const length = data.length;
  data = data.replace(new RegExp(mask, "g"), " ");
  if (debug()) console.log("Redacted text:");
  if (debug()) console.log(data);
  if (data.length !== length)
    throw new Error(
      `Redacted text length is different from original text length`
    );
  await saveText({ data, filename: redactedFilename });
}
