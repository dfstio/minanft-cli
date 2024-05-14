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
exports.verifyKeyOnChain = exports.upgradeRollupVerifier = exports.deployRollupVerifier = exports.RollupNFTKeyVerifier = exports.RollupNFTKeyVerificationEvent = exports.RollupNFTKeyVerification = void 0;
const o1js_1 = require("o1js");
const proof_1 = require("./proof");
const contract_1 = require("./contract");
const config_1 = require("./config");
const minanft_1 = require("minanft");
const zkcloudworker_1 = require("zkcloudworker");
class RollupNFTKeyVerification extends (0, o1js_1.Struct)({
    blockAddress: o1js_1.PublicKey,
    blockRoot: o1js_1.Field,
}) {
}
exports.RollupNFTKeyVerification = RollupNFTKeyVerification;
class RollupNFTKeyVerificationEvent extends (0, o1js_1.Struct)({
    blockAddress: o1js_1.PublicKey,
    blockRoot: o1js_1.Field,
    nft: contract_1.RollupNftName,
    key: o1js_1.Field,
    kind: o1js_1.Field,
    data: o1js_1.Field,
}) {
}
exports.RollupNFTKeyVerificationEvent = RollupNFTKeyVerificationEvent;
class RollupNFTKeyVerifier extends o1js_1.SmartContract {
    constructor() {
        super(...arguments);
        this.rollup = (0, o1js_1.State)();
        this.events = {
            verified: RollupNFTKeyVerificationEvent,
        };
    }
    async verify(verificationData, rollupProof, keyProof) {
        const rollup = this.rollup.getAndRequireEquals();
        /*
        const contract = new RollupContract(rollup);
        const tokenId = contract.deriveTokenId();
        // check that the address contains the block
        AccountUpdate.create(verificationData.blockAddress, tokenId)
          .account.balance.getAndRequireEquals()
          .assertEquals(UInt64.from(1_000_000_000));
        const block = new BlockContract(verificationData.blockAddress, tokenId);
        const blockData = BlockParams.unpack(block.blockParams.get());
        const blockRoot = block.root.get();
        blockRoot.assertEquals(verificationData.blockRoot);
        blockData.isProved.assertTrue();
        rollupProof.publicInput.root.assertEquals(blockRoot);
        */
        rollupProof.verify();
        keyProof.verify();
        keyProof.publicInput.nft.data.metadata.kind.assertEquals(rollupProof.publicInput.nft.data.metadata.kind);
        keyProof.publicInput.nft.data.metadata.data.assertEquals(rollupProof.publicInput.nft.data.metadata.data);
        keyProof.publicInput.nft.name.assertEquals(rollupProof.publicInput.nft.name);
        keyProof.publicInput.nft
            .hash()
            .assertEquals(rollupProof.publicInput.nft.hash());
        const eventData = new RollupNFTKeyVerificationEvent({
            blockAddress: verificationData.blockAddress,
            blockRoot: verificationData.blockRoot,
            nft: rollupProof.publicInput.nft,
            key: keyProof.publicInput.key,
            kind: keyProof.publicInput.kind,
            data: keyProof.publicInput.data,
        });
        this.emitEvent("verified", eventData);
    }
}
exports.RollupNFTKeyVerifier = RollupNFTKeyVerifier;
__decorate([
    (0, o1js_1.state)(o1js_1.PublicKey),
    __metadata("design:type", Object)
], RollupNFTKeyVerifier.prototype, "rollup", void 0);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RollupNFTKeyVerification,
        proof_1.RollupVerifierProof,
        proof_1.KeyVerifierProof]),
    __metadata("design:returntype", Promise)
], RollupNFTKeyVerifier.prototype, "verify", null);
async function deployRollupVerifier(privateKey) {
    const deployerPrivateKey = o1js_1.PrivateKey.fromBase58(config_1.deployer);
    const contractPrivateKey = o1js_1.PrivateKey.fromBase58(privateKey);
    const contractPublicKey = contractPrivateKey.toPublicKey();
    if (contractPublicKey.toBase58() !== config_1.verifierAddress) {
        console.error("Verifier address does not match");
        return;
    }
    const sender = deployerPrivateKey.toPublicKey();
    await (0, minanft_1.initBlockchain)(config_1.chain);
    console.log("blockchain initialized:", config_1.chain);
    await (0, minanft_1.fetchMinaAccount)({ publicKey: sender, force: true });
    console.log("contract address:", contractPublicKey.toBase58());
    console.log("sender:", sender.toBase58());
    console.log("Sender balance:", await (0, minanft_1.accountBalanceMina)(sender));
    console.time("compiled RollupVerifier");
    await proof_1.RollupVerifier.compile();
    console.timeEnd("compiled RollupVerifier");
    console.time("compiled KeyVerifier");
    await proof_1.KeyVerifier.compile();
    console.timeEnd("compiled KeyVerifier");
    console.time("compiled RollupNFTKeyVerifier");
    await RollupNFTKeyVerifier.compile();
    console.timeEnd("compiled RollupNFTKeyVerifier");
    const zkApp = new RollupNFTKeyVerifier(contractPublicKey);
    const tx = await o1js_1.Mina.transaction({
        sender,
        fee: await (0, zkcloudworker_1.fee)(),
        memo: "MinaNFT: deploy",
    }, async () => {
        o1js_1.AccountUpdate.fundNewAccount(sender);
        await zkApp.deploy({});
        zkApp.rollup.set(o1js_1.PublicKey.fromBase58(config_1.contractAddress));
        zkApp.account.zkappUri.set("https://minanft.io");
    });
    await tx.prove();
    tx.sign([deployerPrivateKey, contractPrivateKey]);
    await sendTx(tx, "deploy");
}
exports.deployRollupVerifier = deployRollupVerifier;
async function upgradeRollupVerifier(privateKey) {
    const deployerPrivateKey = o1js_1.PrivateKey.fromBase58(config_1.deployer);
    const contractPrivateKey = o1js_1.PrivateKey.fromBase58(privateKey);
    const contractPublicKey = contractPrivateKey.toPublicKey();
    if (contractPublicKey.toBase58() !== config_1.verifierAddress) {
        console.error("Verifier address does not match");
        return;
    }
    const sender = deployerPrivateKey.toPublicKey();
    await (0, minanft_1.initBlockchain)(config_1.chain);
    console.log("blockchain initialized:", config_1.chain);
    await (0, minanft_1.fetchMinaAccount)({ publicKey: sender, force: true });
    console.log("contract address:", contractPublicKey.toBase58());
    console.log("sender:", sender.toBase58());
    console.log("Sender balance:", await (0, minanft_1.accountBalanceMina)(sender));
    console.time("compiled RollupVerifier");
    await proof_1.RollupVerifier.compile();
    console.timeEnd("compiled RollupVerifier");
    console.time("compiled KeyVerifier");
    await proof_1.KeyVerifier.compile();
    console.timeEnd("compiled KeyVerifier");
    console.time("compiled RollupNFTKeyVerifier");
    const { verificationKey } = await RollupNFTKeyVerifier.compile();
    console.timeEnd("compiled RollupNFTKeyVerifier");
    const zkApp = new RollupNFTKeyVerifier(contractPublicKey);
    const tx = await o1js_1.Mina.transaction({
        sender,
        fee: await (0, zkcloudworker_1.fee)(),
        memo: "MinaNFT: upgrade",
    }, async () => {
        const update = o1js_1.AccountUpdate.createSigned(contractPublicKey);
        update.account.verificationKey.set(verificationKey);
    });
    await tx.prove();
    tx.sign([deployerPrivateKey, contractPrivateKey]);
    await sendTx(tx, "upgrade");
}
exports.upgradeRollupVerifier = upgradeRollupVerifier;
async function verifyKeyOnChain(params) {
    const { verificationData, rollupProof, keyProof } = params;
    const deployerPrivateKey = o1js_1.PrivateKey.fromBase58(config_1.deployer);
    const contractPublicKey = o1js_1.PublicKey.fromBase58(config_1.verifierAddress);
    const sender = deployerPrivateKey.toPublicKey();
    await (0, minanft_1.initBlockchain)(config_1.chain);
    console.log("blockchain initialized:", config_1.chain);
    await (0, minanft_1.fetchMinaAccount)({ publicKey: sender, force: true });
    console.log("contract address:", contractPublicKey.toBase58());
    console.log("sender:", sender.toBase58());
    console.log("Sender balance:", await (0, minanft_1.accountBalanceMina)(sender));
    console.time("compiled RollupVerifier");
    await proof_1.RollupVerifier.compile();
    console.timeEnd("compiled RollupVerifier");
    console.time("compiled KeyVerifier");
    await proof_1.KeyVerifier.compile();
    console.timeEnd("compiled KeyVerifier");
    console.time("compiled RollupNFTKeyVerifier");
    await RollupNFTKeyVerifier.compile();
    console.timeEnd("compiled RollupNFTKeyVerifier");
    const zkApp = new RollupNFTKeyVerifier(contractPublicKey);
    const rollupAddress = o1js_1.PublicKey.fromBase58(config_1.contractAddress);
    const rollup = new contract_1.RollupContract(rollupAddress);
    const tokenId = rollup.deriveTokenId();
    await (0, minanft_1.fetchMinaAccount)({ publicKey: sender, force: true });
    await (0, minanft_1.fetchMinaAccount)({ publicKey: contractPublicKey, force: true });
    await (0, minanft_1.fetchMinaAccount)({ publicKey: rollupAddress, force: true });
    await (0, minanft_1.fetchMinaAccount)({
        publicKey: verificationData.blockAddress,
        tokenId,
        force: true,
    });
    const tx = await o1js_1.Mina.transaction({
        sender,
        fee: await (0, zkcloudworker_1.fee)(),
        memo: "MinaNFT: verify",
    }, async () => {
        await zkApp.verify(verificationData, rollupProof, keyProof);
    });
    await tx.prove();
    tx.sign([deployerPrivateKey]);
    await sendTx(tx, "verify");
}
exports.verifyKeyOnChain = verifyKeyOnChain;
async function sendTx(tx, description) {
    try {
        let txSent;
        let sent = false;
        while (!sent) {
            txSent = await tx.safeSend();
            if (txSent.status == "pending") {
                sent = true;
                console.log(`${description ?? ""} tx sent: hash: ${txSent.hash} status: ${txSent.status}`);
            }
            else if (config_1.chain === "zeko") {
                console.log("Retrying Zeko tx");
                await (0, zkcloudworker_1.sleep)(10000);
            }
            else {
                console.log(`${description ?? ""} tx NOT sent: hash: ${txSent?.hash} status: ${txSent?.status}`);
                return "Error sending transaction";
            }
        }
        if (txSent === undefined)
            throw new Error("txSent is undefined");
        if (txSent.errors.length > 0) {
            console.error(`${description ?? ""} tx error: hash: ${txSent.hash} status: ${txSent.status}  errors: ${txSent.errors}`);
        }
        if (txSent.status === "pending") {
            console.log(`Waiting for tx inclusion...`);
            const txIncluded = await txSent.safeWait();
            console.log(`${description ?? ""} tx included into block: hash: ${txIncluded.hash} status: ${txIncluded.status}`);
        }
    }
    catch (error) {
        if (config_1.chain !== "zeko")
            console.error("Error sending tx", error);
    }
    if (config_1.chain !== "local")
        await (0, zkcloudworker_1.sleep)(10000);
}
