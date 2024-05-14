import { FileType } from "../model/fileData";
export declare function proveRollupMap(params: {
    name: string;
    keys: string[];
    nftType: FileType;
    onChain: boolean;
}): Promise<void>;
export declare function getKeys(uri: any, keys: string[]): {
    key: string;
    value: string;
}[];
