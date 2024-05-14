/// <reference types="node" />
import { FileType } from "./model/fileData";
export declare function write(params: {
    data: any;
    filename: string;
    type: FileType;
    allowRewrite?: boolean;
    password?: string;
}): Promise<string | undefined>;
export declare function save(params: {
    data: any;
    filename: string;
    type: FileType;
    allowRewrite?: boolean;
}): Promise<string | undefined>;
export declare function load(params: {
    filename: string;
    type: FileType;
    password?: string;
}): Promise<any>;
export declare function isFileExist(params: {
    filename: string;
    type: FileType;
}): Promise<boolean>;
export declare function loadPlain(params: {
    filename: string;
    type: FileType;
}): Promise<any>;
export declare function loadBinary(filename: string): Promise<string | undefined>;
export declare function loadText(filename: string): Promise<string | undefined>;
export declare function saveBinary(params: {
    data: Buffer;
    filename: string;
}): Promise<void>;
export declare function saveText(params: {
    data: string;
    filename: string;
}): Promise<void>;
export declare function changePassword(filename: string, type: FileType, oldPwd: string, newPwd: string): Promise<undefined>;
