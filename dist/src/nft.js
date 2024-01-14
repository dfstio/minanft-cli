"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexName = exports.mint = exports.createNFT = exports.reserve = exports.reserveName = exports.nft = exports.pinataJWT = exports.arweaveKey = void 0;
const minanft_1 = require("minanft");
const jwt_1 = require("./jwt");
const account_1 = require("./account");
const debug_1 = require("./debug");
const files_1 = require("./files");
const account_2 = require("./account");
const offline_1 = require("./offline");
const nftcli_1 = require("./nftcli");
const o1js_1 = require("o1js");
let minaNFT;
let ownerField;
let signature;
let privateKey;
let useArweave = false;
function nft() {
    if (minaNFT === undefined)
        throw new Error("NFT not initialized");
    return minaNFT;
}
exports.nft = nft;
async function reserveName(name, publicKey, account) {
    try {
        if ((0, offline_1.offline)()) {
            const filename = await (0, files_1.write)({
                data: { request: "ReserveName", name, publicKey, account },
                filename: "reservename",
                type: "request",
            });
            if (!filename) {
                console.error(`Error creating name reservation request file`);
                return;
            }
            else {
                console.log(`Created name reservation request file ${filename}, please send it to the online computer and execute on https://minanft.io/tools`);
            }
            return undefined;
        }
        else {
            const JWT = await (0, jwt_1.getJWT)();
            if (JWT === undefined)
                throw new Error("JWT token is not set. Please run 'minanft jwt' command");
            const minanft = new minanft_1.api(JWT);
            const nftName = name[0] === "@" ? name : "@" + name;
            if ((0, debug_1.debug)())
                console.log("reserveName: Reserving name:", { nftName, publicKey });
            const reserved = await minanft.reserveName({
                name: nftName,
                publicKey,
            });
            console.log("Name reservation result:", reserved);
            return reserved;
        }
    }
    catch (e) {
        console.error("Error reserving name:", e);
    }
}
exports.reserveName = reserveName;
async function reserve(name, account) {
    if ((0, debug_1.debug)())
        console.log("Reserving NFT name:\n", { name, account });
    const nftName = name[0] === "@" ? name : "@" + name;
    if (account === undefined || account === "") {
        await (0, account_2.createAccount)({ name: nftName });
    }
    const acc = await (0, account_1.getAccount)(account ?? nftName);
    if (acc === undefined)
        throw new Error(`Account ${account} not found`);
    if (acc.privateKey === undefined || acc.privateKey === "")
        throw new Error(`Account ${account} has no private key`);
    if ((0, debug_1.debug)())
        console.log("Reserving name:", { name, acc, account, nftName });
    const reserved = await reserveName(name, acc.publicKey, account ?? nftName);
    if (!(0, offline_1.offline)()) {
        if (reserved === undefined)
            throw new Error(`Error reserving name ${name}`);
        if (reserved.isReserved) {
            console.log(`Name ${name} has been reserved`);
            await (0, files_1.write)({
                filename: name,
                type: "name",
                data: {
                    name,
                    account: account ?? nftName,
                    address: acc.publicKey,
                    signature: reserved.signature,
                },
            });
        }
        else
            console.error(`Name ${name} has not been reserved: ${reserved.error ?? ""} ${reserved.reason ?? ""}`);
        return reserved;
    }
}
exports.reserve = reserve;
async function createNFT(name, owner, arweave, creator) {
    try {
        if ((0, debug_1.debug)())
            console.log("Creating NFT:\n", { name, owner, arweave });
        useArweave = arweave;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let nameData = undefined;
        try {
            nameData = await (0, files_1.load)({ filename: name, type: "name" });
            if (nameData === undefined) {
                console.log(`Error loading name reservation data, reserving name ${name}...`);
                await reserve(name, undefined);
                nameData = await (0, files_1.load)({ filename: name, type: "name" });
            }
        }
        catch (e) {
            console.log(`Error loading name reservation data, trying to reserve name ${name} one more time, error:`, e);
            await reserve(name, undefined);
            nameData = await (0, files_1.load)({ filename: name, type: "name" });
        }
        if (nameData === undefined)
            throw new Error(`NFT name ${name} not found and cannot be reserved`);
        const nftAccount = await (0, account_1.getAccount)(nameData.account);
        const nftPrivateKey = nftAccount?.privateKey;
        const nftPublicKey = nftAccount?.publicKey;
        if (nftPublicKey === undefined || nftPublicKey === "")
            throw new Error(`NFT account has no public key`);
        if (nftPublicKey !== nameData.address)
            throw new Error(`NFT account public key does not match name data`);
        if ((0, debug_1.debug)())
            console.log("Signature:", nameData.signature);
        signature = nameData.signature;
        if (!owner)
            await (0, account_2.createAccount)({ name: name + ".owner" });
        const ownerAccount = owner
            ? await (0, account_1.getAccount)(owner)
            : await (0, account_1.getAccount)(name + ".owner");
        const ownerPrivateKey = ownerAccount?.privateKey;
        const ownerPublicKey = ownerAccount?.publicKey;
        if (nftPrivateKey === undefined || nftPrivateKey === "")
            throw new Error(`Account ${nameData.account} has no private key`);
        privateKey = nftPrivateKey;
        if (ownerPrivateKey === undefined || ownerPrivateKey === "")
            throw new Error(`Owner account has no private key`);
        if (ownerPublicKey === undefined || ownerPublicKey === "")
            throw new Error(`Owner account has no public key`);
        ownerField = o1js_1.Poseidon.hash(o1js_1.PublicKey.fromBase58(ownerPublicKey).toFields());
        const address = o1js_1.PrivateKey.fromBase58(nftPrivateKey).toPublicKey();
        if (address.toBase58() !== nameData.address)
            throw new Error(`NFT account public key does not match name data`);
        minaNFT = new minanft_1.MinaNFT({
            name,
            address,
            owner: ownerField,
            creator: creator ?? "MinaNFT CLI tool",
        });
        const fields = [
            ...nft().address.toFields(),
            minanft_1.MinaNFT.stringToField(nft().name),
            o1js_1.Field.fromJSON(minanft_1.VERIFICATION_KEY_HASH),
            ...o1js_1.PublicKey.fromBase58(minanft_1.MINANFT_NAME_SERVICE).toFields(),
        ];
        if (signature === undefined)
            throw new Error("Signature is not set");
        const ok = o1js_1.Signature.fromBase58(signature)
            .verify(o1js_1.PublicKey.fromBase58(minanft_1.NAMES_ORACLE), fields)
            .toBoolean();
        if ((0, debug_1.debug)())
            console.log("address", nft().address.toBase58());
        if ((0, debug_1.debug)())
            console.log("name", nft().name);
        if ((0, debug_1.debug)())
            console.log("name service", minanft_1.MINANFT_NAME_SERVICE);
        if (!ok)
            throw new Error(`Signature verification failed`);
        if (arweave) {
            exports.arweaveKey = await (0, jwt_1.getArweaveKey)();
            if (exports.arweaveKey === undefined || exports.arweaveKey === "")
                throw new Error(`Arweave key is not set. Please run 'minanft arweave' command`);
        }
        else {
            exports.pinataJWT = await (0, jwt_1.getPinataJWT)();
            if (exports.pinataJWT === undefined || exports.pinataJWT === "")
                throw new Error(`Pinata JWT token is not set. Please run 'minanft pinata' command`);
        }
        console.log("After adding metadata and files, execute mint command.");
        console.log("To exit without minting, execute exit command.");
        console.log(`
  Commands:
  key [options] <key> <value>  Add key-value pair to NFT
  image [options] <file>       Add image to NFT
  file [options] <key> <file>  Add file to NFT
  text [options] <key> <text>  Add text to NFT
  description <text>           Add description to NFT
  help [command]               display help for command
  mint                         Mint NFT
  exit                         Exit without minting
    `);
        await (0, nftcli_1.getCommands)();
    }
    catch (e) {
        console.error("Error creating NFT:", e);
    }
}
exports.createNFT = createNFT;
async function mint() {
    try {
        if ((0, offline_1.offline)()) {
            const uri = nft().exportToString({
                increaseVersion: true,
                includePrivateData: false,
            });
            const filename = await (0, files_1.write)({
                data: { request: "mint", uri, signature, privateKey, useArweave },
                filename: "mint",
                type: "request",
            });
            if (!filename) {
                console.error(`Error creating mint request file`);
                return;
            }
            else {
                console.log(`Created mint request file ${filename}, please send it to the online computer and execute on https://minanft.io/tools`);
                const uri = nft().exportToJSON(true);
                await (0, files_1.write)({ filename: nft().name, type: "nft", data: uri });
            }
        }
        else {
            minanft_1.MinaNFT.minaInit("testworld2");
            const deployer = await (0, account_1.getAccount)("deployer");
            if (deployer === undefined)
                throw new Error("Deployer account not found");
            if (deployer.privateKey === undefined || deployer.privateKey === "")
                throw new Error("Deployer account has no private key");
            if (ownerField === undefined)
                throw new Error("Owner is not set");
            if (signature === undefined)
                throw new Error("Signature is not set");
            if (privateKey === undefined)
                throw new Error("Private key is not set");
            const deployerPrivateKey = o1js_1.PrivateKey.fromBase58(deployer.privateKey);
            const nameServiceAddress = o1js_1.PublicKey.fromBase58(minanft_1.MINANFT_NAME_SERVICE);
            const nameService = new minanft_1.MinaNFTNameService({
                address: nameServiceAddress,
            });
            minanft_1.Memory.info(`before minting`);
            const tx = await nft().mint({
                deployer: deployerPrivateKey,
                owner: ownerField,
                pinataJWT: exports.pinataJWT,
                arweaveKey: exports.arweaveKey,
                nameService,
                signature: o1js_1.Signature.fromBase58(signature),
                privateKey: o1js_1.PrivateKey.fromBase58(privateKey),
            });
            if (tx === undefined)
                throw new Error("Error minting NFT: cannot send transaction");
            minanft_1.Memory.info(`minted`);
            const uri = nft().exportToJSON(false);
            await (0, files_1.write)({ filename: nft().name, type: "nft", data: uri });
        }
    }
    catch (e) {
        console.error("Error minting NFT:", e);
    }
}
exports.mint = mint;
async function indexName(name) {
    if ((0, offline_1.offline)())
        throw new Error("Cannot index NFT in offline mode");
    const JWT = await (0, jwt_1.getJWT)();
    if (JWT === undefined)
        throw new Error("JWT token is not set. Please run 'minanft jwt' command");
    const minanft = new minanft_1.api(JWT);
    const nftName = name[0] === "@" ? name : "@" + name;
    if ((0, debug_1.debug)())
        console.log("indexName: Indexing name:", { nftName });
    const indexed = await minanft.indexName({ name });
    console.log("NFT indexation result:\n", indexed);
}
exports.indexName = indexName;
