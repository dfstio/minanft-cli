"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getText = exports.getTextByKey = exports.proveTextFile = void 0;
const debug_1 = require("./debug");
const files_1 = require("./files");
const offline_1 = require("./offline");
const minanft_1 = require("minanft");
const o1js_1 = require("o1js");
const redactedproof_1 = require("./redactedproof");
async function proveTextFile(name, key, mask, redacted) {
    if ((0, debug_1.debug)())
        console.log("Proving NFT text:\n", { name, key, mask, redacted });
    const { originalText, uri, fileJSON } = await getTextByKey(name, key);
    const redactedText = await (0, redactedproof_1.getRedactedText)(originalText, mask, redacted);
    const textProof = await (0, redactedproof_1.generateRedactedTextProof)(originalText, redactedText);
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
    const texts = [
        {
            key: fileJSON.key,
            textProof,
            proof: proof.toJSON(),
        },
    ];
    const proofJson = {
        name: uri.name,
        version: uri.version,
        address: uri.address,
        texts,
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
exports.proveTextFile = proveTextFile;
async function getTextByKey(name, key) {
    const uri = await (0, files_1.load)({ filename: name, type: "nft" });
    if ((0, debug_1.debug)())
        console.log("NFT metadata:\n", { uri });
    if (uri === undefined)
        throw new Error(`NFT ${name} not found`);
    const fileJSON = getText(uri, key);
    if ((0, debug_1.debug)())
        console.log(`fileJSON`, fileJSON);
    if (fileJSON === undefined)
        throw new Error(`File ${key} not found in NFT ${name}`);
    const textData = minanft_1.TextData.fromJSON(fileJSON.value);
    if ((0, debug_1.debug)())
        console.log(`textData`, textData);
    const originalText = textData.text;
    return { originalText, uri, fileJSON };
}
exports.getTextByKey = getTextByKey;
function getText(
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
            if (kind === "text") {
                result = { key, value };
            }
            else
                throw new Error(`uri: NFT metadata: kind ${kind} not supported for ${key} : ${value}`);
        }
    });
    return result;
}
exports.getText = getText;
