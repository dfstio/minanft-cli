"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readWord = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const xml_js_1 = require("xml-js");
const debug_1 = require("./debug");
const adm_zip_1 = __importDefault(require("adm-zip"));
async function readWord(file) {
    const word = await promises_1.default.readFile(file);
    const zipFile = new adm_zip_1.default(word);
    const zipEntries = zipFile.getEntries();
    //if (debug()) console.log("zipEntries", zipEntries.length);
    let xml = "";
    for (let i = 0; i < zipEntries.length; i++) {
        if (zipEntries[i].entryName.match("word/document.xml"))
            xml = zipFile.readAsText(zipEntries[i]);
    }
    if (xml === "")
        throw new Error(`Word file ${file} has incorrect format`);
    const json = (0, xml_js_1.xml2json)(xml);
    //if (debug()) console.log("Word file:\n", json);
    const strings = [];
    let text = "";
    function iterateElements(properties) {
        for (const key in properties) {
            //if (debug()) console.log(`key:`, key, properties[key]);
            if (key === "text") {
                strings.push(properties[key]);
                text += properties[key] + "\n";
            }
            switch (key) {
                case "elements":
                    if (typeof properties[key] === "object" &&
                        properties[key].length !== undefined) {
                        for (const element of properties[key]) {
                            iterateElements(element);
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }
    try {
        iterateElements(JSON.parse(json));
    }
    catch (error) {
        console.error(`Error: ${error}`);
    }
    if ((0, debug_1.debug)())
        console.log("Word text:");
    if ((0, debug_1.debug)())
        console.log(text);
    return text;
}
exports.readWord = readWord;
