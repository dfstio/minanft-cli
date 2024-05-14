import { Field, State, SmartContract, DeployArgs, PublicKey, Bool, TokenContract, AccountUpdateForest, UInt64, VerificationKey, UInt32, SelfProof, UInt8, Signature, MerkleMapWitness } from "o1js";
export declare const ValidatorDecisionType: {
    validate: import("o1js/dist/node/lib/provable/field").Field;
    badBlock: import("o1js/dist/node/lib/provable/field").Field;
    createBlock: import("o1js/dist/node/lib/provable/field").Field;
    setValidators: import("o1js/dist/node/lib/provable/field").Field;
};
declare const ValidatorsState_base: (new (value: {
    root: import("o1js/dist/node/lib/provable/field").Field;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}) => {
    root: import("o1js/dist/node/lib/provable/field").Field;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    root: import("o1js/dist/node/lib/provable/field").Field;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}, {
    root: bigint;
    hash: bigint;
    count: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        root: import("o1js/dist/node/lib/provable/field").Field;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
} & {
    fromValue: (value: {
        root: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        hash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        count: bigint | UInt32;
    }) => {
        root: import("o1js/dist/node/lib/provable/field").Field;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
    toInput: (x: {
        root: import("o1js/dist/node/lib/provable/field").Field;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        root: import("o1js/dist/node/lib/provable/field").Field;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    }) => {
        root: string;
        hash: string;
        count: string;
    };
    fromJSON: (x: {
        root: string;
        hash: string;
        count: string;
    }) => {
        root: import("o1js/dist/node/lib/provable/field").Field;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
    empty: () => {
        root: import("o1js/dist/node/lib/provable/field").Field;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
};
export declare class ValidatorsState extends ValidatorsState_base {
    static assertEquals(a: ValidatorsState, b: ValidatorsState): void;
    pack(): Field;
}
declare const Storage_base: (new (value: {
    hashString: import("o1js/dist/node/lib/provable/field").Field[];
}) => {
    hashString: import("o1js/dist/node/lib/provable/field").Field[];
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    hashString: import("o1js/dist/node/lib/provable/field").Field[];
}, {
    hashString: bigint[];
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        hashString: import("o1js/dist/node/lib/provable/field").Field[];
    };
} & {
    fromValue: (value: {
        hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
    }) => {
        hashString: import("o1js/dist/node/lib/provable/field").Field[];
    };
    toInput: (x: {
        hashString: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        hashString: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        hashString: string[];
    };
    fromJSON: (x: {
        hashString: string[];
    }) => {
        hashString: import("o1js/dist/node/lib/provable/field").Field[];
    };
    empty: () => {
        hashString: import("o1js/dist/node/lib/provable/field").Field[];
    };
};
/**
 * Storage is the hash of the IPFS or Arweave storage where the metadata is written
 * format of the IPFS hash string: i:...
 * format of the Arweave hash string: a:...
 * @property hashString The hash string of the storage
 */
export declare class Storage extends Storage_base {
    constructor(value: {
        hashString: [Field, Field];
    });
    static empty(): Storage;
    static assertEquals(a: Storage, b: Storage): void;
    static equals(a: Storage, b: Storage): Bool;
    static fromIpfsHash(hash: string): Storage;
    toIpfsHash(): string;
}
declare const Metadata_base: (new (value: {
    data: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
}) => {
    data: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    data: import("o1js/dist/node/lib/provable/field").Field;
    kind: import("o1js/dist/node/lib/provable/field").Field;
}, {
    data: bigint;
    kind: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        data: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
    };
} & {
    fromValue: (value: {
        data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        data: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
    };
    toInput: (x: {
        data: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        data: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        data: string;
        kind: string;
    };
    fromJSON: (x: {
        data: string;
        kind: string;
    }) => {
        data: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
    };
    empty: () => {
        data: import("o1js/dist/node/lib/provable/field").Field;
        kind: import("o1js/dist/node/lib/provable/field").Field;
    };
};
export declare class Metadata extends Metadata_base {
    /**
     * Asserts that two Metadata objects are equal
     * @param state1 first Metadata object
     * @param state2 second Metadata object
     */
    static assertEquals(state1: Metadata, state2: Metadata): void;
    static equals(state1: Metadata, state2: Metadata): Bool;
}
declare const BlockParams_base: (new (value: {
    txsCount: UInt32;
    timeCreated: UInt64;
    isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
    isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
    isProved: import("o1js/dist/node/lib/provable/bool").Bool;
    isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
}) => {
    txsCount: UInt32;
    timeCreated: UInt64;
    isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
    isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
    isProved: import("o1js/dist/node/lib/provable/bool").Bool;
    isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    txsCount: UInt32;
    timeCreated: UInt64;
    isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
    isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
    isProved: import("o1js/dist/node/lib/provable/bool").Bool;
    isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
}, {
    txsCount: bigint;
    timeCreated: bigint;
    isValidated: boolean;
    isFinal: boolean;
    isProved: boolean;
    isInvalid: boolean;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        txsCount: UInt32;
        timeCreated: UInt64;
        isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
        isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
        isProved: import("o1js/dist/node/lib/provable/bool").Bool;
        isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
    };
} & {
    fromValue: (value: {
        txsCount: bigint | UInt32;
        timeCreated: bigint | UInt64;
        isValidated: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        isFinal: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        isProved: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        isInvalid: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
    }) => {
        txsCount: UInt32;
        timeCreated: UInt64;
        isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
        isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
        isProved: import("o1js/dist/node/lib/provable/bool").Bool;
        isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
    };
    toInput: (x: {
        txsCount: UInt32;
        timeCreated: UInt64;
        isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
        isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
        isProved: import("o1js/dist/node/lib/provable/bool").Bool;
        isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        txsCount: UInt32;
        timeCreated: UInt64;
        isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
        isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
        isProved: import("o1js/dist/node/lib/provable/bool").Bool;
        isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
    }) => {
        txsCount: string;
        timeCreated: string;
        isValidated: boolean;
        isFinal: boolean;
        isProved: boolean;
        isInvalid: boolean;
    };
    fromJSON: (x: {
        txsCount: string;
        timeCreated: string;
        isValidated: boolean;
        isFinal: boolean;
        isProved: boolean;
        isInvalid: boolean;
    }) => {
        txsCount: UInt32;
        timeCreated: UInt64;
        isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
        isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
        isProved: import("o1js/dist/node/lib/provable/bool").Bool;
        isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
    };
    empty: () => {
        txsCount: UInt32;
        timeCreated: UInt64;
        isValidated: import("o1js/dist/node/lib/provable/bool").Bool;
        isFinal: import("o1js/dist/node/lib/provable/bool").Bool;
        isProved: import("o1js/dist/node/lib/provable/bool").Bool;
        isInvalid: import("o1js/dist/node/lib/provable/bool").Bool;
    };
};
export declare class BlockParams extends BlockParams_base {
    pack(): Field;
    static unpack(packed: Field): BlockParams;
}
export type DomainTransactionType = "add" | "extend" | "update" | "remove";
export type DomainTransactionStatus = "sent" | "invalid" | "accepted" | "rejected";
declare const RollupNftNameValue_base: (new (value: {
    address: PublicKey;
    metadata: Metadata;
    storage: Storage;
    expiry: UInt64;
}) => {
    address: PublicKey;
    metadata: Metadata;
    storage: Storage;
    expiry: UInt64;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    address: PublicKey;
    metadata: Metadata;
    storage: Storage;
    expiry: UInt64;
}, {
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
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        address: PublicKey;
        metadata: Metadata;
        storage: Storage;
        expiry: UInt64;
    };
} & {
    fromValue: (value: {
        address: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        metadata: Metadata | {
            data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        };
        storage: Storage | {
            hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
        };
        expiry: bigint | UInt64;
    }) => {
        address: PublicKey;
        metadata: Metadata;
        storage: Storage;
        expiry: UInt64;
    };
    toInput: (x: {
        address: PublicKey;
        metadata: Metadata;
        storage: Storage;
        expiry: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        address: PublicKey;
        metadata: Metadata;
        storage: Storage;
        expiry: UInt64;
    }) => {
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
    fromJSON: (x: {
        address: string;
        metadata: {
            data: string;
            kind: string;
        };
        storage: {
            hashString: string[];
        };
        expiry: string;
    }) => {
        address: PublicKey;
        metadata: Metadata;
        storage: Storage;
        expiry: UInt64;
    };
    empty: () => {
        address: PublicKey;
        metadata: Metadata;
        storage: Storage;
        expiry: UInt64;
    };
};
export declare class RollupNftNameValue extends RollupNftNameValue_base {
    hash(): Field;
    static empty(): RollupNftNameValue;
}
declare const RollupNftName_base: (new (value: {
    name: import("o1js/dist/node/lib/provable/field").Field;
    data: RollupNftNameValue;
}) => {
    name: import("o1js/dist/node/lib/provable/field").Field;
    data: RollupNftNameValue;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    name: import("o1js/dist/node/lib/provable/field").Field;
    data: RollupNftNameValue;
}, {
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
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        name: import("o1js/dist/node/lib/provable/field").Field;
        data: RollupNftNameValue;
    };
} & {
    fromValue: (value: {
        name: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        data: RollupNftNameValue | {
            address: PublicKey | {
                x: bigint | import("o1js/dist/node/lib/provable/field").Field;
                isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
            };
            metadata: Metadata | {
                data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            };
            storage: Storage | {
                hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
            };
            expiry: bigint | UInt64;
        };
    }) => {
        name: import("o1js/dist/node/lib/provable/field").Field;
        data: RollupNftNameValue;
    };
    toInput: (x: {
        name: import("o1js/dist/node/lib/provable/field").Field;
        data: RollupNftNameValue;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        name: import("o1js/dist/node/lib/provable/field").Field;
        data: RollupNftNameValue;
    }) => {
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
    fromJSON: (x: {
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
    }) => {
        name: import("o1js/dist/node/lib/provable/field").Field;
        data: RollupNftNameValue;
    };
    empty: () => {
        name: import("o1js/dist/node/lib/provable/field").Field;
        data: RollupNftNameValue;
    };
};
export declare class RollupNftName extends RollupNftName_base {
    static empty(): RollupNftName;
    isEmpty(): Bool;
    value(): Field;
    key(): Field;
    hash(): Field;
}
export declare const DomainTransactionEnum: {
    [k in DomainTransactionType]: UInt8;
};
declare const DomainTransaction_base: (new (value: {
    type: UInt8;
    domain: RollupNftName;
}) => {
    type: UInt8;
    domain: RollupNftName;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    type: UInt8;
    domain: RollupNftName;
}, {
    type: {
        value: bigint;
    };
    domain: {
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
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        type: UInt8;
        domain: RollupNftName;
    };
} & {
    fromValue: (value: {
        type: UInt8 | {
            value: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        };
        domain: RollupNftName | {
            name: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            data: RollupNftNameValue | {
                address: PublicKey | {
                    x: bigint | import("o1js/dist/node/lib/provable/field").Field;
                    isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
                };
                metadata: Metadata | {
                    data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                    kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                };
                storage: Storage | {
                    hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
                };
                expiry: bigint | UInt64;
            };
        };
    }) => {
        type: UInt8;
        domain: RollupNftName;
    };
    toInput: (x: {
        type: UInt8;
        domain: RollupNftName;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        type: UInt8;
        domain: RollupNftName;
    }) => {
        type: {
            value: string;
        };
        domain: {
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
    };
    fromJSON: (x: {
        type: {
            value: string;
        };
        domain: {
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
    }) => {
        type: UInt8;
        domain: RollupNftName;
    };
    empty: () => {
        type: UInt8;
        domain: RollupNftName;
    };
};
export declare class DomainTransaction extends DomainTransaction_base {
    hash(): Field;
}
export declare class DomainTransactionData {
    readonly tx: DomainTransaction;
    readonly oldDomain?: RollupNftName | undefined;
    readonly signature?: Signature | undefined;
    constructor(tx: DomainTransaction, oldDomain?: RollupNftName | undefined, signature?: Signature | undefined);
    txType(): DomainTransactionType;
    toJSON(): {
        tx: string;
        oldDomain: string | undefined;
        signature: string | undefined;
    };
    static fromJSON(data: any): DomainTransactionData;
    validate(): void;
}
export interface DomainSerializedTransaction {
    operation: DomainTransactionType;
    name: string;
    address: string;
    expiry: number;
    metadata?: string;
    storage?: string;
    newDomain?: string;
    oldDomain?: string;
    signature?: string;
}
export type DomainCloudTransactionStatus = "sent" | "invalid" | "pending" | "accepted" | "rejected";
export interface DomainCloudTransaction {
    txId: string;
    transaction: string;
    timeReceived: number;
    newDomain?: string;
    fields?: string;
    status: DomainCloudTransactionStatus;
    reason?: string;
}
export interface DomainCloudTransactionData {
    serializedTx: DomainCloudTransaction;
    domainData: DomainTransactionData | undefined;
}
declare const MapUpdateData_base: (new (value: {
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    newRoot: import("o1js/dist/node/lib/provable/field").Field;
    time: UInt64;
    tx: DomainTransaction;
    witness: MerkleMapWitness;
}) => {
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    newRoot: import("o1js/dist/node/lib/provable/field").Field;
    time: UInt64;
    tx: DomainTransaction;
    witness: MerkleMapWitness;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    newRoot: import("o1js/dist/node/lib/provable/field").Field;
    time: UInt64;
    tx: DomainTransaction;
    witness: MerkleMapWitness;
}, {
    oldRoot: bigint;
    newRoot: bigint;
    time: bigint;
    tx: {
        type: {
            value: bigint;
        };
        domain: {
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
    };
    witness: any;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        tx: DomainTransaction;
        witness: MerkleMapWitness;
    };
} & {
    fromValue: (value: {
        oldRoot: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        newRoot: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        time: bigint | UInt64;
        tx: DomainTransaction | {
            type: UInt8 | {
                value: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            };
            domain: RollupNftName | {
                name: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                data: RollupNftNameValue | {
                    address: PublicKey | {
                        x: bigint | import("o1js/dist/node/lib/provable/field").Field;
                        isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
                    };
                    metadata: Metadata | {
                        data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                        kind: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                    };
                    storage: Storage | {
                        hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
                    };
                    expiry: bigint | UInt64;
                };
            };
        };
        witness: any;
    }) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        tx: DomainTransaction;
        witness: MerkleMapWitness;
    };
    toInput: (x: {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        tx: DomainTransaction;
        witness: MerkleMapWitness;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        tx: DomainTransaction;
        witness: MerkleMapWitness;
    }) => {
        oldRoot: string;
        newRoot: string;
        time: string;
        tx: {
            type: {
                value: string;
            };
            domain: {
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
        };
        witness: any;
    };
    fromJSON: (x: {
        oldRoot: string;
        newRoot: string;
        time: string;
        tx: {
            type: {
                value: string;
            };
            domain: {
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
        };
        witness: any;
    }) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        tx: DomainTransaction;
        witness: MerkleMapWitness;
    };
    empty: () => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        tx: DomainTransaction;
        witness: MerkleMapWitness;
    };
};
export declare class MapUpdateData extends MapUpdateData_base {
}
declare const MapTransition_base: (new (value: {
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    newRoot: import("o1js/dist/node/lib/provable/field").Field;
    time: UInt64;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}) => {
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    newRoot: import("o1js/dist/node/lib/provable/field").Field;
    time: UInt64;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    newRoot: import("o1js/dist/node/lib/provable/field").Field;
    time: UInt64;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}, {
    oldRoot: bigint;
    newRoot: bigint;
    time: bigint;
    hash: bigint;
    count: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
} & {
    fromValue: (value: {
        oldRoot: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        newRoot: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        time: bigint | UInt64;
        hash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        count: bigint | UInt32;
    }) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
    toInput: (x: {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    }) => {
        oldRoot: string;
        newRoot: string;
        time: string;
        hash: string;
        count: string;
    };
    fromJSON: (x: {
        oldRoot: string;
        newRoot: string;
        time: string;
        hash: string;
        count: string;
    }) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
    empty: () => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        newRoot: import("o1js/dist/node/lib/provable/field").Field;
        time: UInt64;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
};
export declare class MapTransition extends MapTransition_base {
    static add(update: MapUpdateData): MapTransition;
    static update(update: MapUpdateData, oldDomain: RollupNftName, signature: Signature): MapTransition;
    static extend(update: MapUpdateData, oldDomain: RollupNftName): MapTransition;
    static remove(update: MapUpdateData): MapTransition;
    static reject(root: Field, time: UInt64, domain: DomainTransaction): MapTransition;
    static merge(transition1: MapTransition, transition2: MapTransition): MapTransition;
    static assertEquals(transition1: MapTransition, transition2: MapTransition): void;
}
export declare const MapUpdate: {
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
    verify: (proof: import("o1js").Proof<MapTransition, void>) => Promise<boolean>;
    digest: () => Promise<string>;
    analyzeMethods: () => Promise<{
        add: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
        update: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
        extend: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
        remove: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
        reject: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
        merge: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
    }>;
    publicInputType: typeof MapTransition;
    publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    privateInputTypes: {
        add: [typeof MapUpdateData];
        update: [typeof MapUpdateData, typeof RollupNftName, typeof Signature];
        extend: [typeof MapUpdateData, typeof RollupNftName];
        remove: [typeof MapUpdateData];
        reject: [typeof import("o1js/dist/node/lib/provable/field").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field | import("o1js/dist/node/lib/provable/core/fieldvar").FieldConst | import("o1js/dist/node/lib/provable/core/fieldvar").FieldVar) => import("o1js/dist/node/lib/provable/field").Field), typeof UInt64, typeof DomainTransaction];
        merge: [typeof SelfProof, typeof SelfProof];
    };
    rawMethods: {
        add: (publicInput: MapTransition, ...args: [MapUpdateData] & any[]) => Promise<void>;
        update: (publicInput: MapTransition, ...args: [MapUpdateData, RollupNftName, Signature] & any[]) => Promise<void>;
        extend: (publicInput: MapTransition, ...args: [MapUpdateData, RollupNftName] & any[]) => Promise<void>;
        remove: (publicInput: MapTransition, ...args: [MapUpdateData] & any[]) => Promise<void>;
        reject: (publicInput: MapTransition, ...args: [import("o1js/dist/node/lib/provable/field").Field, UInt64, DomainTransaction] & any[]) => Promise<void>;
        merge: (publicInput: MapTransition, ...args: [SelfProof<unknown, unknown>, SelfProof<unknown, unknown>] & any[]) => Promise<void>;
    };
} & {
    add: (publicInput: MapTransition, ...args: [MapUpdateData] & any[]) => Promise<import("o1js").Proof<MapTransition, void>>;
    update: (publicInput: MapTransition, ...args: [MapUpdateData, RollupNftName, Signature] & any[]) => Promise<import("o1js").Proof<MapTransition, void>>;
    extend: (publicInput: MapTransition, ...args: [MapUpdateData, RollupNftName] & any[]) => Promise<import("o1js").Proof<MapTransition, void>>;
    remove: (publicInput: MapTransition, ...args: [MapUpdateData] & any[]) => Promise<import("o1js").Proof<MapTransition, void>>;
    reject: (publicInput: MapTransition, ...args: [import("o1js/dist/node/lib/provable/field").Field, UInt64, DomainTransaction] & any[]) => Promise<import("o1js").Proof<MapTransition, void>>;
    merge: (publicInput: MapTransition, ...args: [SelfProof<unknown, unknown>, SelfProof<unknown, unknown>] & any[]) => Promise<import("o1js").Proof<MapTransition, void>>;
};
declare const MapUpdateProof_base: {
    new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
        proof: unknown;
        publicInput: MapTransition;
        publicOutput: void;
        maxProofsVerified: 0 | 1 | 2;
    }): {
        verify(): void;
        verifyIf(condition: import("o1js/dist/node/lib/provable/bool").Bool): void;
        publicInput: MapTransition;
        publicOutput: void;
        proof: unknown;
        maxProofsVerified: 0 | 1 | 2;
        shouldVerify: import("o1js/dist/node/lib/provable/bool").Bool;
        toJSON(): import("o1js").JsonProof;
    };
    publicInputType: typeof MapTransition;
    publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    tag: () => {
        name: string;
        publicInputType: typeof MapTransition;
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
export declare class MapUpdateProof extends MapUpdateProof_base {
}
declare const ValidatorWitness_base: typeof import("o1js/dist/node/lib/provable/merkle-tree").BaseMerkleWitness;
export declare class ValidatorWitness extends ValidatorWitness_base {
}
declare const ValidatorsDecision_base: (new (value: {
    contractAddress: PublicKey;
    chainId: import("o1js/dist/node/lib/provable/field").Field;
    validators: ValidatorsState;
    decisionType: import("o1js/dist/node/lib/provable/field").Field;
    expiry: UInt64;
    data: import("o1js/dist/node/lib/provable/field").Field[];
}) => {
    contractAddress: PublicKey;
    chainId: import("o1js/dist/node/lib/provable/field").Field;
    validators: ValidatorsState;
    decisionType: import("o1js/dist/node/lib/provable/field").Field;
    expiry: UInt64;
    data: import("o1js/dist/node/lib/provable/field").Field[];
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    contractAddress: PublicKey;
    chainId: import("o1js/dist/node/lib/provable/field").Field;
    validators: ValidatorsState;
    decisionType: import("o1js/dist/node/lib/provable/field").Field;
    expiry: UInt64;
    data: import("o1js/dist/node/lib/provable/field").Field[];
}, {
    contractAddress: {
        x: bigint;
        isOdd: boolean;
    };
    chainId: bigint;
    validators: {
        root: bigint;
        hash: bigint;
        count: bigint;
    };
    decisionType: bigint;
    expiry: bigint;
    data: bigint[];
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        contractAddress: PublicKey;
        chainId: import("o1js/dist/node/lib/provable/field").Field;
        validators: ValidatorsState;
        decisionType: import("o1js/dist/node/lib/provable/field").Field;
        expiry: UInt64;
        data: import("o1js/dist/node/lib/provable/field").Field[];
    };
} & {
    fromValue: (value: {
        contractAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        chainId: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        validators: ValidatorsState | {
            root: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            hash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            count: bigint | UInt32;
        };
        decisionType: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        expiry: bigint | UInt64;
        data: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
    }) => {
        contractAddress: PublicKey;
        chainId: import("o1js/dist/node/lib/provable/field").Field;
        validators: ValidatorsState;
        decisionType: import("o1js/dist/node/lib/provable/field").Field;
        expiry: UInt64;
        data: import("o1js/dist/node/lib/provable/field").Field[];
    };
    toInput: (x: {
        contractAddress: PublicKey;
        chainId: import("o1js/dist/node/lib/provable/field").Field;
        validators: ValidatorsState;
        decisionType: import("o1js/dist/node/lib/provable/field").Field;
        expiry: UInt64;
        data: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        contractAddress: PublicKey;
        chainId: import("o1js/dist/node/lib/provable/field").Field;
        validators: ValidatorsState;
        decisionType: import("o1js/dist/node/lib/provable/field").Field;
        expiry: UInt64;
        data: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        contractAddress: string;
        chainId: string;
        validators: {
            root: string;
            hash: string;
            count: string;
        };
        decisionType: string;
        expiry: string;
        data: string[];
    };
    fromJSON: (x: {
        contractAddress: string;
        chainId: string;
        validators: {
            root: string;
            hash: string;
            count: string;
        };
        decisionType: string;
        expiry: string;
        data: string[];
    }) => {
        contractAddress: PublicKey;
        chainId: import("o1js/dist/node/lib/provable/field").Field;
        validators: ValidatorsState;
        decisionType: import("o1js/dist/node/lib/provable/field").Field;
        expiry: UInt64;
        data: import("o1js/dist/node/lib/provable/field").Field[];
    };
    empty: () => {
        contractAddress: PublicKey;
        chainId: import("o1js/dist/node/lib/provable/field").Field;
        validators: ValidatorsState;
        decisionType: import("o1js/dist/node/lib/provable/field").Field;
        expiry: UInt64;
        data: import("o1js/dist/node/lib/provable/field").Field[];
    };
};
export declare class ValidatorsDecision extends ValidatorsDecision_base {
    static assertEquals(a: ValidatorsDecision, b: ValidatorsDecision): void;
}
declare const ValidatorsDecisionState_base: (new (value: {
    decision: ValidatorsDecision;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}) => {
    decision: ValidatorsDecision;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    decision: ValidatorsDecision;
    hash: import("o1js/dist/node/lib/provable/field").Field;
    count: UInt32;
}, {
    decision: {
        contractAddress: {
            x: bigint;
            isOdd: boolean;
        };
        chainId: bigint;
        validators: {
            root: bigint;
            hash: bigint;
            count: bigint;
        };
        decisionType: bigint;
        expiry: bigint;
        data: bigint[];
    };
    hash: bigint;
    count: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        decision: ValidatorsDecision;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
} & {
    fromValue: (value: {
        decision: ValidatorsDecision | {
            contractAddress: PublicKey | {
                x: bigint | import("o1js/dist/node/lib/provable/field").Field;
                isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
            };
            chainId: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            validators: ValidatorsState | {
                root: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                hash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
                count: bigint | UInt32;
            };
            decisionType: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            expiry: bigint | UInt64;
            data: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
        };
        hash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        count: bigint | UInt32;
    }) => {
        decision: ValidatorsDecision;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
    toInput: (x: {
        decision: ValidatorsDecision;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        decision: ValidatorsDecision;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    }) => {
        decision: {
            contractAddress: string;
            chainId: string;
            validators: {
                root: string;
                hash: string;
                count: string;
            };
            decisionType: string;
            expiry: string;
            data: string[];
        };
        hash: string;
        count: string;
    };
    fromJSON: (x: {
        decision: {
            contractAddress: string;
            chainId: string;
            validators: {
                root: string;
                hash: string;
                count: string;
            };
            decisionType: string;
            expiry: string;
            data: string[];
        };
        hash: string;
        count: string;
    }) => {
        decision: ValidatorsDecision;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
    empty: () => {
        decision: ValidatorsDecision;
        hash: import("o1js/dist/node/lib/provable/field").Field;
        count: UInt32;
    };
};
export declare class ValidatorsDecisionState extends ValidatorsDecisionState_base {
    static vote(decision: ValidatorsDecision, validatorAddress: PublicKey, witness: ValidatorWitness, signature: Signature): ValidatorsDecisionState;
    static abstain(decision: ValidatorsDecision, validatorAddress: PublicKey, witness: ValidatorWitness): ValidatorsDecisionState;
    static merge(state1: ValidatorsDecisionState, state2: ValidatorsDecisionState): ValidatorsDecisionState;
    static assertEquals(a: ValidatorsDecisionState, b: ValidatorsDecisionState): void;
}
export declare const ValidatorsVoting: {
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
    verify: (proof: import("o1js").Proof<ValidatorsDecisionState, void>) => Promise<boolean>;
    digest: () => Promise<string>;
    analyzeMethods: () => Promise<{
        vote: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
        abstain: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
        merge: {
            rows: number;
            digest: string;
            gates: import("o1js/dist/node/snarky").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("o1js/dist/node/snarky").GateType | "Total rows", number>>;
        };
    }>;
    publicInputType: typeof ValidatorsDecisionState;
    publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    privateInputTypes: {
        vote: [typeof ValidatorsDecision, typeof PublicKey, typeof ValidatorWitness, typeof Signature];
        abstain: [typeof ValidatorsDecision, typeof PublicKey, typeof ValidatorWitness];
        merge: [typeof SelfProof, typeof SelfProof];
    };
    rawMethods: {
        vote: (publicInput: ValidatorsDecisionState, ...args: [ValidatorsDecision, PublicKey, ValidatorWitness, Signature] & any[]) => Promise<void>;
        abstain: (publicInput: ValidatorsDecisionState, ...args: [ValidatorsDecision, PublicKey, ValidatorWitness] & any[]) => Promise<void>;
        merge: (publicInput: ValidatorsDecisionState, ...args: [SelfProof<unknown, unknown>, SelfProof<unknown, unknown>] & any[]) => Promise<void>;
    };
} & {
    vote: (publicInput: ValidatorsDecisionState, ...args: [ValidatorsDecision, PublicKey, ValidatorWitness, Signature] & any[]) => Promise<import("o1js").Proof<ValidatorsDecisionState, void>>;
    abstain: (publicInput: ValidatorsDecisionState, ...args: [ValidatorsDecision, PublicKey, ValidatorWitness] & any[]) => Promise<import("o1js").Proof<ValidatorsDecisionState, void>>;
    merge: (publicInput: ValidatorsDecisionState, ...args: [SelfProof<unknown, unknown>, SelfProof<unknown, unknown>] & any[]) => Promise<import("o1js").Proof<ValidatorsDecisionState, void>>;
};
declare const ValidatorsVotingProof_base: {
    new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
        proof: unknown;
        publicInput: ValidatorsDecisionState;
        publicOutput: void;
        maxProofsVerified: 0 | 1 | 2;
    }): {
        verify(): void;
        verifyIf(condition: import("o1js/dist/node/lib/provable/bool").Bool): void;
        publicInput: ValidatorsDecisionState;
        publicOutput: void;
        proof: unknown;
        maxProofsVerified: 0 | 1 | 2;
        shouldVerify: import("o1js/dist/node/lib/provable/bool").Bool;
        toJSON(): import("o1js").JsonProof;
    };
    publicInputType: typeof ValidatorsDecisionState;
    publicOutputType: import("o1js/dist/node/lib/provable/types/struct").ProvablePureExtended<void, void, null>;
    tag: () => {
        name: string;
        publicInputType: typeof ValidatorsDecisionState;
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
export declare class ValidatorsVotingProof extends ValidatorsVotingProof_base {
}
declare const BlockCreationData_base: (new (value: {
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
    blockAddress: PublicKey;
    blockProducer: PublicKey;
    previousBlockAddress: PublicKey;
}) => {
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
    blockAddress: PublicKey;
    blockProducer: PublicKey;
    previousBlockAddress: PublicKey;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    oldRoot: import("o1js/dist/node/lib/provable/field").Field;
    verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
    blockAddress: PublicKey;
    blockProducer: PublicKey;
    previousBlockAddress: PublicKey;
}, {
    oldRoot: bigint;
    verificationKeyHash: bigint;
    blockAddress: {
        x: bigint;
        isOdd: boolean;
    };
    blockProducer: {
        x: bigint;
        isOdd: boolean;
    };
    previousBlockAddress: {
        x: bigint;
        isOdd: boolean;
    };
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
        blockProducer: PublicKey;
        previousBlockAddress: PublicKey;
    };
} & {
    fromValue: (value: {
        oldRoot: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        verificationKeyHash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        blockProducer: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        previousBlockAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
    }) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
        blockProducer: PublicKey;
        previousBlockAddress: PublicKey;
    };
    toInput: (x: {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
        blockProducer: PublicKey;
        previousBlockAddress: PublicKey;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
        blockProducer: PublicKey;
        previousBlockAddress: PublicKey;
    }) => {
        oldRoot: string;
        verificationKeyHash: string;
        blockAddress: string;
        blockProducer: string;
        previousBlockAddress: string;
    };
    fromJSON: (x: {
        oldRoot: string;
        verificationKeyHash: string;
        blockAddress: string;
        blockProducer: string;
        previousBlockAddress: string;
    }) => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
        blockProducer: PublicKey;
        previousBlockAddress: PublicKey;
    };
    empty: () => {
        oldRoot: import("o1js/dist/node/lib/provable/field").Field;
        verificationKeyHash: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
        blockProducer: PublicKey;
        previousBlockAddress: PublicKey;
    };
};
export declare class BlockCreationData extends BlockCreationData_base {
}
declare const BlockValidationData_base: (new (value: {
    storage: Storage;
    root: import("o1js/dist/node/lib/provable/field").Field;
    txsHash: import("o1js/dist/node/lib/provable/field").Field;
    txsCount: UInt32;
    blockAddress: PublicKey;
    notUsed: import("o1js/dist/node/lib/provable/field").Field;
}) => {
    storage: Storage;
    root: import("o1js/dist/node/lib/provable/field").Field;
    txsHash: import("o1js/dist/node/lib/provable/field").Field;
    txsCount: UInt32;
    blockAddress: PublicKey;
    notUsed: import("o1js/dist/node/lib/provable/field").Field;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    storage: Storage;
    root: import("o1js/dist/node/lib/provable/field").Field;
    txsHash: import("o1js/dist/node/lib/provable/field").Field;
    txsCount: UInt32;
    blockAddress: PublicKey;
    notUsed: import("o1js/dist/node/lib/provable/field").Field;
}, {
    storage: {
        hashString: bigint[];
    };
    root: bigint;
    txsHash: bigint;
    txsCount: bigint;
    blockAddress: {
        x: bigint;
        isOdd: boolean;
    };
    notUsed: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        storage: Storage;
        root: import("o1js/dist/node/lib/provable/field").Field;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        txsCount: UInt32;
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field;
    };
} & {
    fromValue: (value: {
        storage: Storage | {
            hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
        };
        root: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        txsHash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        txsCount: bigint | UInt32;
        blockAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        notUsed: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        storage: Storage;
        root: import("o1js/dist/node/lib/provable/field").Field;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        txsCount: UInt32;
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field;
    };
    toInput: (x: {
        storage: Storage;
        root: import("o1js/dist/node/lib/provable/field").Field;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        txsCount: UInt32;
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        storage: Storage;
        root: import("o1js/dist/node/lib/provable/field").Field;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        txsCount: UInt32;
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        storage: {
            hashString: string[];
        };
        root: string;
        txsHash: string;
        txsCount: string;
        blockAddress: string;
        notUsed: string;
    };
    fromJSON: (x: {
        storage: {
            hashString: string[];
        };
        root: string;
        txsHash: string;
        txsCount: string;
        blockAddress: string;
        notUsed: string;
    }) => {
        storage: Storage;
        root: import("o1js/dist/node/lib/provable/field").Field;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        txsCount: UInt32;
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field;
    };
    empty: () => {
        storage: Storage;
        root: import("o1js/dist/node/lib/provable/field").Field;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        txsCount: UInt32;
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field;
    };
};
export declare class BlockValidationData extends BlockValidationData_base {
}
declare const BadBlockValidationData_base: (new (value: {
    blockAddress: PublicKey;
    notUsed: import("o1js/dist/node/lib/provable/field").Field[];
}) => {
    blockAddress: PublicKey;
    notUsed: import("o1js/dist/node/lib/provable/field").Field[];
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    blockAddress: PublicKey;
    notUsed: import("o1js/dist/node/lib/provable/field").Field[];
}, {
    blockAddress: {
        x: bigint;
        isOdd: boolean;
    };
    notUsed: bigint[];
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field[];
    };
} & {
    fromValue: (value: {
        blockAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        notUsed: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
    }) => {
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    toInput: (x: {
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        blockAddress: string;
        notUsed: string[];
    };
    fromJSON: (x: {
        blockAddress: string;
        notUsed: string[];
    }) => {
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    empty: () => {
        blockAddress: PublicKey;
        notUsed: import("o1js/dist/node/lib/provable/field").Field[];
    };
};
export declare class BadBlockValidationData extends BadBlockValidationData_base {
}
declare const ChangeValidatorsData_base: (new (value: {
    new: ValidatorsState;
    old: ValidatorsState;
    storage: Storage;
}) => {
    new: ValidatorsState;
    old: ValidatorsState;
    storage: Storage;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    new: ValidatorsState;
    old: ValidatorsState;
    storage: Storage;
}, {
    new: {
        root: bigint;
        hash: bigint;
        count: bigint;
    };
    old: {
        root: bigint;
        hash: bigint;
        count: bigint;
    };
    storage: {
        hashString: bigint[];
    };
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        new: ValidatorsState;
        old: ValidatorsState;
        storage: Storage;
    };
} & {
    fromValue: (value: {
        new: ValidatorsState | {
            root: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            hash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            count: bigint | UInt32;
        };
        old: ValidatorsState | {
            root: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            hash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
            count: bigint | UInt32;
        };
        storage: Storage | {
            hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
        };
    }) => {
        new: ValidatorsState;
        old: ValidatorsState;
        storage: Storage;
    };
    toInput: (x: {
        new: ValidatorsState;
        old: ValidatorsState;
        storage: Storage;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        new: ValidatorsState;
        old: ValidatorsState;
        storage: Storage;
    }) => {
        new: {
            root: string;
            hash: string;
            count: string;
        };
        old: {
            root: string;
            hash: string;
            count: string;
        };
        storage: {
            hashString: string[];
        };
    };
    fromJSON: (x: {
        new: {
            root: string;
            hash: string;
            count: string;
        };
        old: {
            root: string;
            hash: string;
            count: string;
        };
        storage: {
            hashString: string[];
        };
    }) => {
        new: ValidatorsState;
        old: ValidatorsState;
        storage: Storage;
    };
    empty: () => {
        new: ValidatorsState;
        old: ValidatorsState;
        storage: Storage;
    };
};
export declare class ChangeValidatorsData extends ChangeValidatorsData_base {
}
declare const BlockData_base: (new (value: {
    blockNumber: UInt64;
    root: import("o1js/dist/node/lib/provable/field").Field;
    storage: Storage;
    previousBlockAddress: PublicKey;
    txsHash: import("o1js/dist/node/lib/provable/field").Field;
    blockParams: import("o1js/dist/node/lib/provable/field").Field;
    blockAddress: PublicKey;
}) => {
    blockNumber: UInt64;
    root: import("o1js/dist/node/lib/provable/field").Field;
    storage: Storage;
    previousBlockAddress: PublicKey;
    txsHash: import("o1js/dist/node/lib/provable/field").Field;
    blockParams: import("o1js/dist/node/lib/provable/field").Field;
    blockAddress: PublicKey;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    blockNumber: UInt64;
    root: import("o1js/dist/node/lib/provable/field").Field;
    storage: Storage;
    previousBlockAddress: PublicKey;
    txsHash: import("o1js/dist/node/lib/provable/field").Field;
    blockParams: import("o1js/dist/node/lib/provable/field").Field;
    blockAddress: PublicKey;
}, {
    blockNumber: bigint;
    root: bigint;
    storage: {
        hashString: bigint[];
    };
    previousBlockAddress: {
        x: bigint;
        isOdd: boolean;
    };
    txsHash: bigint;
    blockParams: bigint;
    blockAddress: {
        x: bigint;
        isOdd: boolean;
    };
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        blockNumber: UInt64;
        root: import("o1js/dist/node/lib/provable/field").Field;
        storage: Storage;
        previousBlockAddress: PublicKey;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        blockParams: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
    };
} & {
    fromValue: (value: {
        blockNumber: bigint | UInt64;
        root: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        storage: Storage | {
            hashString: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
        };
        previousBlockAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        txsHash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        blockParams: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
    }) => {
        blockNumber: UInt64;
        root: import("o1js/dist/node/lib/provable/field").Field;
        storage: Storage;
        previousBlockAddress: PublicKey;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        blockParams: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
    };
    toInput: (x: {
        blockNumber: UInt64;
        root: import("o1js/dist/node/lib/provable/field").Field;
        storage: Storage;
        previousBlockAddress: PublicKey;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        blockParams: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        blockNumber: UInt64;
        root: import("o1js/dist/node/lib/provable/field").Field;
        storage: Storage;
        previousBlockAddress: PublicKey;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        blockParams: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
    }) => {
        blockNumber: string;
        root: string;
        storage: {
            hashString: string[];
        };
        previousBlockAddress: string;
        txsHash: string;
        blockParams: string;
        blockAddress: string;
    };
    fromJSON: (x: {
        blockNumber: string;
        root: string;
        storage: {
            hashString: string[];
        };
        previousBlockAddress: string;
        txsHash: string;
        blockParams: string;
        blockAddress: string;
    }) => {
        blockNumber: UInt64;
        root: import("o1js/dist/node/lib/provable/field").Field;
        storage: Storage;
        previousBlockAddress: PublicKey;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        blockParams: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
    };
    empty: () => {
        blockNumber: UInt64;
        root: import("o1js/dist/node/lib/provable/field").Field;
        storage: Storage;
        previousBlockAddress: PublicKey;
        txsHash: import("o1js/dist/node/lib/provable/field").Field;
        blockParams: import("o1js/dist/node/lib/provable/field").Field;
        blockAddress: PublicKey;
    };
};
export declare class BlockData extends BlockData_base {
    toState(): Field[];
}
declare const LastBlockPacked_base: (new (value: {
    x: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}) => {
    x: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    x: import("o1js/dist/node/lib/provable/field").Field;
    data: import("o1js/dist/node/lib/provable/field").Field;
}, {
    x: bigint;
    data: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        x: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
} & {
    fromValue: (value: {
        x: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        data: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        x: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
    toInput: (x: {
        x: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        x: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        x: string;
        data: string;
    };
    fromJSON: (x: {
        x: string;
        data: string;
    }) => {
        x: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
    empty: () => {
        x: import("o1js/dist/node/lib/provable/field").Field;
        data: import("o1js/dist/node/lib/provable/field").Field;
    };
};
export declare class LastBlockPacked extends LastBlockPacked_base {
}
declare const LastBlock_base: (new (value: {
    address: PublicKey;
    blockNumber: UInt64;
}) => {
    address: PublicKey;
    blockNumber: UInt64;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    address: PublicKey;
    blockNumber: UInt64;
}, {
    address: {
        x: bigint;
        isOdd: boolean;
    };
    blockNumber: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        address: PublicKey;
        blockNumber: UInt64;
    };
} & {
    fromValue: (value: {
        address: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        };
        blockNumber: bigint | UInt64;
    }) => {
        address: PublicKey;
        blockNumber: UInt64;
    };
    toInput: (x: {
        address: PublicKey;
        blockNumber: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        address: PublicKey;
        blockNumber: UInt64;
    }) => {
        address: string;
        blockNumber: string;
    };
    fromJSON: (x: {
        address: string;
        blockNumber: string;
    }) => {
        address: PublicKey;
        blockNumber: UInt64;
    };
    empty: () => {
        address: PublicKey;
        blockNumber: UInt64;
    };
};
export declare class LastBlock extends LastBlock_base {
    pack(): LastBlockPacked;
    static unpack(packed: LastBlockPacked): LastBlock;
}
export declare class BlockContract extends SmartContract {
    blockNumber: State<UInt64>;
    root: State<import("o1js/dist/node/lib/provable/field").Field>;
    storage: State<Storage>;
    previousBlock: State<PublicKey>;
    txsHash: State<import("o1js/dist/node/lib/provable/field").Field>;
    blockParams: State<import("o1js/dist/node/lib/provable/field").Field>;
    deploy(args: DeployArgs): Promise<void>;
    validateBlock(data: BlockValidationData, tokenId: Field): Promise<UInt64>;
    badBlock(tokenId: Field): Promise<void>;
    proveBlock(data: MapTransition, tokenId: Field): Promise<UInt64>;
}
export declare class RollupContract extends TokenContract {
    domain: State<import("o1js/dist/node/lib/provable/field").Field>;
    validatorsPacked: State<import("o1js/dist/node/lib/provable/field").Field>;
    lastCreatedBlock: State<LastBlockPacked>;
    lastValidatedBlock: State<LastBlockPacked>;
    lastProvedBlock: State<LastBlockPacked>;
    deploy(args: DeployArgs): Promise<void>;
    init(): void;
    approveBase(forest: AccountUpdateForest): Promise<void>;
    events: {
        newBlock: typeof BlockData;
        validatedBlock: typeof PublicKey;
        provedBlock: typeof PublicKey;
        setValidators: typeof ChangeValidatorsData;
    };
    block(proof: ValidatorsVotingProof, data: BlockData, verificationKey: VerificationKey): Promise<void>;
    blockZero(publicKey: PublicKey, timeCreated: UInt64): Promise<void>;
    validateBlock(proof: ValidatorsVotingProof): Promise<void>;
    proveBlock(proof: MapUpdateProof, blockAddress: PublicKey): Promise<void>;
    proveBlockProofsOff(transition: MapTransition, blockAddress: PublicKey): Promise<void>;
    private internalProveBlock;
    badBlock(proof: ValidatorsVotingProof): Promise<void>;
    setValidators(proof: ValidatorsVotingProof): Promise<void>;
    checkValidatorsDecision(proof: ValidatorsVotingProof): void;
}
export {};
