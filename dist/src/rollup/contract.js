"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupContract = exports.BlockContract = exports.LastBlock = exports.LastBlockPacked = exports.BlockData = exports.ChangeValidatorsData = exports.BadBlockValidationData = exports.BlockValidationData = exports.BlockCreationData = exports.ValidatorsVotingProof = exports.ValidatorsVoting = exports.ValidatorsDecisionState = exports.ValidatorsDecision = exports.ValidatorWitness = exports.MapUpdateProof = exports.MapUpdate = exports.MapTransition = exports.MapUpdateData = exports.DomainTransactionData = exports.DomainTransaction = exports.DomainTransactionEnum = exports.RollupNftName = exports.RollupNftNameValue = exports.BlockParams = exports.Metadata = exports.Storage = exports.ValidatorsState = exports.ValidatorDecisionType = void 0;
const o1js_1 = require("o1js");
const zkcloudworker_1 = require("zkcloudworker");
exports.ValidatorDecisionType = {
    validate: (0, o1js_1.Field)(1),
    badBlock: (0, o1js_1.Field)(2),
    createBlock: (0, o1js_1.Field)(3),
    setValidators: (0, o1js_1.Field)(4),
};
class ValidatorsState extends (0, o1js_1.Struct)({
    root: o1js_1.Field,
    hash: o1js_1.Field,
    count: o1js_1.UInt32,
}) {
    static assertEquals(a, b) {
        a.root.assertEquals(b.root);
        a.hash.assertEquals(b.hash);
        a.count.assertEquals(b.count);
    }
    pack() {
        return o1js_1.Poseidon.hash([this.root, this.hash, this.count.value]);
    }
}
exports.ValidatorsState = ValidatorsState;
/**
 * Storage is the hash of the IPFS or Arweave storage where the metadata is written
 * format of the IPFS hash string: i:...
 * format of the Arweave hash string: a:...
 * @property hashString The hash string of the storage
 */
class Storage extends (0, o1js_1.Struct)({
    hashString: o1js_1.Provable.Array(o1js_1.Field, 2),
}) {
    constructor(value) {
        super(value);
    }
    static empty() {
        return new Storage({ hashString: [(0, o1js_1.Field)(0), (0, o1js_1.Field)(0)] });
    }
    static assertEquals(a, b) {
        a.hashString[0].assertEquals(b.hashString[0]);
        a.hashString[1].assertEquals(b.hashString[1]);
    }
    static equals(a, b) {
        return a.hashString[0]
            .equals(b.hashString[0])
            .and(a.hashString[1].equals(b.hashString[1]));
    }
    static fromIpfsHash(hash) {
        const fields = o1js_1.Encoding.stringToFields("i:" + hash);
        if (fields.length !== 2)
            throw new Error("Invalid IPFS hash");
        return new Storage({ hashString: [fields[0], fields[1]] });
    }
    toIpfsHash() {
        const hash = o1js_1.Encoding.stringFromFields(this.hashString);
        if (hash.startsWith("i:")) {
            return hash.substring(2);
        }
        else
            throw new Error("Invalid IPFS hash");
    }
}
exports.Storage = Storage;
class Metadata extends (0, o1js_1.Struct)({
    data: o1js_1.Field,
    kind: o1js_1.Field,
}) {
    /**
     * Asserts that two Metadata objects are equal
     * @param state1 first Metadata object
     * @param state2 second Metadata object
     */
    static assertEquals(state1, state2) {
        state1.data.assertEquals(state2.data);
        state1.kind.assertEquals(state2.kind);
    }
    static equals(state1, state2) {
        return state1.data.equals(state2.data).and(state1.kind.equals(state2.kind));
    }
}
exports.Metadata = Metadata;
class BlockParams extends (0, o1js_1.Struct)({
    txsCount: o1js_1.UInt32,
    timeCreated: o1js_1.UInt64,
    isValidated: o1js_1.Bool,
    isFinal: o1js_1.Bool,
    isProved: o1js_1.Bool,
    isInvalid: o1js_1.Bool,
}) {
    pack() {
        const txsCount = this.txsCount.value.toBits(32);
        const timeCreated = this.timeCreated.value.toBits(64);
        return o1js_1.Field.fromBits([
            ...txsCount,
            ...timeCreated,
            this.isValidated,
            this.isFinal,
            this.isProved,
            this.isInvalid,
        ]);
    }
    static unpack(packed) {
        const bits = packed.toBits(32 + 64 + 4);
        const txsCount = o1js_1.UInt32.from(0);
        const timeCreated = o1js_1.UInt64.from(0);
        txsCount.value = o1js_1.Field.fromBits(bits.slice(0, 32));
        timeCreated.value = o1js_1.Field.fromBits(bits.slice(32, 96));
        return new BlockParams({
            txsCount,
            timeCreated,
            isValidated: bits[96],
            isFinal: bits[97],
            isProved: bits[98],
            isInvalid: bits[99],
        });
    }
}
exports.BlockParams = BlockParams;
class RollupNftNameValue extends (0, o1js_1.Struct)({
    address: o1js_1.PublicKey,
    metadata: Metadata,
    storage: Storage,
    expiry: o1js_1.UInt64,
}) {
    hash() {
        return o1js_1.Poseidon.hashPacked(RollupNftNameValue, this);
    }
    static empty() {
        return new RollupNftNameValue({
            address: o1js_1.PublicKey.empty(),
            metadata: new Metadata({ data: (0, o1js_1.Field)(0), kind: (0, o1js_1.Field)(0) }),
            storage: new Storage({ hashString: [(0, o1js_1.Field)(0), (0, o1js_1.Field)(0)] }),
            expiry: o1js_1.UInt64.from(0),
        });
    }
}
exports.RollupNftNameValue = RollupNftNameValue;
class RollupNftName extends (0, o1js_1.Struct)({
    name: o1js_1.Field,
    data: RollupNftNameValue,
}) {
    static empty() {
        return new RollupNftName({
            name: (0, o1js_1.Field)(0),
            data: RollupNftNameValue.empty(),
        });
    }
    isEmpty() {
        return this.data.expiry.equals(o1js_1.UInt64.from(0));
    }
    value() {
        return this.data.hash();
    }
    key() {
        return this.name;
    }
    hash() {
        return o1js_1.Poseidon.hashPacked(RollupNftName, this);
    }
}
exports.RollupNftName = RollupNftName;
exports.DomainTransactionEnum = {
    add: o1js_1.UInt8.from(1),
    extend: o1js_1.UInt8.from(2),
    update: o1js_1.UInt8.from(3),
    remove: o1js_1.UInt8.from(4),
};
class DomainTransaction extends (0, o1js_1.Struct)({
    type: o1js_1.UInt8,
    domain: RollupNftName,
}) {
    hash() {
        return o1js_1.Poseidon.hashPacked(DomainTransaction, this);
    }
}
exports.DomainTransaction = DomainTransaction;
class DomainTransactionData {
    constructor(tx, oldDomain, signature) {
        this.tx = tx;
        this.oldDomain = oldDomain;
        this.signature = signature;
        this.tx = tx;
        this.oldDomain = oldDomain;
        this.signature = signature;
    }
    txType() {
        return ["add", "extend", "update", "remove"][this.tx.type.toNumber() - 1];
    }
    toJSON() {
        this.validate();
        return {
            tx: (0, zkcloudworker_1.serializeFields)(DomainTransaction.toFields(this.tx)),
            oldDomain: this.oldDomain
                ? (0, zkcloudworker_1.serializeFields)(RollupNftName.toFields(this.oldDomain))
                : undefined,
            signature: this.signature?.toBase58(),
        };
    }
    static fromJSON(data) {
        const tx = new DomainTransaction(DomainTransaction.fromFields((0, zkcloudworker_1.deserializeFields)(data.tx)));
        const oldDomain = data.oldDomain
            ? new RollupNftName(RollupNftName.fromFields((0, zkcloudworker_1.deserializeFields)(data.oldDomain)))
            : undefined;
        const signature = data.signature
            ? o1js_1.Signature.fromBase58(data.signature)
            : undefined;
        const domain = new DomainTransactionData(tx, oldDomain, signature);
        domain.validate();
        return domain;
    }
    validate() {
        const txType = this.txType();
        if (!this.oldDomain) {
            if (txType === "update" || txType === "extend")
                throw new Error("oldDomain is required for update and extend transaction");
        }
        if (!this.signature) {
            if (txType === "update")
                throw new Error("signature is required for update transaction");
        }
    }
}
exports.DomainTransactionData = DomainTransactionData;
class MapUpdateData extends (0, o1js_1.Struct)({
    oldRoot: o1js_1.Field,
    newRoot: o1js_1.Field,
    time: o1js_1.UInt64, // unix time when the map was updated
    tx: DomainTransaction,
    witness: o1js_1.MerkleMapWitness,
}) {
}
exports.MapUpdateData = MapUpdateData;
class MapTransition extends (0, o1js_1.Struct)({
    oldRoot: o1js_1.Field,
    newRoot: o1js_1.Field,
    time: o1js_1.UInt64, // unix time when the map was updated
    hash: o1js_1.Field, // sum of hashes of all the new keys and values of the Map
    count: o1js_1.UInt32, // number of new keys in the Map
}) {
    // TODO: addNew, replaceExpired, extend, change
    static add(update) {
        update.tx.type.assertEquals(exports.DomainTransactionEnum.add);
        const key = update.tx.domain.name;
        const value = update.tx.domain.data.hash();
        const [rootBefore, keyBefore] = update.witness.computeRootAndKey((0, o1js_1.Field)(0));
        update.oldRoot.assertEquals(rootBefore);
        key.assertEquals(keyBefore);
        const [rootAfter, keyAfter] = update.witness.computeRootAndKey(value);
        update.newRoot.assertEquals(rootAfter);
        key.assertEquals(keyAfter);
        const hash = update.tx.hash();
        return new MapTransition({
            oldRoot: update.oldRoot,
            newRoot: update.newRoot,
            hash,
            count: o1js_1.UInt32.from(1),
            time: update.time,
        });
    }
    static update(update, oldDomain, signature) {
        update.tx.type.assertEquals(exports.DomainTransactionEnum.update);
        const key = update.tx.domain.name;
        key.assertEquals(oldDomain.name);
        const value = update.tx.domain.data.hash();
        const oldValue = oldDomain.data.hash();
        const [rootBefore, keyBefore] = update.witness.computeRootAndKey(oldValue);
        update.oldRoot.assertEquals(rootBefore);
        key.assertEquals(keyBefore);
        const [rootAfter, keyAfter] = update.witness.computeRootAndKey(value);
        update.newRoot.assertEquals(rootAfter);
        key.assertEquals(keyAfter);
        signature.verify(oldDomain.data.address, DomainTransaction.toFields(update.tx));
        const hash = update.tx.hash();
        return new MapTransition({
            oldRoot: update.oldRoot,
            newRoot: update.newRoot,
            hash,
            count: o1js_1.UInt32.from(1),
            time: update.time,
        });
    }
    static extend(update, oldDomain) {
        update.tx.domain.data.address.assertEquals(oldDomain.data.address);
        Metadata.assertEquals(update.tx.domain.data.metadata, oldDomain.data.metadata);
        Storage.assertEquals(update.tx.domain.data.storage, oldDomain.data.storage);
        update.tx.domain.data.expiry.assertGreaterThan(oldDomain.data.expiry);
        update.tx.type.assertEquals(exports.DomainTransactionEnum.extend);
        const key = update.tx.domain.name;
        key.assertEquals(oldDomain.name);
        const value = update.tx.domain.data.hash();
        const oldValue = oldDomain.data.hash();
        const [rootBefore, keyBefore] = update.witness.computeRootAndKey(oldValue);
        update.oldRoot.assertEquals(rootBefore);
        key.assertEquals(keyBefore);
        const [rootAfter, keyAfter] = update.witness.computeRootAndKey(value);
        update.newRoot.assertEquals(rootAfter);
        key.assertEquals(keyAfter);
        const hash = update.tx.hash();
        return new MapTransition({
            oldRoot: update.oldRoot,
            newRoot: update.newRoot,
            hash,
            count: o1js_1.UInt32.from(1),
            time: update.time,
        });
    }
    static remove(update) {
        update.tx.type.assertEquals(exports.DomainTransactionEnum.remove);
        update.tx.domain.data.expiry.assertLessThanOrEqual(update.time);
        const key = update.tx.domain.name;
        const value = update.tx.domain.data.hash();
        const [rootBefore, keyBefore] = update.witness.computeRootAndKey(value);
        update.oldRoot.assertEquals(rootBefore);
        key.assertEquals(keyBefore);
        const [rootAfter, keyAfter] = update.witness.computeRootAndKey((0, o1js_1.Field)(0));
        update.newRoot.assertEquals(rootAfter);
        key.assertEquals(keyAfter);
        const hash = update.tx.hash();
        return new MapTransition({
            oldRoot: update.oldRoot,
            newRoot: update.newRoot,
            hash,
            count: o1js_1.UInt32.from(1),
            time: update.time,
        });
    }
    // Incorrect or unpaid txs are being rejected
    static reject(root, time, domain) {
        const hash = domain.hash();
        return new MapTransition({
            oldRoot: root,
            newRoot: root,
            hash,
            count: o1js_1.UInt32.from(1),
            time,
        });
    }
    static merge(transition1, transition2) {
        transition1.newRoot.assertEquals(transition2.oldRoot);
        transition1.time.assertEquals(transition2.time);
        return new MapTransition({
            oldRoot: transition1.oldRoot,
            newRoot: transition2.newRoot,
            hash: transition1.hash.add(transition2.hash),
            count: transition1.count.add(transition2.count),
            time: transition1.time,
        });
    }
    static assertEquals(transition1, transition2) {
        transition1.oldRoot.assertEquals(transition2.oldRoot);
        transition1.newRoot.assertEquals(transition2.newRoot);
        transition1.hash.assertEquals(transition2.hash);
        transition1.count.assertEquals(transition2.count);
        transition1.time.assertEquals(transition2.time);
    }
}
exports.MapTransition = MapTransition;
exports.MapUpdate = (0, o1js_1.ZkProgram)({
    name: "MapUpdate",
    publicInput: MapTransition,
    overrideWrapDomain: 2,
    methods: {
        add: {
            privateInputs: [MapUpdateData],
            async method(state, update) {
                //Provable.log("MapUpdate.add state.hash:", state.hash);
                const computedState = MapTransition.add(update);
                MapTransition.assertEquals(computedState, state);
            },
        },
        update: {
            privateInputs: [MapUpdateData, RollupNftName, o1js_1.Signature],
            async method(state, update, oldDomain, signature) {
                const computedState = MapTransition.update(update, oldDomain, signature);
                MapTransition.assertEquals(computedState, state);
            },
        },
        extend: {
            privateInputs: [MapUpdateData, RollupNftName],
            async method(state, update, oldDomain) {
                const computedState = MapTransition.extend(update, oldDomain);
                MapTransition.assertEquals(computedState, state);
            },
        },
        remove: {
            privateInputs: [MapUpdateData],
            async method(state, update) {
                const computedState = MapTransition.remove(update);
                MapTransition.assertEquals(computedState, state);
            },
        },
        reject: {
            privateInputs: [o1js_1.Field, o1js_1.UInt64, DomainTransaction],
            async method(state, root, time, domain) {
                const computedState = MapTransition.reject(root, time, domain);
                MapTransition.assertEquals(computedState, state);
            },
        },
        merge: {
            privateInputs: [o1js_1.SelfProof, o1js_1.SelfProof],
            async method(newState, proof1, proof2) {
                proof1.verify();
                proof2.verify();
                const computedState = MapTransition.merge(proof1.publicInput, proof2.publicInput);
                MapTransition.assertEquals(computedState, newState);
            },
        },
    },
});
class MapUpdateProof extends o1js_1.ZkProgram.Proof(exports.MapUpdate) {
}
exports.MapUpdateProof = MapUpdateProof;
class ValidatorWitness extends (0, o1js_1.MerkleWitness)(3) {
}
exports.ValidatorWitness = ValidatorWitness;
class ValidatorsDecision extends (0, o1js_1.Struct)({
    contractAddress: o1js_1.PublicKey,
    chainId: o1js_1.Field, // chain id
    validators: ValidatorsState,
    decisionType: o1js_1.Field,
    expiry: o1js_1.UInt64, // Unix time when decision expires
    data: o1js_1.Provable.Array(o1js_1.Field, 8),
}) {
    static assertEquals(a, b) {
        a.contractAddress.assertEquals(b.contractAddress);
        a.chainId.assertEquals(b.chainId);
        ValidatorsState.assertEquals(a.validators, b.validators);
        a.decisionType.assertEquals(b.decisionType);
        a.expiry.assertEquals(b.expiry);
        a.data[0].assertEquals(b.data[0]);
        a.data[1].assertEquals(b.data[1]);
        a.data[2].assertEquals(b.data[2]);
        a.data[3].assertEquals(b.data[3]);
        a.data[4].assertEquals(b.data[4]);
        a.data[5].assertEquals(b.data[5]);
        a.data[6].assertEquals(b.data[6]);
        a.data[7].assertEquals(b.data[7]);
    }
}
exports.ValidatorsDecision = ValidatorsDecision;
class ValidatorsDecisionState extends (0, o1js_1.Struct)({
    decision: ValidatorsDecision,
    hash: o1js_1.Field,
    count: o1js_1.UInt32,
}) {
    static vote(decision, validatorAddress, witness, signature) {
        const hash = o1js_1.Poseidon.hashPacked(o1js_1.PublicKey, validatorAddress);
        signature
            .verify(validatorAddress, ValidatorsDecision.toFields(decision))
            .assertTrue("Wrong validator signature");
        const root = witness.calculateRoot(hash);
        decision.validators.root.assertEquals(root);
        return new ValidatorsDecisionState({
            decision,
            count: o1js_1.UInt32.from(1),
            hash,
        });
    }
    static abstain(decision, validatorAddress, witness) {
        const hash = o1js_1.Poseidon.hashPacked(o1js_1.PublicKey, validatorAddress);
        const root = witness.calculateRoot(hash);
        decision.validators.root.assertEquals(root);
        return new ValidatorsDecisionState({
            decision,
            count: o1js_1.UInt32.from(1),
            hash,
        });
    }
    static merge(state1, state2) {
        ValidatorsDecision.assertEquals(state1.decision, state2.decision);
        return new ValidatorsDecisionState({
            decision: state1.decision,
            count: state1.count.add(state2.count),
            hash: state1.hash.add(state2.hash),
        });
    }
    static assertEquals(a, b) {
        ValidatorsDecision.assertEquals(a.decision, b.decision);
        a.count.assertEquals(b.count);
        a.hash.assertEquals(b.hash);
    }
}
exports.ValidatorsDecisionState = ValidatorsDecisionState;
exports.ValidatorsVoting = (0, o1js_1.ZkProgram)({
    name: "ValidatorsVoting",
    publicInput: ValidatorsDecisionState,
    methods: {
        vote: {
            privateInputs: [
                ValidatorsDecision,
                o1js_1.PublicKey,
                ValidatorWitness,
                o1js_1.Signature,
            ],
            async method(state, decision, validatorAddress, witness, signature) {
                const calculatedState = ValidatorsDecisionState.vote(decision, validatorAddress, witness, signature);
                ValidatorsDecisionState.assertEquals(state, calculatedState);
            },
        },
        abstain: {
            privateInputs: [ValidatorsDecision, o1js_1.PublicKey, ValidatorWitness],
            async method(state, decision, validatorAddress, witness) {
                const calculatedState = ValidatorsDecisionState.abstain(decision, validatorAddress, witness);
                ValidatorsDecisionState.assertEquals(state, calculatedState);
            },
        },
        merge: {
            privateInputs: [o1js_1.SelfProof, o1js_1.SelfProof],
            async method(state, proof1, proof2) {
                proof1.verify();
                proof2.verify();
                const calculatedState = ValidatorsDecisionState.merge(proof1.publicInput, proof2.publicInput);
                ValidatorsDecisionState.assertEquals(state, calculatedState);
            },
        },
    },
});
class ValidatorsVotingProof extends o1js_1.ZkProgram.Proof(exports.ValidatorsVoting) {
}
exports.ValidatorsVotingProof = ValidatorsVotingProof;
class BlockCreationData extends (0, o1js_1.Struct)({
    oldRoot: o1js_1.Field,
    verificationKeyHash: o1js_1.Field,
    blockAddress: o1js_1.PublicKey,
    blockProducer: o1js_1.PublicKey,
    previousBlockAddress: o1js_1.PublicKey,
}) {
}
exports.BlockCreationData = BlockCreationData;
class BlockValidationData extends (0, o1js_1.Struct)({
    storage: Storage,
    root: o1js_1.Field,
    txsHash: o1js_1.Field,
    txsCount: o1js_1.UInt32,
    blockAddress: o1js_1.PublicKey,
    notUsed: o1js_1.Field,
}) {
}
exports.BlockValidationData = BlockValidationData;
class BadBlockValidationData extends (0, o1js_1.Struct)({
    blockAddress: o1js_1.PublicKey,
    notUsed: o1js_1.Provable.Array(o1js_1.Field, 6),
}) {
}
exports.BadBlockValidationData = BadBlockValidationData;
class ChangeValidatorsData extends (0, o1js_1.Struct)({
    new: ValidatorsState,
    old: ValidatorsState,
    storage: Storage,
}) {
}
exports.ChangeValidatorsData = ChangeValidatorsData;
class BlockData extends (0, o1js_1.Struct)({
    blockNumber: o1js_1.UInt64,
    root: o1js_1.Field,
    storage: Storage,
    previousBlockAddress: o1js_1.PublicKey,
    txsHash: o1js_1.Field,
    blockParams: o1js_1.Field,
    blockAddress: o1js_1.PublicKey,
}) {
    toState() {
        return [
            this.blockNumber.value,
            this.root,
            ...this.storage.hashString,
            ...this.previousBlockAddress.toFields(),
            this.txsHash,
            this.blockParams,
        ];
    }
}
exports.BlockData = BlockData;
class LastBlockPacked extends (0, o1js_1.Struct)({
    x: o1js_1.Field,
    data: o1js_1.Field,
}) {
}
exports.LastBlockPacked = LastBlockPacked;
class LastBlock extends (0, o1js_1.Struct)({
    address: o1js_1.PublicKey,
    blockNumber: o1js_1.UInt64,
}) {
    pack() {
        return new LastBlockPacked({
            x: this.address.x,
            data: o1js_1.Field.fromBits([
                ...this.blockNumber.value.toBits(64),
                this.address.isOdd,
            ]),
        });
    }
    static unpack(packed) {
        const bits = packed.data.toBits(64 + 1);
        const address = o1js_1.PublicKey.from({
            x: packed.x,
            isOdd: bits[64],
        });
        const blockNumber = o1js_1.UInt64.from(0);
        blockNumber.value = o1js_1.Field.fromBits(bits.slice(0, 64));
        return new LastBlock({
            address,
            blockNumber,
        });
    }
}
exports.LastBlock = LastBlock;
class BlockContract extends o1js_1.SmartContract {
    constructor() {
        super(...arguments);
        this.blockNumber = (0, o1js_1.State)();
        this.root = (0, o1js_1.State)();
        this.storage = (0, o1js_1.State)();
        this.previousBlock = (0, o1js_1.State)();
        this.txsHash = (0, o1js_1.State)();
        this.blockParams = (0, o1js_1.State)();
    }
    async deploy(args) {
        super.deploy(args);
        this.account.permissions.set({
            ...o1js_1.Permissions.default(),
            editState: o1js_1.Permissions.proof(),
        });
    }
    async validateBlock(data, tokenId) {
        const params = BlockParams.unpack(this.blockParams.getAndRequireEquals());
        params.isValidated.assertEquals((0, o1js_1.Bool)(false));
        params.isFinal.assertEquals((0, o1js_1.Bool)(false));
        params.isProved.assertEquals((0, o1js_1.Bool)(false));
        params.isInvalid.assertEquals((0, o1js_1.Bool)(false));
        params.txsCount.assertEquals(data.txsCount);
        Storage.assertEquals(data.storage, this.storage.getAndRequireEquals());
        data.txsHash.assertEquals(this.txsHash.getAndRequireEquals());
        data.root.assertEquals(this.root.getAndRequireEquals());
        const previousBlockContract = new BlockContract(this.previousBlock.getAndRequireEquals(), tokenId);
        // TODO: add error messages for all assertions
        // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
        const previousBlockParams = BlockParams.unpack(previousBlockContract.blockParams.get());
        previousBlockParams.isValidated
            .or(previousBlockParams.isFinal)
            .assertTrue();
        params.isValidated = (0, o1js_1.Bool)(true);
        this.blockParams.set(params.pack());
        return this.blockNumber.getAndRequireEquals();
    }
    async badBlock(tokenId) {
        const previousBlockContract = new BlockContract(this.previousBlock.getAndRequireEquals(), tokenId);
        const previousBlockParams = BlockParams.unpack(
        // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
        previousBlockContract.blockParams.get());
        previousBlockParams.isFinal.assertTrue();
        // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
        const root = previousBlockContract.root.get();
        const params = BlockParams.unpack(this.blockParams.getAndRequireEquals());
        params.isFinal.assertFalse();
        params.isValidated = (0, o1js_1.Bool)(false);
        params.isInvalid = (0, o1js_1.Bool)(true);
        params.isFinal = (0, o1js_1.Bool)(true);
        this.blockParams.set(params.pack());
        this.root.set(root);
    }
    async proveBlock(data, tokenId) {
        const params = BlockParams.unpack(this.blockParams.getAndRequireEquals());
        params.isFinal.assertFalse();
        params.isValidated.assertTrue(); // We need to make sure that IPFS data is available and correct
        const previousBlockContract = new BlockContract(this.previousBlock.getAndRequireEquals(), tokenId);
        const oldRoot = previousBlockContract.root.get(); // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
        oldRoot.assertEquals(data.oldRoot);
        data.newRoot.assertEquals(this.root.getAndRequireEquals());
        const previousBlockParams = BlockParams.unpack(
        // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
        previousBlockContract.blockParams.get());
        previousBlockParams.isFinal.assertTrue();
        data.hash.assertEquals(this.txsHash.getAndRequireEquals());
        data.count.assertEquals(params.txsCount);
        params.isProved = (0, o1js_1.Bool)(true);
        params.isFinal = (0, o1js_1.Bool)(true);
        this.blockParams.set(params.pack());
        return this.blockNumber.getAndRequireEquals();
    }
}
exports.BlockContract = BlockContract;
__decorate([
    (0, o1js_1.state)(o1js_1.UInt64),
    __metadata("design:type", Object)
], BlockContract.prototype, "blockNumber", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], BlockContract.prototype, "root", void 0);
__decorate([
    (0, o1js_1.state)(Storage),
    __metadata("design:type", Object)
], BlockContract.prototype, "storage", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.PublicKey),
    __metadata("design:type", Object)
], BlockContract.prototype, "previousBlock", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], BlockContract.prototype, "txsHash", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], BlockContract.prototype, "blockParams", void 0);
__decorate([
    o1js_1.method.returns(o1js_1.UInt64),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BlockValidationData, o1js_1.Field]),
    __metadata("design:returntype", Promise)
], BlockContract.prototype, "validateBlock", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [o1js_1.Field]),
    __metadata("design:returntype", Promise)
], BlockContract.prototype, "badBlock", null);
__decorate([
    o1js_1.method.returns(o1js_1.UInt64),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MapTransition, o1js_1.Field]),
    __metadata("design:returntype", Promise)
], BlockContract.prototype, "proveBlock", null);
class RollupContract extends o1js_1.TokenContract {
    constructor() {
        super(...arguments);
        this.domain = (0, o1js_1.State)();
        this.validatorsPacked = (0, o1js_1.State)();
        this.lastCreatedBlock = (0, o1js_1.State)();
        this.lastValidatedBlock = (0, o1js_1.State)();
        this.lastProvedBlock = (0, o1js_1.State)();
        this.events = {
            newBlock: BlockData,
            validatedBlock: o1js_1.PublicKey,
            provedBlock: o1js_1.PublicKey,
            setValidators: ChangeValidatorsData,
        };
    }
    async deploy(args) {
        super.deploy(args);
        this.account.permissions.set({
            ...o1js_1.Permissions.default(),
            editState: o1js_1.Permissions.proof(),
        });
    }
    init() {
        super.init();
        this.lastCreatedBlock.set(new LastBlock({
            address: o1js_1.PublicKey.empty(),
            blockNumber: o1js_1.UInt64.from(0),
        }).pack());
        this.lastValidatedBlock.set(new LastBlock({
            address: o1js_1.PublicKey.empty(),
            blockNumber: o1js_1.UInt64.from(0),
        }).pack());
        this.lastProvedBlock.set(new LastBlock({
            address: o1js_1.PublicKey.empty(),
            blockNumber: o1js_1.UInt64.from(0),
        }).pack());
    }
    async approveBase(forest) {
        // https://discord.com/channels/484437221055922177/1215258350577647616
        // this.checkZeroBalanceChange(forest);
        //forest.isEmpty().assertEquals(Bool(true));
        throw Error("transfers are not allowed");
    }
    async block(proof, data, verificationKey) {
        this.checkValidatorsDecision(proof);
        const tokenId = this.deriveTokenId();
        const blockProducer = this.sender.getAndRequireSignature();
        proof.publicInput.decision.decisionType.assertEquals(exports.ValidatorDecisionType.createBlock);
        const decision = BlockCreationData.fromFields(proof.publicInput.decision.data);
        decision.verificationKeyHash.assertEquals(verificationKey.hash);
        decision.blockAddress.assertEquals(data.blockAddress);
        decision.blockProducer.assertEquals(blockProducer);
        decision.previousBlockAddress.assertEquals(data.previousBlockAddress);
        const lastBlock = LastBlock.unpack(this.lastCreatedBlock.getAndRequireEquals());
        lastBlock.address.equals(o1js_1.PublicKey.empty()).assertFalse();
        data.previousBlockAddress.assertEquals(lastBlock.address);
        data.blockNumber.assertEquals(lastBlock.blockNumber.add(o1js_1.UInt64.from(1)));
        const previousBlock = new BlockContract(lastBlock.address, tokenId);
        const oldRoot = previousBlock.root.get(); // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
        decision.oldRoot.assertEquals(oldRoot);
        const blockNumber = previousBlock.blockNumber.get().add(o1js_1.UInt64.from(1));
        blockNumber.assertEquals(data.blockNumber);
        const previousBlockParams = BlockParams.unpack(previousBlock.blockParams.get());
        previousBlockParams.isValidated
            .or(previousBlockParams.isFinal)
            .assertTrue();
        const blockParams = BlockParams.unpack(data.blockParams);
        previousBlockParams.timeCreated.assertLessThan(blockParams.timeCreated);
        o1js_1.AccountUpdate.create(data.blockAddress, tokenId)
            .account.balance.getAndRequireEquals()
            .assertEquals(o1js_1.UInt64.from(0));
        this.internal.mint({
            address: data.blockAddress,
            amount: 1_000_000_000,
        });
        const update = o1js_1.AccountUpdate.createSigned(data.blockAddress, tokenId);
        update.body.update.verificationKey = {
            isSome: (0, o1js_1.Bool)(true),
            value: verificationKey,
        };
        update.body.update.permissions = {
            isSome: (0, o1js_1.Bool)(true),
            value: {
                ...o1js_1.Permissions.default(),
                editState: o1js_1.Permissions.proof(),
            },
        };
        const state = data.toState();
        update.body.update.appState = [
            { isSome: (0, o1js_1.Bool)(true), value: state[0] },
            { isSome: (0, o1js_1.Bool)(true), value: state[1] },
            { isSome: (0, o1js_1.Bool)(true), value: state[2] },
            { isSome: (0, o1js_1.Bool)(true), value: state[3] },
            { isSome: (0, o1js_1.Bool)(true), value: state[4] },
            { isSome: (0, o1js_1.Bool)(true), value: state[5] },
            { isSome: (0, o1js_1.Bool)(true), value: state[6] },
            { isSome: (0, o1js_1.Bool)(true), value: state[7] },
        ];
        this.emitEvent("newBlock", data);
        this.lastCreatedBlock.set(new LastBlock({
            address: data.blockAddress,
            blockNumber: data.blockNumber,
        }).pack());
    }
    async blockZero(publicKey, timeCreated) {
        // TODO: check timeCreated
        const lastBlock = LastBlock.unpack(this.lastCreatedBlock.getAndRequireEquals());
        lastBlock.address.equals(o1js_1.PublicKey.empty()).assertTrue();
        const tokenId = this.deriveTokenId();
        this.internal.mint({
            address: publicKey,
            amount: 1_000_000_000,
        });
        const update = o1js_1.AccountUpdate.createSigned(publicKey, tokenId);
        const data = new BlockData({
            blockNumber: o1js_1.UInt64.from(0),
            root: new o1js_1.MerkleMap().getRoot(),
            storage: Storage.empty(),
            previousBlockAddress: o1js_1.PublicKey.empty(),
            txsHash: (0, o1js_1.Field)(0),
            blockParams: new BlockParams({
                txsCount: o1js_1.UInt32.from(0),
                timeCreated,
                isValidated: (0, o1js_1.Bool)(true),
                isFinal: (0, o1js_1.Bool)(true),
                isProved: (0, o1js_1.Bool)(true),
                isInvalid: (0, o1js_1.Bool)(false),
            }).pack(),
            blockAddress: publicKey,
        });
        const state = data.toState();
        update.body.update.appState = [
            { isSome: (0, o1js_1.Bool)(true), value: state[0] },
            { isSome: (0, o1js_1.Bool)(true), value: state[1] },
            { isSome: (0, o1js_1.Bool)(true), value: state[2] },
            { isSome: (0, o1js_1.Bool)(true), value: state[3] },
            { isSome: (0, o1js_1.Bool)(true), value: state[4] },
            { isSome: (0, o1js_1.Bool)(true), value: state[5] },
            { isSome: (0, o1js_1.Bool)(true), value: state[6] },
            { isSome: (0, o1js_1.Bool)(true), value: state[7] },
        ];
        this.lastCreatedBlock.set(new LastBlock({
            address: publicKey,
            blockNumber: o1js_1.UInt64.from(0),
        }).pack());
        this.lastProvedBlock.set(new LastBlock({
            address: publicKey,
            blockNumber: o1js_1.UInt64.from(0),
        }).pack());
        this.lastValidatedBlock.set(new LastBlock({
            address: publicKey,
            blockNumber: o1js_1.UInt64.from(0),
        }).pack());
        this.emitEvent("newBlock", data);
    }
    async validateBlock(proof) {
        this.checkValidatorsDecision(proof);
        proof.publicInput.decision.decisionType.assertEquals(exports.ValidatorDecisionType.validate);
        const tokenId = this.deriveTokenId();
        const data = BlockValidationData.fromFields(proof.publicInput.decision.data);
        const block = new BlockContract(data.blockAddress, tokenId);
        const blockNumber = await block.validateBlock(data, tokenId);
        this.lastValidatedBlock.set(new LastBlock({ address: data.blockAddress, blockNumber }).pack());
        this.emitEvent("validatedBlock", data.blockAddress);
    }
    async proveBlock(proof, blockAddress) {
        proof.verify();
        await this.internalProveBlock(proof.publicInput, blockAddress);
    }
    // TODO: remove after testing
    async proveBlockProofsOff(transition, blockAddress) {
        await this.internalProveBlock(transition, blockAddress);
    }
    async internalProveBlock(transition, blockAddress) {
        // TODO: return back after o1js bug fix https://github.com/o1-labs/o1js/issues/1588
        // and use this.network.timestamp.requireBetween()
        //const timestamp = this.network.timestamp.getAndRequireEquals();
        //Provable.log("proveBlock time", timestamp);
        //timestamp.assertGreaterThan(proof.publicInput.time);
        const tokenId = this.deriveTokenId();
        const block = new BlockContract(blockAddress, tokenId);
        const blockNumber = await block.proveBlock(transition, tokenId);
        this.lastProvedBlock.set(new LastBlock({ address: blockAddress, blockNumber }).pack());
    }
    async badBlock(proof) {
        this.checkValidatorsDecision(proof);
        proof.publicInput.decision.decisionType.assertEquals(exports.ValidatorDecisionType.badBlock);
        const data = BadBlockValidationData.fromFields(proof.publicInput.decision.data);
        const tokenId = this.deriveTokenId();
        const block = new BlockContract(data.blockAddress, tokenId);
        await block.badBlock(tokenId);
    }
    async setValidators(proof) {
        this.checkValidatorsDecision(proof);
        proof.publicInput.decision.decisionType.assertEquals(exports.ValidatorDecisionType.setValidators);
        const old = this.validatorsPacked.getAndRequireEquals();
        const data = ChangeValidatorsData.fromFields(proof.publicInput.decision.data);
        data.old.pack().assertEquals(old);
        proof.publicInput.count.assertGreaterThan(data.old.count.mul(o1js_1.UInt32.from(2)));
        this.validatorsPacked.set(data.new.pack());
        this.emitEvent("setValidators", data);
    }
    checkValidatorsDecision(proof) {
        // see https://discord.com/channels/484437221055922177/1215291691364524072
        proof.publicInput.decision.chainId.assertEquals((0, zkcloudworker_1.getNetworkIdHash)());
        // TODO: return back after o1js bug fix https://github.com/o1-labs/o1js/issues/1588
        // and use this.network.timestamp.requireBetween()
        //const timestamp = this.network.timestamp.getAndRequireEquals();
        //timestamp.assertLessThan(proof.publicInput.decision.expiry);
        proof.verify();
        const validators = proof.publicInput.decision.validators;
        validators.pack().assertEquals(this.validatorsPacked.getAndRequireEquals());
        proof.publicInput.hash.assertEquals(validators.hash);
        proof.publicInput.count.assertGreaterThan(validators.count);
        proof.publicInput.decision.contractAddress.assertEquals(this.address);
    }
}
exports.RollupContract = RollupContract;
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], RollupContract.prototype, "domain", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], RollupContract.prototype, "validatorsPacked", void 0);
__decorate([
    (0, o1js_1.state)(LastBlockPacked),
    __metadata("design:type", Object)
], RollupContract.prototype, "lastCreatedBlock", void 0);
__decorate([
    (0, o1js_1.state)(LastBlockPacked),
    __metadata("design:type", Object)
], RollupContract.prototype, "lastValidatedBlock", void 0);
__decorate([
    (0, o1js_1.state)(LastBlockPacked),
    __metadata("design:type", Object)
], RollupContract.prototype, "lastProvedBlock", void 0);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ValidatorsVotingProof,
        BlockData,
        o1js_1.VerificationKey]),
    __metadata("design:returntype", Promise)
], RollupContract.prototype, "block", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [o1js_1.PublicKey, o1js_1.UInt64]),
    __metadata("design:returntype", Promise)
], RollupContract.prototype, "blockZero", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ValidatorsVotingProof]),
    __metadata("design:returntype", Promise)
], RollupContract.prototype, "validateBlock", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MapUpdateProof, o1js_1.PublicKey]),
    __metadata("design:returntype", Promise)
], RollupContract.prototype, "proveBlock", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MapTransition,
        o1js_1.PublicKey]),
    __metadata("design:returntype", Promise)
], RollupContract.prototype, "proveBlockProofsOff", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ValidatorsVotingProof]),
    __metadata("design:returntype", Promise)
], RollupContract.prototype, "badBlock", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ValidatorsVotingProof]),
    __metadata("design:returntype", Promise)
], RollupContract.prototype, "setValidators", null);
