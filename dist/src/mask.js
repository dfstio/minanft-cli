"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mask = void 0;
const files_1 = require("./files");
const debug_1 = require("./debug");
async function mask(name, start, end) {
    if ((0, debug_1.debug)())
        console.log("Setting mask:\n", { name, start, end });
    try {
        const data = [];
        data.push({ start: parseInt(start), end: parseInt(end) });
        const oldMasksExist = await (0, files_1.isFileExist)({ filename: name, type: "mask" });
        if (oldMasksExist) {
            const oldMasks = await (0, files_1.load)({ filename: name, type: "mask" });
            if (oldMasks) {
                for (const oldMask of oldMasks.mask) {
                    data.push(oldMask);
                }
            }
        }
        await (0, files_1.write)({
            data: { mask: data },
            filename: name,
            type: "mask",
            allowRewrite: true,
        });
        console.log(`Mask ${name} has been set to:\n`, JSON.stringify(data, null, 2));
    }
    catch (e) {
        console.error("Mask setting failed:", e);
    }
}
exports.mask = mask;
