"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyText = void 0;
const debug_1 = require("./debug");
const files_1 = require("./files");
const offline_1 = require("./offline");
const o1js_1 = require("o1js");
const minanft_1 = require("minanft");
const redactedproof_1 = require("./redactedproof");
async function verifyText(name, key) {
    try {
        if ((0, debug_1.debug)())
            console.log("Verifying NFT text:\n", { name, key });
        const proofJson = await (0, files_1.loadPlain)({
            filename: name + "." + key,
            type: "proof",
        });
        if ((0, debug_1.debug)())
            console.log("proofJson:\n", { proofJson });
        if (proofJson === undefined)
            throw new Error(`Proof ${name} not found`);
        const files = proofJson.texts;
        if (files === undefined)
            throw new Error(`Proof for ${name} not found`);
        if (files.length < 1)
            throw new Error(`Proof for ${name} is empty`);
        const proof = files[0].textProof;
        if (proof === undefined)
            throw new Error(`Proof ${name} is empty`);
        if (proof.originalRoot === undefined)
            throw new Error(`Proof ${name} is not valid`);
        const hash = o1js_1.Poseidon.hash([
            minanft_1.MinaNFT.stringToField(key),
            o1js_1.Field.fromJSON(proof.originalRoot),
            minanft_1.MinaNFT.stringToField("text"),
        ]);
        if (hash.toJSON() !== files[0].proof.publicInput[4])
            throw new Error(`Proof ${name} is not valid`);
        const checkJson = await check(files[0], [
            {
                key,
                kind: "text",
                value: o1js_1.Field.fromJSON(proof.originalRoot),
            },
        ], proofJson.address, proofJson.version);
        if (!checkJson)
            throw new Error(`Proof ${name} is not valid`);
        else
            console.log(`Metadata check for ${name} passed, compiling contracts...`);
        const checkText = await (0, redactedproof_1.verifyRedactedTextProofJSON)(proof, name + "." + key);
        if (!checkText)
            throw new Error(`Proof for ${name} is not valid`);
        const verificationKey = (await minanft_1.RedactedMinaNFTMapCalculation.compile({}))
            .verificationKey;
        const ok = await (0, o1js_1.verify)(files[0].proof, verificationKey);
        if (!ok)
            throw new Error(`Proof ${name} is not valid`);
        console.log(`Proof for the text ${key} of the NFT ${name} is valid`);
    }
    catch (e) {
        console.error(`Proof for ${name} is not valid:`, e);
    }
}
exports.verifyText = verifyText;
async function check(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
json, keys, address, version) {
    if (json.proof === undefined ||
        json.proof.publicInput === undefined ||
        json.proof.publicInput.length !== 6 ||
        keys === undefined ||
        keys.length !== parseInt(json.proof?.publicInput[5])) {
        console.log("JSON proof error", json.proof);
        return false;
    }
    const data = new o1js_1.MerkleMap();
    const kind = new o1js_1.MerkleMap();
    let hash = (0, o1js_1.Field)(0);
    for (let i = 0; i < keys.length; i++) {
        if ((0, debug_1.debug)())
            console.log("item", keys[i]);
        const key = minanft_1.MinaNFT.stringToField(keys[i].key);
        const value = keys[i].value;
        const kindField = minanft_1.MinaNFT.stringToField(keys[i].kind);
        data.set(key, value);
        kind.set(key, kindField);
        /*
          hash: Poseidon.hash([
            element.key,
            element.value.data,
            element.value.kind,
          ]),
          hash: state1.hash.add(state2.hash),
          */
        hash = hash.add(o1js_1.Poseidon.hash([key, value, kindField]));
    }
    if (data.getRoot().toJSON() !== json.proof?.publicInput[2] ||
        kind.getRoot().toJSON() !== json.proof?.publicInput[3] ||
        hash.toJSON() !== json.proof?.publicInput[4]) {
        console.error("redacted metadata check error\n", data.getRoot().toJSON(), "\n", json.proof?.publicInput[2], "\n", kind.getRoot().toJSON(), "\n", json.proof?.publicInput[3]);
        return false;
    }
    if (!(0, offline_1.offline)()) {
        minanft_1.MinaNFT.minaInit("testworld2");
        const nameServiceAddress = o1js_1.PublicKey.fromBase58(minanft_1.MINANFT_NAME_SERVICE);
        const zkNames = new minanft_1.MinaNFTNameServiceContract(nameServiceAddress);
        const zkApp = new minanft_1.MinaNFTContract(o1js_1.PublicKey.fromBase58(address), zkNames.token.id);
        await (0, o1js_1.fetchAccount)({ publicKey: zkApp.address, tokenId: zkNames.token.id });
        const metadata = zkApp.metadata.get();
        const versionApp = zkApp.version.get();
        if (metadata.data.toJSON() !== json.proof?.publicInput[0] ||
            metadata.kind.toJSON() !== json.proof?.publicInput[1] ||
            versionApp.toJSON() !== version.toString()) {
            console.error("metadata check error", metadata.data.toJSON(), json.proof?.publicInput[0], metadata.kind.toJSON(), json.proof?.publicInput[1], versionApp.toJSON(), version.toString());
            return false;
        }
    }
    else
        console.log("Offline mode, skipping on-chain metadata check");
    return true;
}
