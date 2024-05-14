"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNames = exports.nameInfo = exports.blocks = void 0;
const debug_1 = require("./debug");
const minanft_1 = require("minanft");
const o1js_1 = require("o1js");
const contract_1 = require("./rollup/contract");
const zkcloudworker_1 = require("zkcloudworker");
const storage_1 = require("./rollup/storage");
const contractAddress = "B62qo2gLfhzbKpSQw3G7yQaajEJEmxovqm5MBRb774PdJUw6a7XnNFT";
const chain = "zeko";
async function blocks() {
    if ((0, debug_1.debug)())
        console.log("blocks");
    const info = await getBlocksInfo({ contractAddress, chain });
    console.log("blocks info:", info);
    return;
}
exports.blocks = blocks;
async function nameInfo(name) {
    if ((0, debug_1.debug)())
        console.log("name info");
    const info = await getNameInfo({ contractAddress, chain, name });
    console.log("name info:", info);
}
exports.nameInfo = nameInfo;
async function listNames() {
    if ((0, debug_1.debug)())
        console.log("list names");
    const database = await getDatabase({ contractAddress, chain });
    const names = Object.keys(database);
    console.log("names:", names);
}
exports.listNames = listNames;
async function getBlocksInfo(params) {
    const MAX_BLOCKS = 10;
    try {
        let startBlock = params.startBlock
            ? o1js_1.PublicKey.fromBase58(params.startBlock)
            : undefined;
        let contractAddress = o1js_1.PublicKey.fromBase58(params.contractAddress);
        await (0, o1js_1.initializeBindings)();
        await (0, minanft_1.initBlockchain)(params.chain);
        const zkApp = new contract_1.RollupContract(contractAddress);
        const tokenId = zkApp.deriveTokenId();
        await (0, minanft_1.fetchMinaAccount)({
            publicKey: contractAddress,
        });
        if (!o1js_1.Mina.hasAccount(contractAddress)) {
            console.error(`getBlocksInfo: Contract ${contractAddress.toBase58()} not found`);
            return `error: Contract ${contractAddress.toBase58()} not found`;
        }
        if (startBlock === undefined) {
            startBlock = contract_1.LastBlock.unpack(zkApp.lastCreatedBlock.get()).address;
        }
        await (0, minanft_1.fetchMinaAccount)({ publicKey: startBlock, tokenId });
        if (!o1js_1.Mina.hasAccount(startBlock, tokenId)) {
            console.error(`getBlocksInfo: Block ${startBlock.toBase58()} not found`);
            return `error: Block ${startBlock.toBase58()} not found`;
        }
        let count = 0;
        const validatorsPacked = zkApp.validatorsPacked.get();
        const lastCreatedBlock = contract_1.LastBlock.unpack(zkApp.lastCreatedBlock.get());
        const lastValidatedBlock = contract_1.LastBlock.unpack(zkApp.lastValidatedBlock.get());
        const lastProvedBlock = contract_1.LastBlock.unpack(zkApp.lastProvedBlock.get());
        const contractState = {
            domain: o1js_1.Encoding.stringFromFields([zkApp.domain.get()]),
            validatorsPacked: validatorsPacked.toJSON(),
            lastCreatedBlock: {
                address: lastCreatedBlock.address.toBase58(),
                blockNumber: Number(lastCreatedBlock.blockNumber.toBigInt()),
            },
            lastValidatedBlock: {
                address: lastValidatedBlock.address.toBase58(),
                blockNumber: Number(lastValidatedBlock.blockNumber.toBigInt()),
            },
            lastProvedBlock: {
                address: lastProvedBlock.address.toBase58(),
                blockNumber: Number(lastProvedBlock.blockNumber.toBigInt()),
            },
        };
        let blockAddress = startBlock;
        let block = new contract_1.BlockContract(blockAddress, tokenId);
        let blockNumber = Number(block.blockNumber.get().toBigInt());
        const blocks = [];
        while (count < MAX_BLOCKS && blockNumber > 0) {
            const root = block.root.get().toJSON();
            const storage = block.storage.get().toIpfsHash();
            const flags = contract_1.BlockParams.unpack(block.blockParams.get());
            const isValidated = flags.isValidated.toBoolean();
            const isInvalid = flags.isInvalid.toBoolean();
            const isProved = flags.isProved.toBoolean();
            const isFinal = flags.isFinal.toBoolean();
            const timeCreated = new Date(Number(flags.timeCreated.toBigInt())).toLocaleString();
            const txsCount = Number(flags.txsCount.toBigint());
            const txsHash = block.txsHash.get().toJSON();
            const previousBlockAddress = block.previousBlock.get();
            blocks.push({
                blockNumber,
                blockAddress: blockAddress.toBase58(),
                root,
                ipfs: storage,
                isValidated,
                isInvalid,
                isProved,
                isFinal,
                timeCreated,
                txsCount,
                txsHash,
                previousBlockAddress: previousBlockAddress.toBase58(),
            });
            blockAddress = previousBlockAddress;
            block = new contract_1.BlockContract(blockAddress, tokenId);
            await (0, minanft_1.fetchMinaAccount)({
                publicKey: blockAddress,
                tokenId,
                force: true,
            });
            blockNumber = Number(block.blockNumber.get().toBigInt());
            count++;
        }
        const result = {
            contractAddress: contractAddress.toBase58(),
            startBlock: startBlock.toBase58(),
            blocks,
            contractState,
        };
        return result;
    }
    catch (error) {
        console.error("Error in getBlocksInfo", error);
        return "Error in getBlocksInfo";
    }
}
async function getDatabase(params) {
    if ((0, debug_1.debug)())
        console.log("getNameInfo", params);
    try {
        let contractAddress = o1js_1.PublicKey.fromBase58(params.contractAddress);
        await (0, o1js_1.initializeBindings)();
        await (0, minanft_1.initBlockchain)(params.chain);
        const zkApp = new contract_1.RollupContract(contractAddress);
        const tokenId = zkApp.deriveTokenId();
        await (0, minanft_1.fetchMinaAccount)({
            publicKey: contractAddress,
        });
        if (!o1js_1.Mina.hasAccount(contractAddress)) {
            throw new Error(`getNameInfo: Contract ${contractAddress.toBase58()} not found`);
        }
        const startBlock = contract_1.LastBlock.unpack(zkApp.lastCreatedBlock.get()).address;
        await (0, minanft_1.fetchMinaAccount)({ publicKey: startBlock, tokenId });
        if (!o1js_1.Mina.hasAccount(startBlock, tokenId)) {
            throw new Error(`getNameInfo: Block ${startBlock.toBase58()} not found`);
        }
        let blockAddress = startBlock;
        let block = new contract_1.BlockContract(blockAddress, tokenId);
        const storage = block.storage.get().toIpfsHash();
        if ((0, debug_1.debug)())
            console.log("storage:", storage);
        const data = await (0, storage_1.loadFromIPFS)(storage);
        if ((0, debug_1.debug)())
            console.log("data:", data);
        const databaseIPFS = data.database.slice(2);
        const database = await (0, storage_1.loadFromIPFS)(databaseIPFS);
        if ((0, debug_1.debug)())
            console.log("database:", database);
        return database.database;
    }
    catch (error) {
        console.error("Error in getBlocksInfo", error);
        throw new Error("Error in getBlocksInfo");
    }
}
async function getNameInfo(params) {
    try {
        const { contractAddress, chain, name } = params;
        const database = await getDatabase({ contractAddress, chain });
        let serializedDomain = database[name];
        if (!serializedDomain) {
            serializedDomain = database["@" + name];
            if (!serializedDomain) {
                console.log("Names:", Object.keys(database));
                throw new Error(`Name ${name} not found`);
            }
        }
        const domain = contract_1.RollupNftName.fromFields((0, zkcloudworker_1.deserializeFields)(serializedDomain));
        const ipfs = domain.data.storage.toIpfsHash();
        const uri = "https://gateway.pinata.cloud/ipfs/" + ipfs;
        const url = "https://minanft.io/nft/i" + ipfs;
        const nft = await (0, storage_1.loadFromIPFS)(ipfs);
        const address = domain.data.address.toBase58();
        const expiry = domain.data.expiry.toBigInt().toString();
        const data = { name, address, ipfs, expiry, uri, url, nft };
        return data;
    }
    catch (error) {
        console.error("Error in getMetadata", error);
        return "Error in getMetadata";
    }
}
