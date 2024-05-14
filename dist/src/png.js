"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pngFoFields = exports.redactpng = void 0;
const jimp_1 = __importDefault(require("jimp"));
const debug_1 = require("./debug");
const promises_1 = __importDefault(require("fs/promises"));
const o1js_1 = require("o1js");
async function redactpng(name, masks, redactedFilename) {
    if ((0, debug_1.debug)())
        console.log(`pngtobinary: ${name}`);
    const file = await promises_1.default.readFile(name);
    const png = await jimp_1.default.read(file);
    if ((0, debug_1.debug)())
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
exports.redactpng = redactpng;
async function pngFoFields(filename) {
    if ((0, debug_1.debug)())
        console.log(`pngToFields: ${filename}`);
    const file = await promises_1.default.readFile(filename);
    const png = await jimp_1.default.read(file);
    if ((0, debug_1.debug)())
        console.log("pngToFields: ", {
            width: png.bitmap.width,
            height: png.bitmap.height,
            length: png.bitmap.data.length,
        });
    const fields = [];
    fields.push((0, o1js_1.Field)(png.bitmap.width));
    fields.push((0, o1js_1.Field)(png.bitmap.height));
    fields.push((0, o1js_1.Field)(png.bitmap.data.length));
    for (let i = 0; i < png.bitmap.data.length; i += 4) {
        const value = BigInt(png.bitmap.data[i]) +
            (BigInt(png.bitmap.data[i + 1]) << BigInt(8)) +
            (BigInt(png.bitmap.data[i + 2]) << BigInt(16)) +
            (BigInt(png.bitmap.data[i + 3]) << BigInt(24));
        fields.push((0, o1js_1.Field)(value));
    }
    return fields;
}
exports.pngFoFields = pngFoFields;
