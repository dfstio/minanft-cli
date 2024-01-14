export declare function setJWT(jwt: string): Promise<void>;
export declare function setPinataJWT(jwt: string): Promise<void>;
export declare function setArweaveKey(jwt: string): Promise<void>;
export declare function getJWT(): Promise<string | undefined>;
export declare function getArweaveKey(): Promise<string | undefined>;
export declare function getPinataJWT(): Promise<string | undefined>;
export declare function exportJWT(): Promise<void>;
