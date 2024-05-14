export declare function saveToIPFS(params: {
    data: any;
    pinataJWT: string;
    name: string;
    keyvalues?: object;
}): Promise<string | undefined>;
export declare function loadFromIPFS(hash: string): Promise<any | undefined>;
