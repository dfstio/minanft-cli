export declare function proveTextFile(name: string, key: string, mask: string | undefined, redacted: string | undefined): Promise<void>;
export declare function getTextByKey(name: string, key: string): Promise<{
    originalText: string;
    uri: any;
    fileJSON: {
        key: string;
        value: any;
    };
}>;
export declare function getText(uri: any, file: string): {
    key: string;
    value: any;
} | undefined;
