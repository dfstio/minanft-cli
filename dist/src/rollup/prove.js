"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeys = exports.proveRollupMap = void 0;
const blocks_1 = require("./blocks");
const config_1 = require("./config");
const debug_1 = require("../debug");
const files_1 = require("../files");
const minanft_1 = require("minanft");
const o1js_1 = require("o1js");
const proof_1 = require("./proof");
const verify_1 = require("./verify");
const o1js_2 = require("o1js");
async function proveRollupMap(params) {
    const { name, keys, nftType, onChain } = params;
    console.log("proving RollupNFT keys", { name, keys });
    if (onChain && keys.length > 1) {
        throw new Error("Only one key can be proven on-chain");
    }
    const nameInfo = await (0, blocks_1.getNameInfo)({ contractAddress: config_1.contractAddress, chain: config_1.chain, name });
    if ((0, debug_1.debug)())
        console.log("name info:", nameInfo);
    if (keys.length === 0)
        throw new Error("No keys to prove");
    const uri = await (0, files_1.load)({ filename: name, type: nftType });
    if ((0, debug_1.debug)())
        console.log("Rollup NFT metadata:\n", { uri });
    if (uri === undefined)
        throw new Error(`Rollup NFT ${name} not found`);
    const keyvalues = getKeys(uri, keys);
    if ((0, debug_1.debug)())
        console.log(`keyvalues:`, keyvalues);
    const block = await (0, blocks_1.getBlock)({ contractAddress: config_1.contractAddress, chain: config_1.chain, blockType: "proved" });
    const map = await (0, blocks_1.getMap)(block.mapIPFS);
    const key = nameInfo.rollupNFT.name;
    const value = nameInfo.rollupNFT.data.hash();
    const witness = map.getWitness(key);
    console.time("RollupVerifier compiled");
    const { verificationKey } = await proof_1.RollupVerifier.compile();
    console.timeEnd("RollupVerifier compiled");
    const rollupVerification = new proof_1.RollupVerification({
        nft: nameInfo.rollupNFT,
        root: block.root,
    });
    const rollupProof = await proof_1.RollupVerifier.verify(rollupVerification, witness);
    const rollupProofJson = rollupProof.toJSON();
    const ok = await (0, o1js_1.verify)(rollupProofJson, verificationKey);
    if (ok)
        console.log("Rollup NFT proof verified");
    else
        throw new Error("Rollup NFT proof verification failed");
    let keyProof = undefined;
    let keysProof = undefined;
    const nft = new minanft_1.RollupNFT();
    nft.loadMetadata(JSON.stringify(uri));
    const json = nft.toJSON({ includePrivateData: true });
    console.log("RollupNFT json:", json);
    if (onChain) {
        const key = o1js_1.Encoding.stringToFields(keys[0])[0];
        const kind = o1js_1.Encoding.stringToFields(uri.properties[keys[0]].kind)[0];
        const data = o1js_1.Encoding.stringToFields(uri.properties[keys[0]].data)[0];
        console.time("KeyVerifier compiled");
        const { verificationKey } = await proof_1.KeyVerifier.compile();
        console.timeEnd("KeyVerifier compiled");
        const { root, map } = nft.getMetadataRootAndMap();
        const witness = map.getWitness(key);
        const proof = await proof_1.KeyVerifier.verify(new proof_1.KeyVerification({
            nft: nameInfo.rollupNFT,
            key,
            kind,
            data,
        }), witness);
        keyProof = proof.toJSON();
        await (0, verify_1.verifyKeyOnChain)({
            verificationData: {
                blockAddress: o1js_2.PublicKey.fromBase58(block.address),
                blockRoot: block.root,
            },
            rollupProof,
            keyProof: proof,
        });
    }
    else {
        const redactedNFT = new minanft_1.RedactedMinaNFT(nft);
        for (const key of keys) {
            if ((0, debug_1.debug)())
                console.log(`key:`, key);
            redactedNFT.copyMetadata(key);
        }
        const proof = await redactedNFT.proof((0, debug_1.debug)());
        if ((0, debug_1.debug)())
            console.log(`proof:`, proof);
        keysProof = proof.toJSON();
    }
    const proofJson = {
        name: uri.name,
        address: uri.address,
        blockAddress: block.address,
        blockNumber: block.blockNumber,
        blockRoot: block.root.toJSON(),
        keys: keyvalues,
        rollupProof: rollupProofJson,
        keysProof,
        keyProof,
    };
    if ((0, debug_1.debug)())
        console.log("proofJSON", proofJson);
    const filename = await (0, files_1.save)({
        filename: name,
        type: "rollup.proof",
        data: proofJson,
        allowRewrite: true,
    });
    console.log(`Rollup NFT ${name} metadata has been proven and written to ${filename}`);
}
exports.proveRollupMap = proveRollupMap;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKeys(uri, keys) {
    const result = [];
    Object.entries(uri.properties).forEach(([key, value]) => {
        if (typeof key !== "string")
            throw new Error("uri: NFT metadata key mismatch - should be string");
        if (typeof value !== "object")
            throw new Error("uri: NFT metadata value mismatch - should be object");
        // check if key is in the list
        if (keys.includes(key)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const obj = value;
            const data = obj.data;
            const kind = obj.kind;
            if (data === undefined)
                throw new Error(`uri: NFT metadata: data should present: ${key} : ${value} kind: ${kind} data: ${data}`);
            if (kind === undefined || typeof kind !== "string")
                throw new Error(`uri: NFT metadata: kind mismatch - should be string: ${key} : ${value}`);
            if (kind === "string") {
                result.push({ key, value: data });
            }
            else
                throw new Error(`uri: NFT metadata: kind ${kind} not supported for ${key} : ${value}`);
        }
    });
    return result;
}
exports.getKeys = getKeys;
