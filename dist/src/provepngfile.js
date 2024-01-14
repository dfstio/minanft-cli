"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPNG = exports.getPNGByKey = exports.provePNGFile = void 0;
const debug_1 = require("./debug");
const files_1 = require("./files");
const offline_1 = require("./offline");
const minanft_1 = require("minanft");
const o1js_1 = require("o1js");
const redactedproof_1 = require("./redactedproof");
const png_1 = require("./png");
async function provePNGFile(name, key, originalFilename, redactedFilename) {
    if ((0, debug_1.debug)())
        console.log("Proving NFT png file:\n", {
            name,
            key,
            originalFilename,
            redactedFilename,
        });
    const { uri, fileJSON } = await getPNGByKey(name, key);
    if (fileJSON === undefined)
        throw new Error(`File ${key} not found in NFT ${name}`);
    const fileData = minanft_1.FileData.fromJSON(fileJSON.value);
    if ((0, debug_1.debug)())
        console.log(`fileData`, fileData);
    const fileProof = await fileData.proof((0, debug_1.debug)());
    if (redactedFilename === undefined)
        throw new Error(`Redacted file must be provided for png files`);
    const originalFields = await (0, png_1.pngFoFields)(originalFilename);
    const redactedFields = await (0, png_1.pngFoFields)(redactedFilename);
    if (originalFields.length !== redactedFields.length)
        throw new Error(`Original and redacted files have different length`);
    const original = (0, redactedproof_1.loadBinaryTreeFromFields)(originalFields);
    const redacted = (0, redactedproof_1.loadBinaryTreeFromFields)(redactedFields, true);
    if (original.height !== redacted.height)
        throw new Error(`Original and redacted trees have different heights`);
    if (original.leavesNumber !== redacted.leavesNumber)
        throw new Error(`Original and redacted trees have different number of leaves`);
    const pngProof = await (0, redactedproof_1.generateRedactedBinaryProof)(original, redacted);
    if ((0, debug_1.debug)())
        console.log(`png proof`, fileProof);
    const nameServiceAddress = o1js_1.PublicKey.fromBase58(minanft_1.MINANFT_NAME_SERVICE);
    let nft;
    if ((0, offline_1.offline)()) {
        nft = minanft_1.MinaNFT.fromJSON({
            metadataURI: JSON.stringify(uri),
            nameServiceAddress,
        });
        const loadedJson = nft.toJSON();
        if ((0, debug_1.debug)())
            console.log(`loadedJson:`, JSON.stringify(loadedJson, null, 2));
    }
    else {
        minanft_1.MinaNFT.minaInit("testworld2");
        nft = new minanft_1.MinaNFT({
            name: uri.name,
            address: o1js_1.PublicKey.fromBase58(uri.address),
            nameService: nameServiceAddress,
        });
        await nft.loadMetadata(JSON.stringify(uri));
        const checkNft = await nft.checkState();
        if (checkNft === false) {
            console.error("NFT checkState error");
            return;
        }
    }
    const redactedNFT = new minanft_1.RedactedMinaNFT(nft);
    redactedNFT.copyMetadata(key);
    const proof = await redactedNFT.proof();
    if ((0, debug_1.debug)())
        console.log(`proof:`, proof);
    const files = [
        {
            key: fileJSON.key,
            value: fileJSON.value,
            pngProof,
            fileProof: fileProof.toJSON(),
            proof: proof.toJSON(),
        },
    ];
    const proofJson = {
        name: uri.name,
        version: uri.version,
        address: uri.address,
        files,
    };
    if ((0, debug_1.debug)())
        console.log("proofJSON", proofJson);
    const filename = await (0, files_1.save)({
        filename: name + "." + key,
        type: "proof",
        data: proofJson,
        allowRewrite: true,
    });
    console.log(`NFT ${name} file has been proven and written to ${filename}`);
}
exports.provePNGFile = provePNGFile;
async function getPNGByKey(name, key) {
    const uri = await (0, files_1.load)({ filename: name, type: "nft" });
    if ((0, debug_1.debug)())
        console.log("NFT metadata:\n", { uri });
    if (uri === undefined)
        throw new Error(`NFT ${name} not found`);
    const fileJSON = getPNG(uri, key);
    if ((0, debug_1.debug)())
        console.log(`fileJSON`, fileJSON);
    if (fileJSON === undefined)
        throw new Error(`File ${key} not found in NFT ${name}`);
    return { uri, fileJSON };
}
exports.getPNGByKey = getPNGByKey;
function getPNG(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
uri, file
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result = undefined;
    Object.entries(uri.properties).forEach(([key, value]) => {
        if (typeof key !== "string")
            throw new Error("uri: NFT metadata key mismatch - should be string");
        if (typeof value !== "object")
            throw new Error("uri: NFT metadata value mismatch - should be object");
        // check if key is in the list
        if (file === key) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const obj = value;
            const data = obj.data;
            const kind = obj.kind;
            const linkedObject = obj.linkedObject;
            if (data === undefined)
                throw new Error(`uri: NFT metadata: data should present: ${key} : ${value} kind: ${kind} data: ${data}`);
            if (kind === undefined || typeof kind !== "string")
                throw new Error(`uri: NFT metadata: kind mismatch - should be string: ${key} : ${value}`);
            if (linkedObject === undefined)
                throw new Error(`uri: NFT metadata: linkedObject should present: ${key} : ${value} kind: ${kind} data: ${data}`);
            if (kind === "file" || kind === "image" || kind === "png") {
                result = { key, value };
            }
            else
                throw new Error(`uri: NFT metadata: kind ${kind} not supported for ${key} : ${value}`);
        }
    });
    return result;
}
exports.getPNG = getPNG;
