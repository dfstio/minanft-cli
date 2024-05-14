import {
  Field,
  state,
  State,
  method,
  SmartContract,
  DeployArgs,
  Permissions,
  Struct,
  PublicKey,
  Bool,
  TokenContract,
  AccountUpdateForest,
  UInt64,
  AccountUpdate,
  VerificationKey,
  MerkleMap,
  UInt32,
  Provable,
  Poseidon,
  Encoding,
  ZkProgram,
  MerkleWitness,
  SelfProof,
  UInt8,
  Signature,
  MerkleMapWitness,
} from "o1js";

import {
  getNetworkIdHash,
  serializeFields,
  deserializeFields,
} from "zkcloudworker";

export const ValidatorDecisionType = {
  validate: Field(1),
  badBlock: Field(2),
  createBlock: Field(3),
  setValidators: Field(4),
};

export class ValidatorsState extends Struct({
  root: Field,
  hash: Field,
  count: UInt32,
}) {
  static assertEquals(a: ValidatorsState, b: ValidatorsState) {
    a.root.assertEquals(b.root);
    a.hash.assertEquals(b.hash);
    a.count.assertEquals(b.count);
  }

  pack(): Field {
    return Poseidon.hash([this.root, this.hash, this.count.value]);
  }
}

/**
 * Storage is the hash of the IPFS or Arweave storage where the metadata is written
 * format of the IPFS hash string: i:...
 * format of the Arweave hash string: a:...
 * @property hashString The hash string of the storage
 */
export class Storage extends Struct({
  hashString: Provable.Array(Field, 2),
}) {
  constructor(value: { hashString: [Field, Field] }) {
    super(value);
  }

  static empty(): Storage {
    return new Storage({ hashString: [Field(0), Field(0)] });
  }

  static assertEquals(a: Storage, b: Storage) {
    a.hashString[0].assertEquals(b.hashString[0]);
    a.hashString[1].assertEquals(b.hashString[1]);
  }

  static equals(a: Storage, b: Storage): Bool {
    return a.hashString[0]
      .equals(b.hashString[0])
      .and(a.hashString[1].equals(b.hashString[1]));
  }

  static fromIpfsHash(hash: string): Storage {
    const fields = Encoding.stringToFields("i:" + hash);
    if (fields.length !== 2) throw new Error("Invalid IPFS hash");
    return new Storage({ hashString: [fields[0], fields[1]] });
  }

  toIpfsHash(): string {
    const hash = Encoding.stringFromFields(this.hashString);
    if (hash.startsWith("i:")) {
      return hash.substring(2);
    } else throw new Error("Invalid IPFS hash");
  }
}

export class Metadata extends Struct({
  data: Field,
  kind: Field,
}) {
  /**
   * Asserts that two Metadata objects are equal
   * @param state1 first Metadata object
   * @param state2 second Metadata object
   */
  static assertEquals(state1: Metadata, state2: Metadata) {
    state1.data.assertEquals(state2.data);
    state1.kind.assertEquals(state2.kind);
  }

  static equals(state1: Metadata, state2: Metadata): Bool {
    return state1.data.equals(state2.data).and(state1.kind.equals(state2.kind));
  }
}

export class BlockParams extends Struct({
  txsCount: UInt32,
  timeCreated: UInt64,
  isValidated: Bool,
  isFinal: Bool,
  isProved: Bool,
  isInvalid: Bool,
}) {
  pack(): Field {
    const txsCount = this.txsCount.value.toBits(32);
    const timeCreated = this.timeCreated.value.toBits(64);
    return Field.fromBits([
      ...txsCount,
      ...timeCreated,
      this.isValidated,
      this.isFinal,
      this.isProved,
      this.isInvalid,
    ]);
  }
  static unpack(packed: Field) {
    const bits = packed.toBits(32 + 64 + 4);
    const txsCount = UInt32.from(0);
    const timeCreated = UInt64.from(0);
    txsCount.value = Field.fromBits(bits.slice(0, 32));
    timeCreated.value = Field.fromBits(bits.slice(32, 96));
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

export type DomainTransactionType = "add" | "extend" | "update" | "remove"; // removeExpired
export type DomainTransactionStatus =
  | "sent"
  | "invalid"
  | "accepted"
  | "rejected";
export class RollupNftNameValue extends Struct({
  address: PublicKey,
  metadata: Metadata,
  storage: Storage,
  expiry: UInt64,
}) {
  hash(): Field {
    return Poseidon.hashPacked(RollupNftNameValue, this);
  }
  static empty(): RollupNftNameValue {
    return new RollupNftNameValue({
      address: PublicKey.empty(),
      metadata: new Metadata({ data: Field(0), kind: Field(0) }),
      storage: new Storage({ hashString: [Field(0), Field(0)] }),
      expiry: UInt64.from(0),
    });
  }
}

export class RollupNftName extends Struct({
  name: Field,
  data: RollupNftNameValue,
}) {
  static empty(): RollupNftName {
    return new RollupNftName({
      name: Field(0),
      data: RollupNftNameValue.empty(),
    });
  }

  isEmpty(): Bool {
    return this.data.expiry.equals(UInt64.from(0));
  }

  value(): Field {
    return this.data.hash();
  }

  key(): Field {
    return this.name;
  }

  hash(): Field {
    return Poseidon.hashPacked(RollupNftName, this);
  }
}

export const DomainTransactionEnum: { [k in DomainTransactionType]: UInt8 } = {
  add: UInt8.from(1),
  extend: UInt8.from(2),
  update: UInt8.from(3),
  remove: UInt8.from(4),
};

export class DomainTransaction extends Struct({
  type: UInt8,
  domain: RollupNftName,
}) {
  hash(): Field {
    return Poseidon.hashPacked(DomainTransaction, this);
  }
}

export class DomainTransactionData {
  constructor(
    public readonly tx: DomainTransaction,
    public readonly oldDomain?: RollupNftName,
    public readonly signature?: Signature
  ) {
    this.tx = tx;
    this.oldDomain = oldDomain;
    this.signature = signature;
  }

  public txType(): DomainTransactionType {
    return ["add", "extend", "update", "remove"][
      this.tx.type.toNumber() - 1
    ] as DomainTransactionType;
  }

  public toJSON() {
    this.validate();
    return {
      tx: serializeFields(DomainTransaction.toFields(this.tx)),
      oldDomain: this.oldDomain
        ? serializeFields(RollupNftName.toFields(this.oldDomain))
        : undefined,
      signature: this.signature?.toBase58(),
    };
  }

  static fromJSON(data: any): DomainTransactionData {
    const tx = new DomainTransaction(
      DomainTransaction.fromFields(deserializeFields(data.tx))
    );
    const oldDomain = data.oldDomain
      ? new RollupNftName(
          RollupNftName.fromFields(deserializeFields(data.oldDomain))
        )
      : undefined;
    const signature = data.signature
      ? Signature.fromBase58(data.signature)
      : undefined;
    const domain = new DomainTransactionData(tx, oldDomain, signature);
    domain.validate();
    return domain;
  }

  public validate() {
    const txType = this.txType();
    if (!this.oldDomain) {
      if (txType === "update" || txType === "extend")
        throw new Error(
          "oldDomain is required for update and extend transaction"
        );
    }
    if (!this.signature) {
      if (txType === "update")
        throw new Error("signature is required for update transaction");
    }
  }
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

export type DomainCloudTransactionStatus =
  | "sent"
  | "invalid"
  | "pending"
  | "accepted"
  | "rejected";
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

export class MapUpdateData extends Struct({
  oldRoot: Field,
  newRoot: Field,
  time: UInt64, // unix time when the map was updated
  tx: DomainTransaction,
  witness: MerkleMapWitness,
}) {}

export class MapTransition extends Struct({
  oldRoot: Field,
  newRoot: Field,
  time: UInt64, // unix time when the map was updated
  hash: Field, // sum of hashes of all the new keys and values of the Map
  count: UInt32, // number of new keys in the Map
}) {
  // TODO: addNew, replaceExpired, extend, change
  static add(update: MapUpdateData) {
    update.tx.type.assertEquals(DomainTransactionEnum.add);
    const key = update.tx.domain.name;
    const value = update.tx.domain.data.hash();

    const [rootBefore, keyBefore] = update.witness.computeRootAndKey(Field(0));
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
      count: UInt32.from(1),
      time: update.time,
    });
  }

  static update(
    update: MapUpdateData,
    oldDomain: RollupNftName,
    signature: Signature
  ) {
    update.tx.type.assertEquals(DomainTransactionEnum.update);
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

    signature.verify(
      oldDomain.data.address,
      DomainTransaction.toFields(update.tx)
    );

    const hash = update.tx.hash();

    return new MapTransition({
      oldRoot: update.oldRoot,
      newRoot: update.newRoot,
      hash,
      count: UInt32.from(1),
      time: update.time,
    });
  }

  static extend(update: MapUpdateData, oldDomain: RollupNftName) {
    update.tx.domain.data.address.assertEquals(oldDomain.data.address);
    Metadata.assertEquals(
      update.tx.domain.data.metadata,
      oldDomain.data.metadata
    );
    Storage.assertEquals(update.tx.domain.data.storage, oldDomain.data.storage);
    update.tx.domain.data.expiry.assertGreaterThan(oldDomain.data.expiry);

    update.tx.type.assertEquals(DomainTransactionEnum.extend);
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
      count: UInt32.from(1),
      time: update.time,
    });
  }

  static remove(update: MapUpdateData) {
    update.tx.type.assertEquals(DomainTransactionEnum.remove);
    update.tx.domain.data.expiry.assertLessThanOrEqual(update.time);
    const key = update.tx.domain.name;
    const value = update.tx.domain.data.hash();

    const [rootBefore, keyBefore] = update.witness.computeRootAndKey(value);
    update.oldRoot.assertEquals(rootBefore);
    key.assertEquals(keyBefore);

    const [rootAfter, keyAfter] = update.witness.computeRootAndKey(Field(0));
    update.newRoot.assertEquals(rootAfter);
    key.assertEquals(keyAfter);

    const hash = update.tx.hash();

    return new MapTransition({
      oldRoot: update.oldRoot,
      newRoot: update.newRoot,
      hash,
      count: UInt32.from(1),
      time: update.time,
    });
  }

  // Incorrect or unpaid txs are being rejected
  static reject(root: Field, time: UInt64, domain: DomainTransaction) {
    const hash = domain.hash();
    return new MapTransition({
      oldRoot: root,
      newRoot: root,
      hash,
      count: UInt32.from(1),
      time,
    });
  }

  static merge(transition1: MapTransition, transition2: MapTransition) {
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

  static assertEquals(transition1: MapTransition, transition2: MapTransition) {
    transition1.oldRoot.assertEquals(transition2.oldRoot);
    transition1.newRoot.assertEquals(transition2.newRoot);
    transition1.hash.assertEquals(transition2.hash);
    transition1.count.assertEquals(transition2.count);
    transition1.time.assertEquals(transition2.time);
  }
}

export const MapUpdate = ZkProgram({
  name: "MapUpdate",
  publicInput: MapTransition,
  overrideWrapDomain: 2,

  methods: {
    add: {
      privateInputs: [MapUpdateData],

      async method(state: MapTransition, update: MapUpdateData) {
        //Provable.log("MapUpdate.add state.hash:", state.hash);
        const computedState = MapTransition.add(update);
        MapTransition.assertEquals(computedState, state);
      },
    },

    update: {
      privateInputs: [MapUpdateData, RollupNftName, Signature],

      async method(
        state: MapTransition,
        update: MapUpdateData,
        oldDomain: RollupNftName,
        signature: Signature
      ) {
        const computedState = MapTransition.update(
          update,
          oldDomain,
          signature
        );
        MapTransition.assertEquals(computedState, state);
      },
    },

    extend: {
      privateInputs: [MapUpdateData, RollupNftName],

      async method(
        state: MapTransition,
        update: MapUpdateData,
        oldDomain: RollupNftName
      ) {
        const computedState = MapTransition.extend(update, oldDomain);
        MapTransition.assertEquals(computedState, state);
      },
    },

    remove: {
      privateInputs: [MapUpdateData],

      async method(state: MapTransition, update: MapUpdateData) {
        const computedState = MapTransition.remove(update);
        MapTransition.assertEquals(computedState, state);
      },
    },

    reject: {
      privateInputs: [Field, UInt64, DomainTransaction],

      async method(
        state: MapTransition,
        root: Field,
        time: UInt64,
        domain: DomainTransaction
      ) {
        const computedState = MapTransition.reject(root, time, domain);
        MapTransition.assertEquals(computedState, state);
      },
    },

    merge: {
      privateInputs: [SelfProof, SelfProof],

      async method(
        newState: MapTransition,
        proof1: SelfProof<MapTransition, void>,
        proof2: SelfProof<MapTransition, void>
      ) {
        proof1.verify();
        proof2.verify();
        const computedState = MapTransition.merge(
          proof1.publicInput,
          proof2.publicInput
        );
        MapTransition.assertEquals(computedState, newState);
      },
    },
  },
});

export class MapUpdateProof extends ZkProgram.Proof(MapUpdate) {}

export class ValidatorWitness extends MerkleWitness(3) {}

export class ValidatorsDecision extends Struct({
  contractAddress: PublicKey,
  chainId: Field, // chain id
  validators: ValidatorsState,
  decisionType: Field,
  expiry: UInt64, // Unix time when decision expires
  data: Provable.Array(Field, 8),
}) {
  static assertEquals(a: ValidatorsDecision, b: ValidatorsDecision) {
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

export class ValidatorsDecisionState extends Struct({
  decision: ValidatorsDecision,
  hash: Field,
  count: UInt32,
}) {
  static vote(
    decision: ValidatorsDecision,
    validatorAddress: PublicKey,
    witness: ValidatorWitness,
    signature: Signature
  ) {
    const hash = Poseidon.hashPacked(PublicKey, validatorAddress);
    signature
      .verify(validatorAddress, ValidatorsDecision.toFields(decision))
      .assertTrue("Wrong validator signature");
    const root = witness.calculateRoot(hash);
    decision.validators.root.assertEquals(root);
    return new ValidatorsDecisionState({
      decision,
      count: UInt32.from(1),
      hash,
    });
  }

  static abstain(
    decision: ValidatorsDecision,
    validatorAddress: PublicKey,
    witness: ValidatorWitness
  ) {
    const hash = Poseidon.hashPacked(PublicKey, validatorAddress);
    const root = witness.calculateRoot(hash);
    decision.validators.root.assertEquals(root);
    return new ValidatorsDecisionState({
      decision,
      count: UInt32.from(1),
      hash,
    });
  }

  static merge(
    state1: ValidatorsDecisionState,
    state2: ValidatorsDecisionState
  ) {
    ValidatorsDecision.assertEquals(state1.decision, state2.decision);

    return new ValidatorsDecisionState({
      decision: state1.decision,
      count: state1.count.add(state2.count),
      hash: state1.hash.add(state2.hash),
    });
  }

  static assertEquals(a: ValidatorsDecisionState, b: ValidatorsDecisionState) {
    ValidatorsDecision.assertEquals(a.decision, b.decision);
    a.count.assertEquals(b.count);
    a.hash.assertEquals(b.hash);
  }
}

export const ValidatorsVoting = ZkProgram({
  name: "ValidatorsVoting",
  publicInput: ValidatorsDecisionState,

  methods: {
    vote: {
      privateInputs: [
        ValidatorsDecision,
        PublicKey,
        ValidatorWitness,
        Signature,
      ],

      async method(
        state: ValidatorsDecisionState,
        decision: ValidatorsDecision,
        validatorAddress: PublicKey,
        witness: ValidatorWitness,
        signature: Signature
      ) {
        const calculatedState = ValidatorsDecisionState.vote(
          decision,
          validatorAddress,
          witness,
          signature
        );
        ValidatorsDecisionState.assertEquals(state, calculatedState);
      },
    },

    abstain: {
      privateInputs: [ValidatorsDecision, PublicKey, ValidatorWitness],

      async method(
        state: ValidatorsDecisionState,
        decision: ValidatorsDecision,
        validatorAddress: PublicKey,
        witness: ValidatorWitness
      ) {
        const calculatedState = ValidatorsDecisionState.abstain(
          decision,
          validatorAddress,
          witness
        );
        ValidatorsDecisionState.assertEquals(state, calculatedState);
      },
    },

    merge: {
      privateInputs: [SelfProof, SelfProof],

      async method(
        state: ValidatorsDecisionState,
        proof1: SelfProof<ValidatorsDecisionState, void>,
        proof2: SelfProof<ValidatorsDecisionState, void>
      ) {
        proof1.verify();
        proof2.verify();
        const calculatedState = ValidatorsDecisionState.merge(
          proof1.publicInput,
          proof2.publicInput
        );
        ValidatorsDecisionState.assertEquals(state, calculatedState);
      },
    },
  },
});

export class ValidatorsVotingProof extends ZkProgram.Proof(ValidatorsVoting) {}

export class BlockCreationData extends Struct({
  oldRoot: Field,
  verificationKeyHash: Field,
  blockAddress: PublicKey,
  blockProducer: PublicKey,
  previousBlockAddress: PublicKey,
}) {}

export class BlockValidationData extends Struct({
  storage: Storage,
  root: Field,
  txsHash: Field,
  txsCount: UInt32,
  blockAddress: PublicKey,
  notUsed: Field,
}) {}

export class BadBlockValidationData extends Struct({
  blockAddress: PublicKey,
  notUsed: Provable.Array(Field, 6),
}) {}

export class ChangeValidatorsData extends Struct({
  new: ValidatorsState,
  old: ValidatorsState,
  storage: Storage,
}) {}

export class BlockData extends Struct({
  blockNumber: UInt64,
  root: Field,
  storage: Storage,
  previousBlockAddress: PublicKey,
  txsHash: Field,
  blockParams: Field,
  blockAddress: PublicKey,
}) {
  toState(): Field[] {
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

export class LastBlockPacked extends Struct({
  x: Field,
  data: Field,
}) {}

export class LastBlock extends Struct({
  address: PublicKey,
  blockNumber: UInt64,
}) {
  pack(): LastBlockPacked {
    return new LastBlockPacked({
      x: this.address.x,
      data: Field.fromBits([
        ...this.blockNumber.value.toBits(64),
        this.address.isOdd,
      ]),
    });
  }

  static unpack(packed: LastBlockPacked): LastBlock {
    const bits = packed.data.toBits(64 + 1);
    const address = PublicKey.from({
      x: packed.x,
      isOdd: bits[64],
    });
    const blockNumber = UInt64.from(0);
    blockNumber.value = Field.fromBits(bits.slice(0, 64));
    return new LastBlock({
      address,
      blockNumber,
    });
  }
}

export class BlockContract extends SmartContract {
  @state(UInt64) blockNumber = State<UInt64>();
  @state(Field) root = State<Field>();
  @state(Storage) storage = State<Storage>();
  @state(PublicKey) previousBlock = State<PublicKey>();
  @state(Field) txsHash = State<Field>();
  @state(Field) blockParams = State<Field>();

  async deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proof(),
    });
  }

  @method.returns(UInt64)
  async validateBlock(data: BlockValidationData, tokenId: Field) {
    const params = BlockParams.unpack(this.blockParams.getAndRequireEquals());
    params.isValidated.assertEquals(Bool(false));
    params.isFinal.assertEquals(Bool(false));
    params.isProved.assertEquals(Bool(false));
    params.isInvalid.assertEquals(Bool(false));

    params.txsCount.assertEquals(data.txsCount);
    Storage.assertEquals(data.storage, this.storage.getAndRequireEquals());
    data.txsHash.assertEquals(this.txsHash.getAndRequireEquals());
    data.root.assertEquals(this.root.getAndRequireEquals());

    const previousBlockContract = new BlockContract(
      this.previousBlock.getAndRequireEquals(),
      tokenId
    );
    // TODO: add error messages for all assertions
    // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
    const previousBlockParams = BlockParams.unpack(
      previousBlockContract.blockParams.get()
    );
    previousBlockParams.isValidated
      .or(previousBlockParams.isFinal)
      .assertTrue();
    params.isValidated = Bool(true);
    this.blockParams.set(params.pack());
    return this.blockNumber.getAndRequireEquals();
  }

  @method async badBlock(tokenId: Field) {
    const previousBlockContract = new BlockContract(
      this.previousBlock.getAndRequireEquals(),
      tokenId
    );
    const previousBlockParams = BlockParams.unpack(
      // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
      previousBlockContract.blockParams.get()
    );
    previousBlockParams.isFinal.assertTrue();
    // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
    const root = previousBlockContract.root.get();
    const params = BlockParams.unpack(this.blockParams.getAndRequireEquals());
    params.isFinal.assertFalse();
    params.isValidated = Bool(false);
    params.isInvalid = Bool(true);
    params.isFinal = Bool(true);
    this.blockParams.set(params.pack());
    this.root.set(root);
  }

  @method.returns(UInt64)
  async proveBlock(data: MapTransition, tokenId: Field) {
    const params = BlockParams.unpack(this.blockParams.getAndRequireEquals());
    params.isFinal.assertFalse();
    params.isValidated.assertTrue(); // We need to make sure that IPFS data is available and correct

    const previousBlockContract = new BlockContract(
      this.previousBlock.getAndRequireEquals(),
      tokenId
    );
    const oldRoot = previousBlockContract.root.get(); // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
    oldRoot.assertEquals(data.oldRoot);
    data.newRoot.assertEquals(this.root.getAndRequireEquals());
    const previousBlockParams = BlockParams.unpack(
      // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
      previousBlockContract.blockParams.get()
    );
    previousBlockParams.isFinal.assertTrue();
    data.hash.assertEquals(this.txsHash.getAndRequireEquals());
    data.count.assertEquals(params.txsCount);
    params.isProved = Bool(true);
    params.isFinal = Bool(true);
    this.blockParams.set(params.pack());
    return this.blockNumber.getAndRequireEquals();
  }
}

export class RollupContract extends TokenContract {
  @state(Field) domain = State<Field>();
  @state(Field) validatorsPacked = State<Field>();
  @state(LastBlockPacked) lastCreatedBlock = State<LastBlockPacked>();
  @state(LastBlockPacked) lastValidatedBlock = State<LastBlockPacked>();
  @state(LastBlockPacked) lastProvedBlock = State<LastBlockPacked>();

  async deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proof(),
    });
  }

  init() {
    super.init();
    this.lastCreatedBlock.set(
      new LastBlock({
        address: PublicKey.empty(),
        blockNumber: UInt64.from(0),
      }).pack()
    );
    this.lastValidatedBlock.set(
      new LastBlock({
        address: PublicKey.empty(),
        blockNumber: UInt64.from(0),
      }).pack()
    );
    this.lastProvedBlock.set(
      new LastBlock({
        address: PublicKey.empty(),
        blockNumber: UInt64.from(0),
      }).pack()
    );
  }

  async approveBase(forest: AccountUpdateForest) {
    // https://discord.com/channels/484437221055922177/1215258350577647616
    // this.checkZeroBalanceChange(forest);
    //forest.isEmpty().assertEquals(Bool(true));
    throw Error("transfers are not allowed");
  }

  events = {
    newBlock: BlockData,
    validatedBlock: PublicKey,
    provedBlock: PublicKey,
    setValidators: ChangeValidatorsData,
  };

  @method async block(
    proof: ValidatorsVotingProof,
    data: BlockData,
    verificationKey: VerificationKey
  ) {
    this.checkValidatorsDecision(proof);
    const tokenId = this.deriveTokenId();
    const blockProducer = this.sender.getAndRequireSignature();
    proof.publicInput.decision.decisionType.assertEquals(
      ValidatorDecisionType.createBlock
    );
    const decision = BlockCreationData.fromFields(
      proof.publicInput.decision.data
    );
    decision.verificationKeyHash.assertEquals(verificationKey.hash);
    decision.blockAddress.assertEquals(data.blockAddress);
    decision.blockProducer.assertEquals(blockProducer);
    decision.previousBlockAddress.assertEquals(data.previousBlockAddress);
    const lastBlock = LastBlock.unpack(
      this.lastCreatedBlock.getAndRequireEquals()
    );
    lastBlock.address.equals(PublicKey.empty()).assertFalse();
    data.previousBlockAddress.assertEquals(lastBlock.address);
    data.blockNumber.assertEquals(lastBlock.blockNumber.add(UInt64.from(1)));
    const previousBlock = new BlockContract(lastBlock.address, tokenId);
    const oldRoot = previousBlock.root.get(); // TODO: change to getAndRequireEquals() after o1js bug fix https://github.com/o1-labs/o1js/issues/1245
    decision.oldRoot.assertEquals(oldRoot);
    const blockNumber = previousBlock.blockNumber.get().add(UInt64.from(1));
    blockNumber.assertEquals(data.blockNumber);
    const previousBlockParams = BlockParams.unpack(
      previousBlock.blockParams.get()
    );
    previousBlockParams.isValidated
      .or(previousBlockParams.isFinal)
      .assertTrue();
    const blockParams = BlockParams.unpack(data.blockParams);
    previousBlockParams.timeCreated.assertLessThan(blockParams.timeCreated);
    AccountUpdate.create(data.blockAddress, tokenId)
      .account.balance.getAndRequireEquals()
      .assertEquals(UInt64.from(0));
    this.internal.mint({
      address: data.blockAddress,
      amount: 1_000_000_000,
    });
    const update = AccountUpdate.createSigned(data.blockAddress, tokenId);
    update.body.update.verificationKey = {
      isSome: Bool(true),
      value: verificationKey,
    };
    update.body.update.permissions = {
      isSome: Bool(true),
      value: {
        ...Permissions.default(),
        editState: Permissions.proof(),
      },
    };
    const state = data.toState();
    update.body.update.appState = [
      { isSome: Bool(true), value: state[0] },
      { isSome: Bool(true), value: state[1] },
      { isSome: Bool(true), value: state[2] },
      { isSome: Bool(true), value: state[3] },
      { isSome: Bool(true), value: state[4] },
      { isSome: Bool(true), value: state[5] },
      { isSome: Bool(true), value: state[6] },
      { isSome: Bool(true), value: state[7] },
    ];
    this.emitEvent("newBlock", data);
    this.lastCreatedBlock.set(
      new LastBlock({
        address: data.blockAddress,
        blockNumber: data.blockNumber,
      }).pack()
    );
  }

  @method async blockZero(publicKey: PublicKey, timeCreated: UInt64) {
    // TODO: check timeCreated
    const lastBlock = LastBlock.unpack(
      this.lastCreatedBlock.getAndRequireEquals()
    );
    lastBlock.address.equals(PublicKey.empty()).assertTrue();
    const tokenId = this.deriveTokenId();
    this.internal.mint({
      address: publicKey,
      amount: 1_000_000_000,
    });
    const update = AccountUpdate.createSigned(publicKey, tokenId);
    const data: BlockData = new BlockData({
      blockNumber: UInt64.from(0),
      root: new MerkleMap().getRoot(),
      storage: Storage.empty(),
      previousBlockAddress: PublicKey.empty(),
      txsHash: Field(0),
      blockParams: new BlockParams({
        txsCount: UInt32.from(0),
        timeCreated,
        isValidated: Bool(true),
        isFinal: Bool(true),
        isProved: Bool(true),
        isInvalid: Bool(false),
      }).pack(),
      blockAddress: publicKey,
    });
    const state = data.toState();
    update.body.update.appState = [
      { isSome: Bool(true), value: state[0] },
      { isSome: Bool(true), value: state[1] },
      { isSome: Bool(true), value: state[2] },
      { isSome: Bool(true), value: state[3] },
      { isSome: Bool(true), value: state[4] },
      { isSome: Bool(true), value: state[5] },
      { isSome: Bool(true), value: state[6] },
      { isSome: Bool(true), value: state[7] },
    ];
    this.lastCreatedBlock.set(
      new LastBlock({
        address: publicKey,
        blockNumber: UInt64.from(0),
      }).pack()
    );
    this.lastProvedBlock.set(
      new LastBlock({
        address: publicKey,
        blockNumber: UInt64.from(0),
      }).pack()
    );
    this.lastValidatedBlock.set(
      new LastBlock({
        address: publicKey,
        blockNumber: UInt64.from(0),
      }).pack()
    );
    this.emitEvent("newBlock", data);
  }

  @method async validateBlock(proof: ValidatorsVotingProof) {
    this.checkValidatorsDecision(proof);
    proof.publicInput.decision.decisionType.assertEquals(
      ValidatorDecisionType.validate
    );
    const tokenId = this.deriveTokenId();
    const data = BlockValidationData.fromFields(
      proof.publicInput.decision.data
    );
    const block = new BlockContract(data.blockAddress, tokenId);
    const blockNumber = await block.validateBlock(data, tokenId);
    this.lastValidatedBlock.set(
      new LastBlock({ address: data.blockAddress, blockNumber }).pack()
    );
    this.emitEvent("validatedBlock", data.blockAddress);
  }

  @method async proveBlock(proof: MapUpdateProof, blockAddress: PublicKey) {
    proof.verify();
    await this.internalProveBlock(proof.publicInput, blockAddress);
  }

  // TODO: remove after testing
  @method async proveBlockProofsOff(
    transition: MapTransition,
    blockAddress: PublicKey
  ) {
    await this.internalProveBlock(transition, blockAddress);
  }

  private async internalProveBlock(
    transition: MapTransition,
    blockAddress: PublicKey
  ) {
    // TODO: return back after o1js bug fix https://github.com/o1-labs/o1js/issues/1588
    // and use this.network.timestamp.requireBetween()
    //const timestamp = this.network.timestamp.getAndRequireEquals();
    //Provable.log("proveBlock time", timestamp);
    //timestamp.assertGreaterThan(proof.publicInput.time);

    const tokenId = this.deriveTokenId();
    const block = new BlockContract(blockAddress, tokenId);
    const blockNumber = await block.proveBlock(transition, tokenId);
    this.lastProvedBlock.set(
      new LastBlock({ address: blockAddress, blockNumber }).pack()
    );
  }

  @method async badBlock(proof: ValidatorsVotingProof) {
    this.checkValidatorsDecision(proof);
    proof.publicInput.decision.decisionType.assertEquals(
      ValidatorDecisionType.badBlock
    );
    const data: BadBlockValidationData = BadBlockValidationData.fromFields(
      proof.publicInput.decision.data
    );
    const tokenId = this.deriveTokenId();
    const block = new BlockContract(data.blockAddress, tokenId);
    await block.badBlock(tokenId);
  }

  @method async setValidators(proof: ValidatorsVotingProof) {
    this.checkValidatorsDecision(proof);
    proof.publicInput.decision.decisionType.assertEquals(
      ValidatorDecisionType.setValidators
    );
    const old = this.validatorsPacked.getAndRequireEquals();
    const data = ChangeValidatorsData.fromFields(
      proof.publicInput.decision.data
    );
    data.old.pack().assertEquals(old);
    proof.publicInput.count.assertGreaterThan(
      data.old.count.mul(UInt32.from(2))
    );
    this.validatorsPacked.set(data.new.pack());
    this.emitEvent("setValidators", data);
  }

  checkValidatorsDecision(proof: ValidatorsVotingProof) {
    // see https://discord.com/channels/484437221055922177/1215291691364524072
    proof.publicInput.decision.chainId.assertEquals(getNetworkIdHash());
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
