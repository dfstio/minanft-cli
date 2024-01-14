"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommands = exports.programNFT = void 0;
const commander_1 = require("commander");
const readline = __importStar(require("node:readline/promises"));
const debug_1 = require("./debug");
const nft_1 = require("./nft");
const word_1 = require("./word");
const promises_1 = __importDefault(require("fs/promises"));
exports.programNFT = new commander_1.Command();
/*
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function myExitOverride(error: CommanderError) {
  //console.log("exitOverride Error:", error.message);
}
*/
exports.programNFT.name("add").description("Create NFT").version("1.0.3");
exports.programNFT
    .command("key")
    .description("Add key-value pair to NFT")
    .argument("<key>", "Key, maximum 30 characters")
    .argument("<value>", "Value, maximum 30 characters")
    .option("--private", "Make this key private")
    .action(async (key, value, options) => {
    console.log(`Creating key ${key}...`);
    if ((0, debug_1.debug)())
        console.log({ key, value, options });
    (0, nft_1.nft)().update({ key, value, isPrivate: options.private ?? false });
});
exports.programNFT
    .command("image")
    .description("Add image to NFT")
    .argument("<file>", "File name of the image")
    .option("--noroot", "Skip calculating Merkle Tree root of the image")
    .option("--ipfs <string>", "IPFS hash of the file")
    .option("--arweave <string>", "Arweave hash of the file")
    .action(async (file, options) => {
    console.log(`Adding image ${file}...`);
    if ((0, debug_1.debug)())
        console.log({ file, options });
    await (0, nft_1.nft)().updateImage({
        filename: file,
        pinataJWT: nft_1.pinataJWT,
        arweaveKey: nft_1.arweaveKey,
        calculateRoot: options.noroot === true ? false : true,
        IPFSHash: options.ipfs,
        ArweaveHash: options.arweave,
    });
});
exports.programNFT
    .command("file")
    .description("Add file to NFT")
    .argument("<key>", "Key, maximum 30 characters")
    .argument("<file>", "File name")
    .option("--private", "Make this file private")
    .option("--ipfs <string>", "IPFS hash of the file")
    .option("--arweave <string>", "Arweave hash of the file")
    .option("--noroot", "Skip calculating Merkle Tree root of the file")
    .option("--text", "Text file")
    .option("--word", "Text file")
    .option("--png", "PNG file")
    .action(async (key, file, options) => {
    if ((0, debug_1.debug)())
        console.log({ file, options });
    if (options.text === true) {
        console.log(`Adding text file ${file}...`);
        const text = await promises_1.default.readFile(file, "utf8");
        (0, nft_1.nft)().updateText({ key, text, isPrivate: options.private ?? false });
    }
    else if (options.png === true) {
        console.log(`Adding png file ${file}...`);
        await (0, nft_1.nft)().updateFile({
            key,
            filename: file,
            pinataJWT: nft_1.pinataJWT,
            arweaveKey: nft_1.arweaveKey,
            calculateRoot: options.noroot === true ? false : true,
            IPFSHash: options.ipfs,
            ArweaveHash: options.arweave,
            fileType: "png",
        });
    }
    else {
        console.log(`Adding binary file ${file}...`);
        await (0, nft_1.nft)().updateFile({
            key,
            filename: file,
            pinataJWT: nft_1.pinataJWT,
            arweaveKey: nft_1.arweaveKey,
            isPrivate: options.private ?? false,
            calculateRoot: options.noroot === true ? false : true,
            IPFSHash: options.ipfs,
            ArweaveHash: options.arweave,
            fileType: options.word === true ? "word" : "binary",
        });
        if (options.word === true) {
            console.log(`Adding word file text...`);
            const text = await (0, word_1.readWord)(file);
            (0, nft_1.nft)().updateText({
                key: key.substring(0, 25) + ".text",
                text,
                isPrivate: options.private ?? false,
            });
        }
    }
});
exports.programNFT
    .command("text")
    .description("Add text to NFT")
    .argument("<key>", "Key, maximum 30 characters")
    .argument("<text>", "Text to add")
    .option("--private", "Make this text private")
    .action(async (key, text, options) => {
    console.log(`Adding text...`);
    if ((0, debug_1.debug)())
        console.log({ key, text, options });
    (0, nft_1.nft)().updateText({ key, text, isPrivate: options.private ?? false });
});
exports.programNFT
    .command("description")
    .description("Add description to NFT")
    .argument("<text>", "Description text")
    .action(async (text) => {
    console.log(`Adding description: ${text}`);
    (0, nft_1.nft)().updateText({ key: "description", text });
});
async function getCommands() {
    if ((0, debug_1.debug)())
        console.log("Create NFT getCommands\n");
    //await programNFT.parseAsync(["help"]);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    async function waitForUserInput() {
        const command = await rl.question("command > ");
        if (command === "exit" || command === "quit") {
            rl.close();
            console.log("Exiting...");
        }
        else if (command === "mint") {
            rl.close();
            console.log("Minting...");
            await (0, nft_1.mint)();
        }
        else {
            const commandArr = command.split(" ");
            try {
                await exports.programNFT.parseAsync(commandArr, { from: "user" });
            }
            catch (e) {
                console.error("Error:", e);
            }
            if ((0, debug_1.debug)())
                console.log("After parsing...");
            await waitForUserInput();
        }
    }
    await waitForUserInput();
}
exports.getCommands = getCommands;
