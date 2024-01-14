#! /usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const commander_1 = require("commander");
const account_1 = require("./account");
const nft_1 = require("./nft");
const files_1 = require("./files");
const jwt_1 = require("./jwt");
const provemap_1 = require("./provemap");
const provefile_1 = require("./provefile");
const provetextfile_1 = require("./provetextfile");
const provepngfile_1 = require("./provepngfile");
const verifymap_1 = require("./verifymap");
const verifyfile_1 = require("./verifyfile");
const verifytext_1 = require("./verifytext");
const verifypng_1 = require("./verifypng");
const mask_1 = require("./mask");
const redact_1 = require("./redact");
const redactedproof_1 = require("./redactedproof");
const regexp_1 = require("./regexp");
const debug_1 = require("./debug");
const word_1 = require("./word");
exports.program = new commander_1.Command();
exports.program
    .name("minanft")
    .description("Mina NFT CLI tool")
    .version("1.0.5")
    .option("-p, --password <string>", "password")
    .option("-o, --offline", "offline mode")
    .option("-d, --debug", "debug mode");
exports.program
    .command("createaccount")
    .description("Create new MINA protocol account or import existing one")
    .argument("<name>", "Name of the account")
    .option("--private <string>", "private key")
    .option("--public <string>", "public key")
    .action(async (name, options) => {
    console.log(`Creating account ${name}...`);
    await (0, account_1.createAccount)({
        name,
        privateKey: options.private,
        publicKey: options.public,
    });
});
exports.program
    .command("exportaccount")
    .description("Export existing MINA protocol account")
    .argument("<name>", "Name of the account")
    .action(async (name) => {
    console.log(`Exporting account ${name}...`);
    await (0, account_1.exportAccount)(name);
});
exports.program
    .command("balance")
    .description("Check the balance of the existing MINA protocol account")
    .argument("<name>", "Name of the account")
    .action(async (name) => {
    console.log(`Checking the balance of the ${name}...`);
    await (0, account_1.balance)(name);
});
exports.program
    .command("reserve")
    .description("Reserve NFT name")
    .argument("<name>", "Name of the NFT")
    .argument("[account]", "NFT account, should have private key")
    .action(async (name, account) => {
    console.log(`Reserving NFT name ${name}...`);
    await (0, nft_1.reserve)(name, account);
});
exports.program
    .command("create")
    .description("Create NFT")
    .argument("<name>", "Reserved name of the NFT")
    .argument("[owner]", "Owner account, should have private key")
    .option("--arweave", "Use Arweave for storage")
    .option("--creator <string>", "Creator name")
    .action(async (name, owner, options) => {
    console.log(`Creating NFT ${name}...`);
    await (0, nft_1.createNFT)(name, owner, options.arweave ?? false, options.creator);
});
exports.program
    .command("index")
    .description("Index NFT name for minanft.io frontend")
    .argument("<name>", "Name of the NFT")
    .action(async (name) => {
    console.log(`Indexing NFT name ${name}...`);
    await (0, nft_1.indexName)(name);
});
exports.program
    .command("prove")
    .description("Prove NFT metadata")
    .argument("<name>", "Name of the NFT")
    .requiredOption("-k, --keys <strings...>", "Keys to prove")
    .action(async (name, options) => {
    console.log(`Proving keys for NFT ${name}...`);
    await (0, provemap_1.proveMap)(name, options.keys);
});
exports.program
    .command("provefile")
    .description("Prove NFT file")
    .argument("<name>", "Name of the NFT")
    .argument("<key>", "Key of the file to prove")
    .option("--api", "Use MinaNFT API to calculate proofs")
    .action(async (name, key, options) => {
    console.log(`Proving file ${key} for NFT ${name}...`);
    if (options.api)
        console.error("API mode is not included in the public release due to potential high AWS costs. Please contact support@minanft.io to enable it.");
    else
        await (0, provefile_1.proveFile)(name, key);
});
exports.program
    .command("provetext")
    .description("Prove NFT text")
    .argument("<name>", "Name of the NFT")
    .argument("<key>", "Key of the file to prove")
    .option("--api", "Use MinaNFT API to calculate proofs")
    .option("--mask <string>", "Use mask to calculate redacted text file proofs")
    .option("--redacted <string>", "Use redacted file instead of mask")
    .action(async (name, key, options) => {
    console.log(`Proving text ${key} for NFT ${name}...`);
    if (options.redacted !== undefined && options.mask !== undefined) {
        console.error(`Please specify --mask or --redacted`);
        return;
    }
    if (options.redacted === undefined && options.mask === undefined) {
        console.error(`Please specify --mask or --redacted`);
        return;
    }
    if (options.api)
        console.error("API mode is not included in the public release due to potential high AWS costs. Please contact support@minanft.io to enable it.");
    else
        await (0, provetextfile_1.proveTextFile)(name, key, options.mask, options.redacted);
});
exports.program
    .command("provepng")
    .description("Prove NFT png image")
    .argument("<name>", "Name of the NFT")
    .argument("<key>", "Key of the png file to prove")
    .argument("<original>", "Original png file")
    .argument("<redacted", "Redacted png file")
    .option("--api", "Use MinaNFT API to calculate proofs")
    .action(async (name, key, original, redacted, options) => {
    console.log(`Proving PNG file ${key} for NFT ${name}...`);
    if (options.api)
        console.error("API mode is not included in the public release due to potential high AWS costs. Please contact support@minanft.io to enable it.");
    else
        await (0, provepngfile_1.provePNGFile)(name, key, original, redacted);
});
exports.program
    .command("verify")
    .description("Verify NFT metadata")
    .argument("<name>", "Name of the NFT")
    .action(async (name) => {
    console.log(`Verifying proof for NFT ${name}...`);
    await (0, verifymap_1.verifyMap)(name);
});
exports.program
    .command("verifyfile")
    .description("Verify NFT file")
    .argument("<name>", "Name of the NFT")
    .argument("<key>", "Key of the file to verify")
    .argument("<file>", "File to verify")
    .option("--noroot", "Skip calculating Merkle Tree root of the file")
    .action(async (name, key, file, options) => {
    console.log(`Verifying file ${key} for NFT ${name}...`);
    await (0, verifyfile_1.verifyFile)(name, key, file, options.noroot ?? false);
});
exports.program
    .command("verifytext")
    .description("Verify NFT redacted text file")
    .argument("<name>", "Name of the NFT")
    .argument("<key>", "Key of the text to verify")
    .action(async (name, key) => {
    console.log(`Verifying text ${key} for NFT ${name}...`);
    await (0, verifytext_1.verifyText)(name, key);
});
exports.program
    .command("verifypng")
    .description("Verify NFT redacted png file")
    .argument("<name>", "Name of the NFT")
    .argument("<key>", "Key of the png to verify")
    .argument("<png>", "Redacted png file")
    .action(async (name, key, png) => {
    console.log(`Verifying png ${key} for NFT ${name}...`);
    await (0, verifypng_1.verifyPNG)(name, key, png);
});
exports.program
    .command("mask")
    .description("Create or update file mask")
    .argument("<name>", "Name of the mask")
    .argument("<start", "Number - start of the mask")
    .argument("<end>", "Number - end of the mask")
    .action(async (name, start, end) => {
    console.log(`Creating or updating mask ${name}...`);
    await (0, mask_1.mask)(name, start, end);
});
exports.program
    .command("redact")
    .description("Create redacted file using mask")
    .argument("<name>", "Name of the file")
    .argument("<mask>", "Name of the mask")
    .option("--png", "file is png")
    .option("--text", "file is text")
    .action(async (name, mask, options) => {
    if (options.png === undefined && options.text === undefined) {
        console.error(`Please specify --png or --text`);
        return;
    }
    if (options.png !== undefined && options.text !== undefined) {
        console.error(`Please specify --png or --text`);
        return;
    }
    console.log(`Creating redacted file using mask...`);
    await (0, redact_1.redact)(name, mask, options.text === true ? "text" : "png");
});
exports.program
    .command("regexp")
    .description("Create redacted file using regular expression")
    .argument("<name>", "Name of the file")
    .argument("<mask>", "Regular expression")
    .action(async (name, mask) => {
    console.log(`Creating redacted file using regular expression...`);
    // minanft regexp ./example/tesla.txt "\d" -d
    await (0, regexp_1.regexp)(name, mask);
});
exports.program
    .command("redactedproof")
    .description("Create redacted file proof")
    .argument("<name>", "Name of the original file")
    .option("--png", "file is png image")
    .option("--text", "file is text")
    .option("--mask <string>", "Mask name, optional if redacted file is used")
    .option("--redacted <string>", "Use redacted file instead of mask")
    .action(async (name, options) => {
    if ((0, debug_1.debug)())
        console.log("redactedproof", { name, options });
    if (options.redacted !== undefined && options.mask !== undefined) {
        console.error(`Please specify --mask or --redacted`);
        return;
    }
    if (options.redacted === undefined && options.mask === undefined) {
        console.error(`Please specify --mask or --redacted`);
        return;
    }
    if (options.png === undefined && options.text === undefined) {
        console.error(`Please specify --png or --text`);
        return;
    }
    if (options.png !== undefined && options.text !== undefined) {
        console.error(`Please specify --png or --text`);
        return;
    }
    console.log(`Creating redacted file proof...`);
    await (0, redactedproof_1.redactedProof)(name, options.mask, options.redacted, options.text === true ? "text" : "png");
});
exports.program
    .command("verifyredactedproof")
    .description("Verify redacted file proof")
    .argument("<name>", "Name of the proof file")
    .option("--png <string>", "Redacted PNG file")
    .action(async (name, options) => {
    if ((0, debug_1.debug)())
        console.log("verifyredactedproof", { name, options });
    await (0, redactedproof_1.verifyRedactedProof)(name, options.png);
});
exports.program
    .command("jwt")
    .description("Set JWT token for the online MinaNFT API")
    .argument("<jwt>", "JWT token. Get it at https://t.me/minanft_bot?start=auth")
    .action(async (jwt) => {
    console.log(`Setting JWT token...`);
    await (0, jwt_1.setJWT)(jwt);
});
exports.program
    .command("exportjwt")
    .description("Export MinaNFT JWT token")
    .action(async () => {
    console.log("Exporting JWT token... ");
    await (0, jwt_1.exportJWT)();
});
exports.program
    .command("word")
    .description("Convert word file to text")
    .argument("<name>", "Name of the word file")
    .action(async (name) => {
    console.log("Converting word file... ");
    const text = await (0, word_1.readWord)(name);
    console.log(text);
});
exports.program
    .command("ipfs")
    .description("Set Pinata JWT token for the IPFS storage")
    .argument("<jwt", "Pinata JWT token. Get it at https://pinata.cloud")
    .action(async (jwt) => {
    console.log(`Setting Pinata JWT token...`);
    await (0, jwt_1.setPinataJWT)(jwt);
});
exports.program
    .command("arweave")
    .description("Set Arweave private key for the Arweave storage")
    .argument("<key", "Arweave private key. Generate it using Arweave using instructions in README.md")
    .action(async (key) => {
    console.log(`Setting Arweave private key...`);
    await (0, jwt_1.setArweaveKey)(key);
});
exports.program
    .command("changepassword")
    .description("Change password for existing file")
    .argument("<name>", "Name")
    .argument("<type>", "Type: account | nft | request | map | answer")
    .argument("<oldPwd>", "Old password")
    .argument("<newPwd>", "New password")
    .action(async (name, type, oldPwd, newPwd) => {
    console.log(`Changing password for ${name}...`);
    await (0, files_1.changePassword)(name, type, oldPwd, newPwd);
});
async function main() {
    console.log("Mina NFT CLI tool (c) DFST 2024 www.minanft.io\n");
    await exports.program.parseAsync();
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
