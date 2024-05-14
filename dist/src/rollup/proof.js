"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyVerifierProof = exports.KeyVerifier = exports.KeyVerification = exports.RollupVerifierProof = exports.RollupVerifier = exports.RollupVerification = void 0;
const o1js_1 = require("o1js");
const contract_1 = require("./contract");
const minanft_1 = require("minanft");
class RollupVerification extends (0, o1js_1.Struct)({
    nft: contract_1.RollupNftName,
    root: o1js_1.Field,
}) {
}
exports.RollupVerification = RollupVerification;
exports.RollupVerifier = (0, o1js_1.ZkProgram)({
    name: "RollupVerifier",
    publicInput: RollupVerification,
    methods: {
        verify: {
            privateInputs: [o1js_1.MerkleMapWitness],
            async method(verification, witness) {
                const key = verification.nft.name;
                const value = verification.nft.data.hash();
                const [calculatedRoot, calculatedKey] = witness.computeRootAndKey(value);
                calculatedRoot.assertEquals(verification.root);
                calculatedKey.assertEquals(key);
            },
        },
    },
});
class RollupVerifierProof extends o1js_1.ZkProgram.Proof(exports.RollupVerifier) {
}
exports.RollupVerifierProof = RollupVerifierProof;
class KeyVerification extends (0, o1js_1.Struct)({
    nft: contract_1.RollupNftName,
    key: o1js_1.Field,
    kind: o1js_1.Field,
    data: o1js_1.Field,
}) {
}
exports.KeyVerification = KeyVerification;
exports.KeyVerifier = (0, o1js_1.ZkProgram)({
    name: "KeyVerifier",
    publicInput: KeyVerification,
    methods: {
        verify: {
            privateInputs: [minanft_1.MetadataWitness],
            async method(verification, witness) {
                const key = verification.key;
                const kind = verification.kind;
                const data = verification.data;
                const [calculatedKindRoot, calculatedKindKey] = witness.kind.computeRootAndKey(kind);
                calculatedKindRoot.assertEquals(verification.nft.data.metadata.kind);
                calculatedKindKey.assertEquals(key);
                const [calculatedDataRoot, calculatedDataKey] = witness.data.computeRootAndKey(data);
                calculatedDataRoot.assertEquals(verification.nft.data.metadata.data);
                calculatedDataKey.assertEquals(key);
            },
        },
    },
});
class KeyVerifierProof extends o1js_1.ZkProgram.Proof(exports.KeyVerifier) {
}
exports.KeyVerifierProof = KeyVerifierProof;
