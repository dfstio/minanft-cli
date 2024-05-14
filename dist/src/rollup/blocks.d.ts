import { blockchain } from "minanft";
import { Field, MerkleMap } from "o1js";
import { RollupNftName } from "./contract";
export declare function blocks(startBlock: string | undefined): Promise<void>;
export declare function nameInfo(rollupNFTname: string): Promise<void>;
export declare function listNames(): Promise<void>;
type BlockType = "last" | "validated" | "proved";
export declare function getBlock(params: {
    contractAddress: string;
    chain: blockchain;
    blockType: BlockType;
}): Promise<{
    address: string;
    blockNumber: number;
    database: {
        [name: string]: string;
    };
    mapIPFS: string;
    root: Field;
}>;
export declare function getDatabase(params: {
    contractAddress: string;
    chain: blockchain;
    blockType: BlockType;
}): Promise<{
    [name: string]: string;
}>;
export declare function getMap(params: {
    contractAddress: string;
    chain: blockchain;
    blockType: BlockType;
} | string): Promise<MerkleMap>;
export declare function getNameInfo(params: {
    chain: blockchain;
    contractAddress: string;
    name: string;
    blockType?: BlockType;
}): Promise<{
    name: string;
    address: string;
    ipfs: string;
    uri: string;
    url: string;
    nft: any;
    fields: string;
    rollupNFT: RollupNftName;
}>;
export {};
