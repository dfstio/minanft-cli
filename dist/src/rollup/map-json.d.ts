import { MerkleTree } from "o1js";
export declare function treeToJSON(tree: MerkleTree): {
    height: number;
    nodes: {
        [key: string]: string;
    };
};
export declare function treeFromJSON(json: any): MerkleTree;
