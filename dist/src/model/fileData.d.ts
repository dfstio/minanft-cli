import { MerkleTree, Field } from "o1js";
export type FileType = "account" | "name" | "nft" | "request" | "map" | "result" | "proof" | "mask" | "jwt";
export interface FileData {
    filename: string;
    type: FileType;
    timestamp: number;
    iv?: string;
    data: any;
}
export type FileEncoding = "text" | "binary";
export type RedactedFileEncoding = "text" | "png";
export interface FileTreeData {
    root: Field;
    height: number;
    leavesNumber: number;
    tree: MerkleTree;
    fields: Field[];
    count: number;
    hash: Field;
}
