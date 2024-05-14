"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFile = exports.verifyFile = void 0;
const debug_1 = require("./debug");
const files_1 = require("./files");
const offline_1 = require("./offline");
const o1js_1 = require("o1js");
const minanft_1 = require("minanft");
const mina_1 = require("./mina");
async function verifyFile(name, key, file, noroot) {
    try {
        if ((0, debug_1.debug)())
            console.log("Verifying NFT file:\n", { name });
        const proofJson = await (0, files_1.loadPlain)({
            filename: name + "." + key,
            type: "proof",
        });
        if ((0, debug_1.debug)())
            console.log("proofJson:\n", { proofJson });
        if (proofJson === undefined)
            throw new Error(`Proof ${name} not found`);
        const files = proofJson.files;
        if (files === undefined)
            throw new Error(`Proof for ${name} not found`);
        if (files.length < 1)
            throw new Error(`Proof for ${name} is empty`);
        /* The code is verifying the validity of a proof for a specific NFT file. */
        const checkFileResult = await checkFile(file, files[0].value, noroot);
        if (!checkFileResult)
            throw new Error(`Proof for ${name} is not valid`);
        const proof = files[0].proof;
        if (proof === undefined)
            throw new Error(`Proof ${name} is empty`);
        const checkJson = await check(files[0], [
            {
                key,
                kind: files[0].value.kind,
                value: o1js_1.Field.fromJSON(files[0].value.data),
            },
        ], proofJson.address, proofJson.version);
        if (!checkJson)
            throw new Error(`Proof ${name} is not valid`);
        else
            console.log(`Metadata check for ${name} passed, compiling contracts...`);
        const contracts = (0, minanft_1.MinaNFTTreeVerifierFunction)(minanft_1.FILE_TREE_HEIGHT);
        const fileVerificationKey = (await contracts.RedactedMinaNFTTreeCalculation.compile()).verificationKey;
        const fileOk = (0, o1js_1.verify)(files[0].fileProof, fileVerificationKey);
        if (!fileOk)
            throw new Error(`Proof ${name} is not valid`);
        const verificationKey = (await minanft_1.RedactedMinaNFTMapCalculation.compile({}))
            .verificationKey;
        const ok = await (0, o1js_1.verify)(proof, verificationKey);
        if (!ok)
            throw new Error(`Proof ${name} is not valid`);
        console.log(`Proof for the file ${key} of the NFT ${name} is valid`);
    }
    catch (e) {
        console.error(`Proof for ${name} is not valid:`, e);
    }
}
exports.verifyFile = verifyFile;
async function checkFile(filename, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
data, noroot) {
    const proofData = minanft_1.FileData.fromJSON(data);
    if ((0, debug_1.debug)())
        console.log("proofData", proofData);
    const file = new minanft_1.File(filename);
    await file.setMetadata();
    await file.sha3_512();
    if (noroot === false && proofData.fileRoot.toJSON() !== (0, o1js_1.Field)(0).toJSON()) {
        console.log("Calculating file Merkle Tree root...");
        console.time("Calculated file Merkle Tree root");
        await file.treeData(true);
        console.timeEnd("Calculated file Merkle Tree root");
    }
    else {
        await file.treeData(false);
    }
    const fileData = await file.data();
    if ((0, debug_1.debug)())
        console.log("fileData", fileData);
    if (noroot === true) {
        fileData.fileRoot = proofData.fileRoot;
        fileData.height = proofData.height;
    }
    fileData.storage = proofData.storage;
    const { fields: fileFields } = fileData.buildTree();
    const { fields: proofFields } = proofData.buildTree();
    if (fileFields.length !== proofFields.length ||
        fileFields.length !== minanft_1.FILE_TREE_ELEMENTS) {
        console.error("File data length mismatch", fileFields.length, proofFields.length);
        return false;
    }
    for (let i = 0; i < fileFields.length; i++) {
        if (fileFields[i].toJSON() !== proofFields[i].toJSON()) {
            console.error("File data mismatch", fileFields[i].toJSON(), proofFields[i].toJSON());
            return false;
        }
    }
    return true;
}
exports.checkFile = checkFile;
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
        (0, mina_1.init)();
        const nameServiceAddress = o1js_1.PublicKey.fromBase58(minanft_1.MINANFT_NAME_SERVICE);
        const zkNames = new minanft_1.MinaNFTNameServiceContract(nameServiceAddress);
        const zkApp = new minanft_1.MinaNFTContract(o1js_1.PublicKey.fromBase58(address), zkNames.deriveTokenId());
        await (0, o1js_1.fetchAccount)({
            publicKey: zkApp.address,
            tokenId: zkNames.deriveTokenId(),
        });
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
