import { MerkleMapWitness } from "o1js";
import { RollupNftName } from "./contract";
import { MetadataWitness } from "minanft";
declare const RollupVerification_base: (new (value: {
    nft: RollupNftName;
    root: import("o1js/dist/node/lib/provable/field").Field;
}) => {
    nft: RollupNftName;
    root: import("o1js/dist/node/lib/provable/field").Field;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    nft: RollupNftName;
    root: import("o1js/dist/node/lib/provable/field").Field;
}, {
    nft: {
        name: bigint;
        data: {
            address: {
                x: bigint;
                isOdd: boolean;
            };
            metadata: {
                data: bigint;
                kind: bigint;
            };
            storage: {
                hashString: bigint[];
            };
            expiry: bigint;
        };
    };
    root: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        nft: RollupNftName;
        root: import("o1js/dist/node/lib/provable/field").Field;
    };
} & {
    fromValue: (value: {
        nft: RollupNftName | {
            name: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            data: import("./contract").RollupNftNameValue | {
                address: import("o1js").PublicKey | {
                    x: bigint | import("o1js/dist/node/lib/provable/field").Field;
                    isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
                };
                metadata: import("./contract").Metadata | {
                    data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                    kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                };
                storage: import("./contract").Storage | {
                    hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
                };
                expiry: bigint | import("o1js").UInt64;
            };
        };
        root: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        nft: RollupNftName;
        root: import("o1js/dist/node/lib/provable/field").Field;
    };
    toInput: (x: {
        nft: RollupNftName;
        root: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        nft: RollupNftName;
        root: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        nft: {
            name: string;
            data: {
                address: string;
                metadata: {
                    data: string;
                    kind: string;
                };
                storage: {
                    hashString: string[];
                };
                expiry: string;
            };
        };
        root: string;
    };
    fromJSON: (x: {
        nft: {
            name: string;
            data: {
                address: string;
                metadata: {
                    data: string;
                    kind: string;
                };
                storage: {
                    hashString: string[];
                };
                expiry: string;
            };
        };
        root: string;
    }) => {
        nft: RollupNftName;
        root: import("o1js/dist/node/lib/provable/field").Field;
    };
    empty: () => {
        nft: RollupNftName;
        root: import("o1js/dist/node/lib/provable/field").Field;
    };
};
export declare class RollupVerification extends RollupVerification_base {
}
export declare const RollupVerifier: {
    name: string;
    compile: (options?: {
        cache?: import("o1js").Cache | undefined;
        forceRecompile?: boolean | undefined;
    } | undefined) => Promise<{
        verificationKey: {
            data: string;
            hash: import("o1js/dist/node/lib/provable/field").Field;
        };
    }>;
    verify: (proof: import("o1js").Proof<RollupVerification, void>) => Promise<boolean>;
    digest: () => Promise<string>;
    analyzeMethods: () => Promise<{
        verify: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
    }>;
    publicInputType: typeof RollupVerification;
    publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    privateInputTypes: {
        verify: [typeof MerkleMapWitness];
    };
    rawMethods: {
        verify: (publicInput: RollupVerification, ...args: [MerkleMapWitness] & any[]) => Promise<void>;
    };
} & {
    verify: (publicInput: RollupVerification, ...args: [MerkleMapWitness] & any[]) => Promise<import("o1js").Proof<RollupVerification, void>>;
};
declare const RollupVerifierProof_base: {
    new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
        proof: unknown;
        publicInput: RollupVerification;
        publicOutput: void;
        maxProofsVerified: 0 | 1 | 2;
    }): {
        verify(): void;
        verifyIf(condition: import("o1js/dist/node/lib/provable/bool").Bool): void;
        publicInput: RollupVerification;
        publicOutput: void;
        proof: unknown;
        maxProofsVerified: 0 | 1 | 2;
        shouldVerify: import("o1js/dist/node/lib/provable/bool").Bool;
        toJSON(): import("o1js").JsonProof;
    };
    publicInputType: typeof RollupVerification;
    publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    tag: () => {
        name: string;
        publicInputType: typeof RollupVerification;
        publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    };
    fromJSON<S extends (new (...args: any) => import("o1js").Proof<unknown, unknown>) & {
        prototype: import("o1js").Proof<any, any>;
        fromJSON: typeof import("o1js").Proof.fromJSON;
        dummy: typeof import("o1js").Proof.dummy;
        publicInputType: import("o1js").FlexibleProvablePure<any>;
        publicOutputType: import("o1js").FlexibleProvablePure<any>;
        tag: () => {
            name: string;
        };
    } & {
        prototype: import("o1js").Proof<unknown, unknown>;
    }>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: import("o1js").JsonProof): Promise<import("o1js").Proof<import("o1js").InferProvable<S["publicInputType"]>, import("o1js").InferProvable<S["publicOutputType"]>>>;
    dummy<Input, OutPut>(publicInput: Input, publicOutput: OutPut, maxProofsVerified: 0 | 1 | 2, domainLog2?: number | undefined): Promise<import("o1js").Proof<Input, OutPut>>;
};
export declare class RollupVerifierProof extends RollupVerifierProof_base {
}
declare const KeyVerification_base: (new (value: {
    nft: RollupNftName;
    key: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}) => {
    nft: RollupNftName;
    key: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    nft: RollupNftName;
    key: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}, {
    nft: {
        name: bigint;
        data: {
            address: {
                x: bigint;
                isOdd: boolean;
            };
            metadata: {
                data: bigint;
                kind: bigint;
            };
            storage: {
                hashString: bigint[];
            };
            expiry: bigint;
        };
    };
    key: bigint;
    kind: bigint;
    data: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
} & {
    fromValue: (value: {
        nft: RollupNftName | {
            name: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            data: import("./contract").RollupNftNameValue | {
                address: import("o1js").PublicKey | {
                    x: bigint | import("o1js/dist/node/lib/provable/field").Field;
                    isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
                };
                metadata: import("./contract").Metadata | {
                    data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                    kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                };
                storage: import("./contract").Storage | {
                    hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
                };
                expiry: bigint | import("o1js").UInt64;
            };
        };
        key: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
    toInput: (x: {
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        nft: {
            name: string;
            data: {
                address: string;
                metadata: {
                    data: string;
                    kind: string;
                };
                storage: {
                    hashString: string[];
                };
                expiry: string;
            };
        };
        key: string;
        kind: string;
        data: string;
    };
    fromJSON: (x: {
        nft: {
            name: string;
            data: {
                address: string;
                metadata: {
                    data: string;
                    kind: string;
                };
                storage: {
                    hashString: string[];
                };
                expiry: string;
            };
        };
        key: string;
        kind: string;
        data: string;
    }) => {
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
    empty: () => {
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
};
export declare class KeyVerification extends KeyVerification_base {
}
export declare const KeyVerifier: {
    name: string;
    compile: (options?: {
        cache?: import("o1js").Cache | undefined;
        forceRecompile?: boolean | undefined;
    } | undefined) => Promise<{
        verificationKey: {
            data: string;
            hash: import("o1js/dist/node/lib/provable/field").Field;
        };
    }>;
    verify: (proof: import("o1js").Proof<KeyVerification, void>) => Promise<boolean>;
    digest: () => Promise<string>;
    analyzeMethods: () => Promise<{
        verify: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
    }>;
    publicInputType: typeof KeyVerification;
    publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    privateInputTypes: {
        verify: [typeof MetadataWitness];
    };
    rawMethods: {
        verify: (publicInput: KeyVerification, ...args: [MetadataWitness] & any[]) => Promise<void>;
    };
} & {
    verify: (publicInput: KeyVerification, ...args: [MetadataWitness] & any[]) => Promise<import("o1js").Proof<KeyVerification, void>>;
};
declare const KeyVerifierProof_base: {
    new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
        proof: unknown;
        publicInput: KeyVerification;
        publicOutput: void;
        maxProofsVerified: 0 | 1 | 2;
    }): {
        verify(): void;
        verifyIf(condition: import("o1js/dist/node/lib/provable/bool").Bool): void;
        publicInput: KeyVerification;
        publicOutput: void;
        proof: unknown;
        maxProofsVerified: 0 | 1 | 2;
        shouldVerify: import("o1js/dist/node/lib/provable/bool").Bool;
        toJSON(): import("o1js").JsonProof;
    };
    publicInputType: typeof KeyVerification;
    publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    tag: () => {
        name: string;
        publicInputType: typeof KeyVerification;
        publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    };
    fromJSON<S extends (new (...args: any) => import("o1js").Proof<unknown, unknown>) & {
        prototype: import("o1js").Proof<any, any>;
        fromJSON: typeof import("o1js").Proof.fromJSON;
        dummy: typeof import("o1js").Proof.dummy;
        publicInputType: import("o1js").FlexibleProvablePure<any>;
        publicOutputType: import("o1js").FlexibleProvablePure<any>;
        tag: () => {
            name: string;
        };
    } & {
        prototype: import("o1js").Proof<unknown, unknown>;
    }>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: import("o1js").JsonProof): Promise<import("o1js").Proof<import("o1js").InferProvable<S["publicInputType"]>, import("o1js").InferProvable<S["publicOutputType"]>>>;
    dummy<Input, OutPut>(publicInput: Input, publicOutput: OutPut, maxProofsVerified: 0 | 1 | 2, domainLog2?: number | undefined): Promise<import("o1js").Proof<Input, OutPut>>;
};
export declare class KeyVerifierProof extends KeyVerifierProof_base {
}
export {};
