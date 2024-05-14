import { ZkProgram, MerkleMapWitness, Struct, Field } from "o1js";
import { RollupNftName } from "./contract";
import { MetadataWitness } from "minanft";

export class RollupVerification extends Struct({
  nft: RollupNftName,
  root: Field,
}) {}

export const RollupVerifier = ZkProgram({
  name: "RollupVerifier",
  publicInput: RollupVerification,

  methods: {
    verify: {
      privateInputs: [MerkleMapWitness],

      async method(
        verification: RollupVerification,
        witness: MerkleMapWitness
      ) {
        const key = verification.nft.name;
        const value = verification.nft.data.hash();
        const [calculatedRoot, calculatedKey] =
          witness.computeRootAndKey(value);
        calculatedRoot.assertEquals(verification.root);
        calculatedKey.assertEquals(key);
      },
    },
  },
});

export class RollupVerifierProof extends ZkProgram.Proof(RollupVerifier) {}

export class KeyVerification extends Struct({
  nft: RollupNftName,
  key: Field,
  kind: Field,
  data: Field,
}) {}

export const KeyVerifier = ZkProgram({
  name: "KeyVerifier",
  publicInput: KeyVerification,

  methods: {
    verify: {
      privateInputs: [MetadataWitness],

      async method(verification: KeyVerification, witness: MetadataWitness) {
        const key = verification.key;
        const kind = verification.kind;
        const data = verification.data;
        const [calculatedKindRoot, calculatedKindKey] =
          witness.kind.computeRootAndKey(kind);
        calculatedKindRoot.assertEquals(verification.nft.data.metadata.kind);
        calculatedKindKey.assertEquals(key);
        const [calculatedDataRoot, calculatedDataKey] =
          witness.data.computeRootAndKey(data);
        calculatedDataRoot.assertEquals(verification.nft.data.metadata.data);
        calculatedDataKey.assertEquals(key);
      },
    },
  },
});

export class KeyVerifierProof extends ZkProgram.Proof(KeyVerifier) {}
