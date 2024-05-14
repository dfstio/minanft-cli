import { MinaNFT } from "minanft";
export declare let arweaveKey: string | undefined;
export declare let pinataJWT: string | undefined;
export declare function nft(): MinaNFT;
export declare function reserveName(name: string, publicKey: string, account: string): Promise<{
    success: boolean;
    error?: string | undefined;
    price: object;
    isReserved: boolean;
    signature?: string | undefined;
    reason?: string | undefined;
} | undefined>;
export declare function reserve(name: string, account: string | undefined): Promise<{
    success: boolean;
    error?: string | undefined;
    price: object;
    isReserved: boolean;
    signature?: string | undefined;
    reason?: string | undefined;
} | undefined>;
export declare function createNFT(name: string, owner: string | undefined, arweave: boolean, creator: string | undefined): Promise<void>;
export declare function mint(): Promise<void>;
export declare function indexName(name: string): Promise<void>;
