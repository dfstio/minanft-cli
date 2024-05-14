export declare function provePNGFile(name: string, key: string, originalFilename: string, redactedFilename: string): Promise<void>;
export declare function getPNGByKey(name: string, key: string): Promise<{
    uri: any;
    fileJSON: {
        key: string;
        value: any;
    };
}>;
export declare function getPNG(uri: any, file: string): {
    key: string;
    value: any;
} | undefined;
