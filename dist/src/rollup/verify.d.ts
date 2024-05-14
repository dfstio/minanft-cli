import { SmartContract, PublicKey, UInt64, State } from "o1js";
import { RollupVerifierProof, KeyVerifierProof } from "./proof";
import { RollupNftName } from "./contract";
declare const RollupNFTKeyVerification_base: (new (value: {
    blockAddress: PublicKey;
    blockRoot: import("o1js/dist/node/lib/provable/field").Field;
}) => {
    blockAddress: PublicKey;
    blockRoot: import("o1js/dist/node/lib/provable/field").Field;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    blockAddress: PublicKey;
    blockRoot: import("o1js/dist/node/lib/provable/field").Field;
}, {
    blockAddress: {
        x: bigint;
        isOdd: boolean;
    };
    blockRoot: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    };
} & {
    fromValue: (value: {
        blockAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        blockRoot: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    };
    toInput: (x: {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        blockAddress: string;
        blockRoot: string;
    };
    fromJSON: (x: {
        blockAddress: string;
        blockRoot: string;
    }) => {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    };
    empty: () => {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    };
};
export declare class RollupNFTKeyVerification extends RollupNFTKeyVerification_base {
}
declare const RollupNFTKeyVerificationEvent_base: (new (value: {
    blockAddress: PublicKey;
    blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    nft: RollupNftName;
    key: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}) => {
    blockAddress: PublicKey;
    blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    nft: RollupNftName;
    key: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    blockAddress: PublicKey;
    blockRoot: import("o1js/dist/node/lib/provable/field").Field;
    nft: RollupNftName;
    key: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}, {
    blockAddress: {
        x: bigint;
        isOdd: boolean;
    };
    blockRoot: bigint;
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
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
} & {
    fromValue: (value: {
        blockAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        blockRoot: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        nft: RollupNftName | {
            name: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            data: import("./contract").RollupNftNameValue | {
                address: PublicKey | {
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
                expiry: bigint | UInt64;
            };
        };
        key: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
    toInput: (x: {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        blockAddress: string;
        blockRoot: string;
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
        blockAddress: string;
        blockRoot: string;
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
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
    empty: () => {
        blockAddress: PublicKey;
        blockRoot: import("o1js/dist/node/lib/provable/field").Field;
        nft: RollupNftName;
        key: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
};
export declare class RollupNFTKeyVerificationEvent extends RollupNFTKeyVerificationEvent_base {
}
export declare class RollupNFTKeyVerifier extends SmartContract {
    rollup: State<PublicKey>;
    events: {
        verified: typeof RollupNFTKeyVerificationEvent;
    };
    verify(verificationData: RollupNFTKeyVerification, rollupProof: RollupVerifierProof, keyProof: KeyVerifierProof): Promise<void>;
}
export declare function deployRollupVerifier(privateKey: string): Promise<void>;
export declare function upgradeRollupVerifier(privateKey: string): Promise<void>;
export declare function verifyKeyOnChain(params: {
    verificationData: RollupNFTKeyVerification;
    rollupProof: RollupVerifierProof;
    keyProof: KeyVerifierProof;
}): Promise<void>;
export {};
