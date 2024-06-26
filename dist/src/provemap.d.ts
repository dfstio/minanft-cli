import { FileType } from "./model/fileData";
export declare function proveMap(params: {
    name: string;
    keys: string[];
    nftType: FileType;
}): Promise<void>;
export declare function getKeys(uri: any, keys: string[]): {
    key: string;
    value: string;
}[];
