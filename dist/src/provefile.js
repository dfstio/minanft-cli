"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFile = exports.proveFile = void 0;
const debug_1 = require("./debug");
const files_1 = require("./files");
const offline_1 = require("./offline");
const minanft_1 = require("minanft");
const o1js_1 = require("o1js");
const mina_1 = require("./mina");
async function proveFile(name, file) {
    if ((0, debug_1.debug)())
        console.log("Proving NFT file:\n", { name, file });
    const uri = await (0, files_1.load)({ filename: name, type: "nft" });
    if ((0, debug_1.debug)())
        console.log("NFT metadata:\n", { uri });
    if (uri === undefined)
        throw new Error(`NFT ${name} not found`);
    const fileJSON = getFile(uri, file);
    if ((0, debug_1.debug)())
        console.log(`fileJSON`, fileJSON);
    if (fileJSON === undefined)
        throw new Error(`File ${file} not found in NFT ${name}`);
    const fileData = minanft_1.FileData.fromJSON(fileJSON.value);
    if ((0, debug_1.debug)())
        console.log(`fileData`, fileData);
    const fileProof = await fileData.proof();
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
        (0, mina_1.init)();
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
    redactedNFT.copyMetadata(file);
    const proof = await redactedNFT.proof();
    if ((0, debug_1.debug)())
        console.log(`proof:`, proof);
    const files = [
        {
            key: fileJSON.key,
            value: fileJSON.value,
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
        filename: name + "." + file,
        type: "proof",
        data: proofJson,
        allowRewrite: true,
    });
    console.log(`NFT ${name} file has been proven and written to ${filename}`);
}
exports.proveFile = proveFile;
function getFile(
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
            if (kind === "file" || kind === "image") {
                result = { key, value };
            }
            else
                throw new Error(`uri: NFT metadata: kind ${kind} not supported for ${key} : ${value}`);
        }
    });
    return result;
}
exports.getFile = getFile;
