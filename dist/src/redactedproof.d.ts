import { Field } from "o1js";
import { RedactedFileEncoding, FileTreeData } from "./model/fileData";
export declare function redactedProof(originalFilename: string, maskFilename: string | undefined, redactedFilename: string | undefined, type: RedactedFileEncoding): Promise<void>;
export declare function getRedactedText(originalText: string, maskFilename: string | undefined, redactedFilename: string | undefined): Promise<string>;
export declare function verifyRedactedProof(name: string, png: string | undefined): Promise<void>;
export declare function verifyRedactedPNGProofJSON(proof: any, name: string, png: string): Promise<boolean>;
export declare function verifyRedactedTextProofJSON(proof: any, name: string): Promise<boolean>;
export declare function generateRedactedTextProof(originalText: string, redactedText: string): Promise<{
    length: number;
    height: number;
    count: number;
    redactedText: string;
    originalRoot: string;
    redactedRoot: string;
    proof: any;
}>;
export declare function generateRedactedBinaryProof(original: FileTreeData, redacted: FileTreeData): Promise<{
    length: number;
    height: number;
    count: number;
    originalRoot: string;
    redactedRoot: string;
    proof: any;
}>;
export declare function loadBinaryTree(filename: string, skipZeros?: boolean): Promise<FileTreeData>;
export declare function loadBinaryTreeFromFields(fields: Field[], skipZeros?: boolean): FileTreeData;
