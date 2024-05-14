"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regexp = void 0;
const files_1 = require("./files");
const debug_1 = require("./debug");
const path_1 = __importDefault(require("path"));
async function regexp(name, mask) {
    if ((0, debug_1.debug)())
        console.log("Redacting file", { name, mask });
    const redactedFilename = "./data/redacted_" + path_1.default.basename(name);
    let data = await (0, files_1.loadText)(name);
    if (data === undefined)
        throw new Error(`File ${name} not found`);
    if ((0, debug_1.debug)())
        console.log("Original text:", data);
    if ((0, debug_1.debug)())
        console.log(data);
    if ((0, debug_1.debug)())
        console.log("Mask:");
    if ((0, debug_1.debug)())
        console.log(mask);
    const length = data.length;
    data = data.replace(new RegExp(mask, "g"), " ");
    if ((0, debug_1.debug)())
        console.log("Redacted text:");
    if ((0, debug_1.debug)())
        console.log(data);
    if (data.length !== length)
        throw new Error(`Redacted text length is different from original text length`);
    await (0, files_1.saveText)({ data, filename: redactedFilename });
}
exports.regexp = regexp;
