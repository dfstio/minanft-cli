import AccountData from "./model/accountData";
export declare function createAccount(params: {
    name: string;
    privateKey?: string;
    publicKey?: string;
}): Promise<void>;
export declare function exportAccount(name: string): Promise<void>;
export declare function getAccount(name: string): Promise<AccountData | undefined>;
export declare function balance(name: string): Promise<void>;
