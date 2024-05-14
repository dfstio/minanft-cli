"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMap = void 0;
const debug_1 = require("./debug");
const files_1 = require("./files");
const offline_1 = require("./offline");
const o1js_1 = require("o1js");
const minanft_1 = require("minanft");
const mina_1 = require("./mina");
async function verifyMap(name) {
    try {
        if ((0, debug_1.debug)())
            console.log("Verifying NFT metadata:\n", { name });
        const proofJson = await (0, files_1.loadPlain)({ filename: name, type: "proof" });
        if ((0, debug_1.debug)())
            console.log("proofJson:\n", { proofJson });
        if (proofJson === undefined)
            throw new Error(`Proof ${name} not found`);
        const proof = proofJson.proof;
        if (proof === undefined)
            throw new Error(`Proof ${name} not found`);
        const checkJson = await check(proofJson);
        if (!checkJson)
            throw new Error(`Proof ${name} is not valid`);
        else
            console.log(`Metadata check for ${name} passed, compiling contract...`);
        const verificationKey = (await minanft_1.RedactedMinaNFTMapCalculation.compile({}))
            .verificationKey;
        const ok = await (0, o1js_1.verify)(proof, verificationKey);
        if (!ok)
            throw new Error(`Proof ${name} is not valid`);
        console.log(`Proof ${name} is valid`);
    }
    catch (e) {
        console.error(`Proof ${name} is not valid:`, e);
    }
}
exports.verifyMap = verifyMap;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function check(json) {
    if (json.proof === undefined ||
        json.proof.publicInput === undefined ||
        json.proof.publicInput.length !== 6 ||
        json.keys === undefined ||
        json.keys.length !== parseInt(json.proof?.publicInput[5])) {
        console.log("JSON proof error", json.proof);
        return false;
    }
    const data = new o1js_1.MerkleMap();
    const kind = new o1js_1.MerkleMap();
    let hash = (0, o1js_1.Field)(0);
    const str = minanft_1.MinaNFT.stringToField("string");
    for (let i = 0; i < json.keys.length; i++) {
        if ((0, debug_1.debug)())
            console.log("item", json.keys[i]);
        const key = minanft_1.MinaNFT.stringToField(json.keys[i].key);
        const value = minanft_1.MinaNFT.stringToField(json.keys[i].value);
        data.set(key, value);
        kind.set(key, str);
        /*
          hash: Poseidon.hash([
            element.key,
            element.value.data,
            element.value.kind,
          ]),
          hash: state1.hash.add(state2.hash),
          */
        hash = hash.add(o1js_1.Poseidon.hash([key, value, str]));
    }
    if (data.getRoot().toJSON() !== json.proof?.publicInput[2] ||
        kind.getRoot().toJSON() !== json.proof?.publicInput[3] ||
        hash.toJSON() !== json.proof?.publicInput[4]) {
        console.error("redacted metadata check error", data.getRoot().toJSON(), json.proof?.publicInput[2], kind.getRoot().toJSON(), json.proof?.publicInput[3]);
        return false;
    }
    if (!(0, offline_1.offline)()) {
        (0, mina_1.init)();
        const nameServiceAddress = o1js_1.PublicKey.fromBase58(minanft_1.MINANFT_NAME_SERVICE);
        const zkNames = new minanft_1.MinaNFTNameServiceContract(nameServiceAddress);
        const zkApp = new minanft_1.MinaNFTContract(o1js_1.PublicKey.fromBase58(json.address), zkNames.deriveTokenId());
        await (0, o1js_1.fetchAccount)({
            publicKey: zkApp.address,
            tokenId: zkNames.deriveTokenId(),
        });
        const metadata = zkApp.metadata.get();
        const version = zkApp.version.get();
        if (metadata.data.toJSON() !== json.proof?.publicInput[0] ||
            metadata.kind.toJSON() !== json.proof?.publicInput[1] ||
            version.toJSON() !== json.version.toString()) {
            console.error("metadata check error", metadata.data.toJSON(), json.proof?.publicInput[0], metadata.kind.toJSON(), json.proof?.publicInput[1], version.toJSON(), json.version.toString());
            return false;
        }
    }
    else
        console.log("Offline mode, skipping on-chain metadata check");
    return true;
}
