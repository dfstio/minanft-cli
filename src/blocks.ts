import { debug } from "./debug";
import { blockchain, fetchMinaAccount, initBlockchain } from "minanft";
import {
  PublicKey,
  Mina,
  initializeBindings,
  Encoding,
  Field,
  MerkleMap,
} from "o1js";
import {
  RollupContract,
  LastBlock,
  BlockContract,
  BlockParams,
  RollupNftName,
  Metadata,
} from "./rollup/contract";
import { deserializeFields } from "zkcloudworker";
import { loadFromIPFS } from "./rollup/storage";
import { treeFromJSON } from "./rollup/map-json";

const contractAddress =
  "B62qo2gLfhzbKpSQw3G7yQaajEJEmxovqm5MBRb774PdJUw6a7XnNFT";
const chain: blockchain = "zeko";

export async function blocks(startBlock: string | undefined) {
  if (debug()) console.log("blocks");
  const info = await getBlocksInfo({ contractAddress, chain, startBlock });
  console.log("blocks info:", info);
  return;
}

export async function nameInfo(name: string) {
  if (debug()) console.log("name info");
  const info = await getNameInfo({ contractAddress, chain, name });
  console.log("name info:", info);
}

export async function listNames() {
  if (debug()) console.log("list names");
  const database = await getDatabase({
    contractAddress,
    chain,
    blockType: "last",
  });
  const names = Object.keys(database);
  console.log("names:", names);
}

async function getBlocksInfo(params: {
  contractAddress: string;
  startBlock?: string;
  chain: blockchain;
}) {
  const MAX_BLOCKS = 10;
  try {
    await initializeBindings();
    await initBlockchain(params.chain);
    let startBlock: PublicKey | undefined = undefined;
    let contractAddress: PublicKey = PublicKey.fromBase58(
      params.contractAddress
    );
    if (params.startBlock) {
      try {
        startBlock = PublicKey.fromBase58(params.startBlock);
      } catch (error) {
        console.error(
          "Wrong start block address, should be public key of the block",
          error
        );
        return "Error in getBlocksInfo";
      }
    }

    const zkApp = new RollupContract(contractAddress);
    const tokenId = zkApp.deriveTokenId();
    await fetchMinaAccount({
      publicKey: contractAddress,
    });
    if (!Mina.hasAccount(contractAddress)) {
      console.error(
        `getBlocksInfo: Contract ${contractAddress.toBase58()} not found`
      );
      return `error: Contract ${contractAddress.toBase58()} not found`;
    }
    if (startBlock === undefined) {
      startBlock = LastBlock.unpack(zkApp.lastCreatedBlock.get()).address;
    }
    await fetchMinaAccount({ publicKey: startBlock, tokenId });
    if (!Mina.hasAccount(startBlock, tokenId)) {
      console.error(`getBlocksInfo: Block ${startBlock.toBase58()} not found`);
      return `error: Block ${startBlock.toBase58()} not found`;
    }
    let count = 0;
    const validatorsPacked = zkApp.validatorsPacked.get();
    const lastCreatedBlock = LastBlock.unpack(zkApp.lastCreatedBlock.get());
    const lastValidatedBlock = LastBlock.unpack(zkApp.lastValidatedBlock.get());
    const lastProvedBlock = LastBlock.unpack(zkApp.lastProvedBlock.get());
    const contractState = {
      domain: Encoding.stringFromFields([zkApp.domain.get()]),
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
    let block = new BlockContract(blockAddress, tokenId);
    let blockNumber = Number(block.blockNumber.get().toBigInt());
    const blocks: {}[] = [];
    while (count < MAX_BLOCKS && blockNumber > 0) {
      const root = block.root.get().toJSON();
      const storage = block.storage.get().toIpfsHash();
      const flags = BlockParams.unpack(block.blockParams.get());
      const isValidated = flags.isValidated.toBoolean();
      const isInvalid = flags.isInvalid.toBoolean();
      const isProved = flags.isProved.toBoolean();
      const isFinal = flags.isFinal.toBoolean();
      const timeCreated = new Date(
        Number(flags.timeCreated.toBigInt())
      ).toLocaleString();
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
      block = new BlockContract(blockAddress, tokenId);
      await fetchMinaAccount({
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
  } catch (error) {
    console.error("Error in getBlocksInfo", error);
    return "Error in getBlocksInfo";
  }
}
type BlockType = "last" | "validated" | "proved";

async function getBlock(params: {
  contractAddress: string;
  chain: blockchain;
  blockType: BlockType;
}): Promise<{
  database: { [name: string]: string };
  mapIPFS: string;
  root: Field;
}> {
  const { blockType } = params;
  if (debug()) console.log("getNameInfo", params);
  try {
    await initializeBindings();
    await initBlockchain(params.chain);
    let contractAddress: PublicKey = PublicKey.fromBase58(
      params.contractAddress
    );

    const zkApp = new RollupContract(contractAddress);
    const tokenId = zkApp.deriveTokenId();
    await fetchMinaAccount({
      publicKey: contractAddress,
    });
    if (!Mina.hasAccount(contractAddress)) {
      throw new Error(
        `getNameInfo: Contract ${contractAddress.toBase58()} not found`
      );
    }
    const startBlock =
      blockType === "last"
        ? LastBlock.unpack(zkApp.lastCreatedBlock.get()).address
        : blockType === "validated"
        ? LastBlock.unpack(zkApp.lastValidatedBlock.get()).address
        : blockType === "proved"
        ? LastBlock.unpack(zkApp.lastProvedBlock.get()).address
        : undefined;
    if (startBlock === undefined) throw new Error("Wrong block type");

    await fetchMinaAccount({ publicKey: startBlock, tokenId });
    if (!Mina.hasAccount(startBlock, tokenId)) {
      throw new Error(`getNameInfo: Block ${startBlock.toBase58()} not found`);
    }
    let blockAddress = startBlock;
    let block = new BlockContract(blockAddress, tokenId);
    const storage = block.storage.get().toIpfsHash();
    const root = block.root.get();
    if (debug()) console.log("storage:", storage);
    const data = await loadFromIPFS(storage);
    if (debug()) console.log("data:", data);
    const databaseIPFS = data.database.slice(2);
    const database = await loadFromIPFS(databaseIPFS);
    if (debug()) console.log("database:", database);
    return {
      database: database.database,
      mapIPFS: database.map.slice(2),
      root,
    };
  } catch (error) {
    console.error("Error in getBlocksInfo", error);
    throw new Error("Error in getBlocksInfo");
  }
}

async function getDatabase(params: {
  contractAddress: string;
  chain: blockchain;
  blockType: BlockType;
}): Promise<{ [name: string]: string }> {
  const { contractAddress, chain, blockType } = params;
  const block = await getBlock({
    contractAddress,
    chain,
    blockType,
  });
  return block.database;
}

async function getMap(params: {
  contractAddress: string;
  chain: blockchain;
  blockType: BlockType;
}): Promise<MerkleMap> {
  const { contractAddress, chain, blockType } = params;
  const block = await getBlock({
    contractAddress,
    chain,
    blockType,
  });

  const mapJson = await loadFromIPFS(block.mapIPFS);
  const map = new MerkleMap();
  map.tree = treeFromJSON(mapJson.map);
  return map;
}

async function getNameInfo(params: {
  chain: blockchain;
  contractAddress: string;
  name: string;
  blockType?: BlockType;
}) {
  try {
    const { contractAddress, chain, name } = params;
    const blockType = params.blockType ?? "last";
    const database = await getDatabase({ contractAddress, chain, blockType });
    let serializedDomain = database[name];
    if (!serializedDomain) {
      serializedDomain = database["@" + name];
      if (!serializedDomain) {
        console.log("Names:", Object.keys(database));
        throw new Error(`Name ${name} not found`);
      }
    }
    const domain = RollupNftName.fromFields(
      deserializeFields(serializedDomain)
    );
    const ipfs = domain.data.storage.toIpfsHash();
    const uri = "https://gateway.pinata.cloud/ipfs/" + ipfs;
    const url = "https://minanft.io/nft/i" + ipfs;
    const nft = await loadFromIPFS(ipfs);
    const address = domain.data.address.toBase58();
    const expiry = domain.data.expiry.toBigInt().toString();
    const data = { name, address, ipfs, expiry, uri, url, nft };
    return data;
  } catch (error) {
    console.error("Error in getMetadata", error);
    return "Error in getMetadata";
  }
}
