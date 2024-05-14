"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMask = exports.redactText = exports.redact = void 0;
const files_1 = require("./files");
const debug_1 = require("./debug");
const path_1 = __importDefault(require("path"));
const png_1 = require("./png");
async function redact(name, mask, type) {
    if ((0, debug_1.debug)())
        console.log("Redacting file", { name, mask, type });
    const redactedFilename = "./data/redacted_" + path_1.default.basename(name);
    const masks = await loadMask(mask);
    if (type === "text") {
        if ((0, debug_1.debug)())
            console.log("Redacting text file", { name, mask, type });
        let data = await (0, files_1.loadText)(name);
        if (data === undefined)
            throw new Error(`File ${name} not found`);
        const length = data.length;
        for (const mask of masks) {
            const start = mask.start < length ? mask.start : length;
            const end = mask.end < length ? mask.end : length;
            data = data.slice(0, start).padEnd(end) + data.slice(end, length);
            if (data.length !== length)
                throw new Error(`Redacted data length is wrong`);
        }
        if ((0, debug_1.debug)())
            console.log("Redacted text:\n", data);
        await (0, files_1.saveText)({ data, filename: redactedFilename });
    }
    else if (type === "png") {
        await (0, png_1.redactpng)(name, masks, redactedFilename);
    }
    else
        throw new Error(`Unknown redacted file type ${type}`);
}
exports.redact = redact;
async function redactText(originalText, mask) {
    if ((0, debug_1.debug)())
        console.log("Redacting text", { originalText, mask });
    const masks = await loadMask(mask);
    let data = originalText;
    const length = data.length;
    for (const mask of masks) {
        const start = mask.start < length ? mask.start : length;
        const end = mask.end < length ? mask.end : length;
        data = data.slice(0, start).padEnd(end) + data.slice(end, length);
        if (data.length !== length)
            throw new Error(`Redacted data length is wrong`);
    }
    if ((0, debug_1.debug)())
        console.log("Redacted text:\n", data);
    return data;
}
exports.redactText = redactText;
async function loadMask(mask) {
    const data = await (0, files_1.load)({ filename: mask, type: "mask" });
    if ((0, debug_1.debug)())
        console.log(`masks`, data);
    if (data === undefined)
        throw new Error(`Mask ${mask} not found`);
    if (data.mask === undefined)
        throw new Error(`Mask ${mask} has no mask`);
    if (data.mask.length === 0)
        throw new Error(`Mask ${mask} has no mask`);
    for (const mask of data.mask) {
        if (mask.start >= mask.end) {
            console.error(`Mask ${mask} has wrong start and end:`, mask.start, mask.end);
            throw new Error(`Mask has invalid format`);
        }
    }
    return data.mask;
}
exports.loadMask = loadMask;
