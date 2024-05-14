"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBinaryTreeFromFields = exports.loadBinaryTree = exports.generateRedactedBinaryProof = exports.generateRedactedTextProof = exports.verifyRedactedTextProofJSON = exports.verifyRedactedPNGProofJSON = exports.verifyRedactedProof = exports.getRedactedText = exports.redactedProof = void 0;
const debug_1 = require("./debug");
const files_1 = require("./files");
const minanft_1 = require("minanft");
const redact_1 = require("./redact");
const o1js_1 = require("o1js");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const png_1 = require("./png");
const BINARY_ZERO = 0;
async function redactedProof(originalFilename, maskFilename, redactedFilename, type) {
    if ((0, debug_1.debug)())
        console.log("Creating redacted proof:\n", {
            originalFilename,
            maskFilename,
            redactedFilename,
            type,
        });
    const name = path_1.default.basename(originalFilename);
    if (type === "text") {
        const originalText = await promises_1.default.readFile(originalFilename, "utf8");
        if (originalText === undefined)
            throw new Error(`Original file ${originalFilename} not found`);
        const redactedText = await getRedactedText(originalText, maskFilename, redactedFilename);
        const proof = await generateRedactedTextProof(originalText, redactedText);
        await (0, files_1.write)({
            data: { filename: name, ...proof },
            filename: name + ".redacted",
            type: "proof",
            allowRewrite: true,
        });
    }
    else if (type === "png") {
        if (maskFilename !== undefined)
            throw new Error(`Mask file is not supported for png files`);
        if (redactedFilename === undefined)
            throw new Error(`Redacted file must be provided for png files`);
        const originalFields = await (0, png_1.pngFoFields)(originalFilename);
        const redactedFields = await (0, png_1.pngFoFields)(redactedFilename);
        if (originalFields.length !== redactedFields.length)
            throw new Error(`Original and redacted files have different length`);
        const original = loadBinaryTreeFromFields(originalFields);
        const redacted = loadBinaryTreeFromFields(redactedFields, true);
        if (original.height !== redacted.height)
            throw new Error(`Original and redacted trees have different heights`);
        if (original.leavesNumber !== redacted.leavesNumber)
            throw new Error(`Original and redacted trees have different number of leaves`);
        const proof = await generateRedactedBinaryProof(original, redacted);
        if ((0, debug_1.debug)())
            console.log(`png proof`, proof);
        const filename = await (0, files_1.write)({
            data: { filename: name, ...proof },
            filename: name + ".redacted",
            type: "proof",
            allowRewrite: true,
        });
        console.log(`Redacted proof for ${name} has been written to ${filename}`);
    }
    else
        throw new Error(`Unknown redacted file type ${type}`);
}
exports.redactedProof = redactedProof;
async function getRedactedText(originalText, maskFilename, redactedFilename) {
    let redactedText = "";
    if (redactedFilename !== undefined) {
        redactedText = await promises_1.default.readFile(redactedFilename, "utf8");
        if (redactedText === undefined)
            throw new Error(`Redacted file ${redactedFilename} not found`);
    }
    else if (maskFilename !== undefined) {
        redactedText = await (0, redact_1.redactText)(originalText, maskFilename);
    }
    else
        throw new Error(`Either mask or redacted file must be provided`);
    if (originalText.length !== redactedText.length)
        throw new Error(`Original and redacted files have different length`);
    return redactedText;
}
exports.getRedactedText = getRedactedText;
async function verifyRedactedProof(name, png) {
    if ((0, debug_1.debug)())
        console.log("Verifying redacted proof:\n", { name });
    const data = await promises_1.default.readFile(name, "utf8");
    if (data === undefined)
        throw new Error(`Proof ${name} not found`);
    const proof = JSON.parse(data)?.data;
    if (proof === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (png === undefined) {
        const ok = await verifyRedactedTextProofJSON(proof, name);
        if (ok)
            console.log(`Proof ${name} is valid`);
    }
    else {
        const ok = await verifyRedactedPNGProofJSON(proof, name, png);
        if (ok)
            console.log(`Proof ${name} is valid`);
    }
}
exports.verifyRedactedProof = verifyRedactedProof;
async function verifyRedactedPNGProofJSON(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
proof, name, png) {
    /*
      "length": 30,
      "height": 6,
      "count": 15,
      "originalRoot": "19111215407736447392962954633966993967454133223071387177311565127363332333909",
      "redactedRoot": "1515893462417911403681054509924994231732480396944012764047484206115367514910",
      "proof": {
    */
    if (proof.length === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.height === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.count === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.originalRoot === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.redactedRoot === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.proof === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.proof.publicInput === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.originalRoot !== proof.proof.publicInput[0] &&
        proof.redactedRoot !== proof.proof.publicInput[1] &&
        proof.count !== proof.proof.publicInput[3]) {
        console.error(`Proof ${name} is NOT valid`);
        return false;
    }
    const redactedFields = await (0, png_1.pngFoFields)(png);
    const redacted = loadBinaryTreeFromFields(redactedFields, true);
    if (proof.height !== redacted.height)
        throw new Error(`Original and redacted trees have different heights`);
    if (proof.length !== redacted.leavesNumber)
        throw new Error(`Proof and redacted files have different length`);
    if (redacted.root.toJSON() !== proof.proof.publicInput[1]) {
        if ((0, debug_1.debug)())
            console.log(`redacted.root`, redacted.root.toJSON());
        console.error(`Proof ${name} is NOT valid`);
        return false;
    }
    if (redacted.count !== proof.count ||
        redacted.hash.toJSON() !== proof.proof.publicInput[2]) {
        if ((0, debug_1.debug)())
            console.log(`redacted.count`, redacted.count, `redacted.hash`, redacted.hash.toJSON());
        console.error(`Proof ${name} is NOT valid`);
        return false;
    }
    const contracts = (0, minanft_1.MinaNFTTreeVerifierFunction)(Number(proof.height));
    console.time(`compiled RedactedTreeCalculation`);
    const verificationKey = (await contracts.RedactedMinaNFTTreeCalculation.compile()).verificationKey;
    console.timeEnd(`compiled RedactedTreeCalculation`);
    const ok = await (0, o1js_1.verify)(proof.proof, verificationKey);
    if ((0, debug_1.debug)())
        console.log(`proof verification result:`, ok);
    if (!ok) {
        console.error(`Proof ${name} is NOT valid`);
        return false;
    }
    return true;
}
exports.verifyRedactedPNGProofJSON = verifyRedactedPNGProofJSON;
async function verifyRedactedTextProofJSON(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
proof, name) {
    if (proof.length === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.height === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.count === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.originalRoot === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.redactedRoot === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.proof === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.redactedText === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.proof.publicInput === undefined)
        throw new Error(`Proof ${name} has wrong format`);
    if (proof.redactedText.length.toString() !== proof.length &&
        proof.originalRoot !== proof.proof.publicInput[0] &&
        proof.redactedRoot !== proof.proof.publicInput[1] &&
        proof.count !== proof.proof.publicInput[3]) {
        console.error(`Proof ${name} is NOT valid`);
        return false;
    }
    const redacted = await loadTextTree(proof.redactedText, true);
    if (redacted.root.toJSON() !== proof.proof.publicInput[1]) {
        if ((0, debug_1.debug)())
            console.log(`redacted.root`, redacted.root.toJSON());
        console.error(`Proof ${name} is NOT valid`);
        return false;
    }
    if (redacted.count !== proof.count ||
        redacted.hash.toJSON() !== proof.proof.publicInput[2]) {
        if ((0, debug_1.debug)())
            console.log(`redacted.count`, redacted.count, `redacted.hash`, redacted.hash.toJSON());
        console.error(`Proof ${name} is NOT valid`);
        return false;
    }
    const contracts = (0, minanft_1.MinaNFTTreeVerifierFunction)(Number(proof.height));
    console.time(`compiled RedactedTreeCalculation`);
    const verificationKey = (await contracts.RedactedMinaNFTTreeCalculation.compile()).verificationKey;
    console.timeEnd(`compiled RedactedTreeCalculation`);
    const ok = await (0, o1js_1.verify)(proof.proof, verificationKey);
    if ((0, debug_1.debug)())
        console.log(`proof verification result:`, ok);
    if (!ok) {
        console.error(`Proof ${name} is NOT valid`);
        return false;
    }
    return true;
}
exports.verifyRedactedTextProofJSON = verifyRedactedTextProofJSON;
async function generateRedactedTextProof(originalText, redactedText) {
    if ((0, debug_1.debug)())
        console.log("Creating redacted proof:\n", {
            originalText,
            redactedText,
        });
    if (originalText.length !== redactedText.length)
        throw new Error(`Original and redacted texts have different length`);
    if (originalText.length === 0)
        throw new Error(`Original text is empty`);
    const original = await loadTextTree(originalText);
    const length = original.leavesNumber;
    if (length !== originalText.length + 2)
        throw new Error(`Original text length is different from original tree length`);
    const redactedTree = new minanft_1.RedactedTree(original.height, original.tree);
    const spaceStr = " ";
    const space = o1js_1.Field.from(spaceStr.charCodeAt(0));
    if ((0, debug_1.debug)())
        console.log(`space`, space.toJSON());
    let count = 2;
    redactedTree.set(0, original.fields[0]);
    redactedTree.set(1, original.fields[1]);
    for (let i = 2; i < length; i++) {
        if (originalText[i - 2] === redactedText[i - 2] &&
            redactedText[i - 2] !== spaceStr) {
            redactedTree.set(i, original.fields[i]);
            count++;
        }
        else if (redactedText[i - 2] !== spaceStr)
            throw new Error(`Redacted text is not equal to space at index ${i}`);
    }
    const proof = await redactedTree.proof((0, debug_1.debug)());
    const proofJSON = proof.toJSON();
    if ((0, debug_1.debug)())
        console.log(`proof`, proofJSON);
    return {
        length: originalText.length,
        height: original.height,
        count,
        redactedText,
        originalRoot: original.root.toJSON(),
        redactedRoot: redactedTree.redactedTree.getRoot().toJSON(),
        proof: proofJSON,
    };
}
exports.generateRedactedTextProof = generateRedactedTextProof;
async function generateRedactedBinaryProof(original, redacted) {
    if ((0, debug_1.debug)())
        console.log("Creating redacted binary proof:\n");
    if (original.leavesNumber !== redacted.leavesNumber)
        throw new Error(`Original and redacted files have different length`);
    if (original.leavesNumber <= 2)
        throw new Error(`Original file is empty`);
    const redactedTree = new minanft_1.RedactedTree(original.height, original.tree);
    const zero = o1js_1.Field.from(BINARY_ZERO);
    if ((0, debug_1.debug)())
        console.log(`zero`, zero.toJSON());
    let count = 2;
    redactedTree.set(0, original.fields[0]);
    redactedTree.set(1, original.fields[1]);
    for (let i = 2; i < original.leavesNumber; i++) {
        if (original.fields[i].equals(redacted.fields[i]).toBoolean() === true &&
            redacted.fields[i].equals(zero).toBoolean() === false) {
            redactedTree.set(i, original.fields[i]);
            count++;
        }
        else if (redacted.fields[i].equals(zero).toBoolean() === false)
            throw new Error(`Redacted field ${redacted.fields[i].toJSON()} is not equal to zero at index ${i}`);
    }
    const proof = await redactedTree.proof((0, debug_1.debug)());
    const proofJSON = proof.toJSON();
    if ((0, debug_1.debug)())
        console.log(`proof`, proofJSON);
    return {
        length: original.leavesNumber,
        height: original.height,
        count,
        originalRoot: original.root.toJSON(),
        redactedRoot: redactedTree.redactedTree.getRoot().toJSON(),
        proof: proofJSON,
    };
}
exports.generateRedactedBinaryProof = generateRedactedBinaryProof;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function loadBinaryTree(filename, skipZeros = false) {
    const fields = [];
    let remainder = new Uint8Array(0);
    const file = await promises_1.default.open(filename);
    const stream = file.createReadStream();
    function fillFields(bytes) {
        let currentBigInt = BigInt(0);
        let bitPosition = BigInt(0);
        for (const byte of bytes) {
            currentBigInt += BigInt(byte) << bitPosition;
            bitPosition += BigInt(8);
            if (bitPosition === BigInt(248)) {
                fields.push((0, o1js_1.Field)(currentBigInt.toString()));
                currentBigInt = BigInt(0);
                bitPosition = BigInt(0);
            }
        }
        if (Number(bitPosition) > 0)
            fields.push((0, o1js_1.Field)(currentBigInt.toString()));
    }
    for await (const chunk of stream) {
        if ((0, debug_1.debug)())
            console.log(`chunk`, chunk);
        const bytes = new Uint8Array(remainder.length + chunk.length);
        if (remainder.length > 0)
            bytes.set(remainder);
        bytes.set(chunk, remainder.length);
        const fieldsNumber = Math.floor(bytes.length / 31);
        const chunkSize = fieldsNumber * 31;
        fillFields(bytes.slice(0, chunkSize));
        remainder = bytes.slice(chunkSize);
    }
    if ((0, debug_1.debug)())
        console.log(`remainder`, remainder.length);
    if (remainder.length > 0)
        fillFields(remainder);
    if ((0, debug_1.debug)())
        console.log(`fields length`, fields.length);
    const height = Math.ceil(Math.log2(fields.length + 2)) + 1;
    const tree = new o1js_1.MerkleTree(height);
    if (fields.length > tree.leafCount)
        throw new Error(`File is too big for this Merkle tree`);
    // First field is the height, second number is the number of fields
    const fields2 = [
        o1js_1.Field.from(height),
        o1js_1.Field.from(fields.length),
        ...fields,
    ];
    tree.fill(fields2);
    const root = tree.getRoot();
    const leavesNumber = fields2.length;
    stream.close();
    let count = 2;
    let hash = o1js_1.Poseidon.hash([(0, o1js_1.Field)(0), o1js_1.Field.from(height)]).add(o1js_1.Poseidon.hash([(0, o1js_1.Field)(1), o1js_1.Field.from(fields.length)]));
    const zero = o1js_1.Field.from(BINARY_ZERO).toJSON();
    for (let i = 0; i < fields.length; i++) {
        if (skipZeros === false || fields[i].toJSON() !== zero) {
            count++;
            hash = hash.add(o1js_1.Poseidon.hash([(0, o1js_1.Field)(i + 2), fields[i]]));
        }
    }
    if ((0, debug_1.debug)())
        console.log(`Loaded binary tree from ${filename}:\n`, {
            root: root.toJSON(),
            height,
            leavesNumber,
        });
    return {
        root,
        height,
        leavesNumber,
        tree,
        fields: fields2,
        count,
        hash,
    };
}
exports.loadBinaryTree = loadBinaryTree;
function loadBinaryTreeFromFields(fields, skipZeros = false) {
    if ((0, debug_1.debug)())
        console.log(`fields length`, fields.length);
    const height = Math.ceil(Math.log2(fields.length + 2)) + 1;
    const tree = new o1js_1.MerkleTree(height);
    if (fields.length > tree.leafCount)
        throw new Error(`File is too big for this Merkle tree`);
    // First field is the height, second number is the number of fields
    const fields2 = [
        o1js_1.Field.from(height),
        o1js_1.Field.from(fields.length),
        ...fields,
    ];
    tree.fill(fields2);
    const root = tree.getRoot();
    const leavesNumber = fields2.length;
    let count = 2;
    let hash = o1js_1.Poseidon.hash([(0, o1js_1.Field)(0), o1js_1.Field.from(height)]).add(o1js_1.Poseidon.hash([(0, o1js_1.Field)(1), o1js_1.Field.from(fields.length)]));
    const zero = o1js_1.Field.from(BINARY_ZERO).toJSON();
    for (let i = 0; i < fields.length; i++) {
        if (skipZeros === false || fields[i].toJSON() !== zero) {
            count++;
            hash = hash.add(o1js_1.Poseidon.hash([(0, o1js_1.Field)(i + 2), fields[i]]));
        }
    }
    if ((0, debug_1.debug)())
        console.log(`Loaded binary tree:\n`, {
            root: root.toJSON(),
            height,
            leavesNumber,
        });
    return {
        root,
        height,
        leavesNumber,
        tree,
        fields: fields2,
        count,
        hash,
    };
}
exports.loadBinaryTreeFromFields = loadBinaryTreeFromFields;
async function loadTextTree(text, skipSpaces = false) {
    const size = text.length;
    const height = Math.ceil(Math.log2(size + 2)) + 1;
    const tree = new o1js_1.MerkleTree(height);
    if (size + 2 > tree.leafCount)
        throw new Error(`Text is too big for this Merkle tree`);
    const fields = [];
    tree.setLeaf(BigInt(0), o1js_1.Field.from(height));
    tree.setLeaf(BigInt(1), o1js_1.Field.from(size));
    fields.push(o1js_1.Field.from(height));
    fields.push(o1js_1.Field.from(size));
    let count = 2;
    let hash = o1js_1.Poseidon.hash([(0, o1js_1.Field)(0), o1js_1.Field.from(height)]).add(o1js_1.Poseidon.hash([(0, o1js_1.Field)(1), o1js_1.Field.from(size)]));
    for (let i = 0; i < size; i++) {
        const field = o1js_1.Field.from(text.charCodeAt(i));
        fields.push(field);
        if (skipSpaces === false || text[i] !== " ") {
            tree.setLeaf(BigInt(i + 2), field);
            count++;
            hash = hash.add(o1js_1.Poseidon.hash([(0, o1js_1.Field)(i + 2), field]));
        }
    }
    const root = tree.getRoot();
    const leavesNumber = fields.length;
    if ((0, debug_1.debug)())
        console.log(`Loaded text tree:\n`, {
            root: root.toJSON(),
            height,
            leavesNumber,
            text,
            count,
            hash: hash.toJSON(),
        });
    return {
        root,
        height,
        leavesNumber,
        tree,
        fields,
        count,
        hash,
    };
}
