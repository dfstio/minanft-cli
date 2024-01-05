import { write, load, isFileExist } from "./files";
import { debug } from "./debug";
import { MaskData } from "./model/maskData";

export async function mask(
  name: string,
  start: string,
  end: string
): Promise<void> {
  if (debug()) console.log("Setting mask:\n", { name, start, end });
  try {
    const data: MaskData[] = [];
    data.push({ start: parseInt(start), end: parseInt(end) });
    const oldMasksExist = await isFileExist({ filename: name, type: "mask" });
    if (oldMasksExist) {
      const oldMasks = await load({ filename: name, type: "mask" });
      if (oldMasks) {
        for (const oldMask of oldMasks.mask) {
          data.push(oldMask);
        }
      }
    }
    await write({
      data: { mask: data },
      filename: name,
      type: "mask",
      allowRewrite: true,
    });
    console.log(
      `Mask ${name} has been set to:\n`,
      JSON.stringify(data, null, 2)
    );
  } catch (e) {
    console.error("Mask setting failed:", e);
  }
}
