"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeFromJSON = exports.treeToJSON = void 0;
const o1js_1 = require("o1js");
const zkcloudworker_1 = require("zkcloudworker");
function treeToJSON(tree) {
    const nodes = {};
    for (const level in tree.nodes) {
        const node = [];
        for (const index in tree.nodes[level]) {
            node.push((0, zkcloudworker_1.bigintToBase64)(BigInt(index)));
            node.push((0, zkcloudworker_1.fieldToBase64)(tree.nodes[level][index]));
        }
        nodes[level] = node.join(".");
    }
    return {
        height: tree.height,
        nodes,
    };
}
exports.treeToJSON = treeToJSON;
function treeFromJSON(json) {
    const tree = new o1js_1.MerkleTree(json.height);
    function setNode(level, index, value) {
        (tree.nodes[level] ??= {})[index.toString()] = value;
    }
    for (const level in json.nodes) {
        const node = json.nodes[level].split(".");
        for (let i = 0; i < node.length; i += 2) {
            setNode(parseInt(level), (0, zkcloudworker_1.bigintFromBase64)(node[i]), (0, zkcloudworker_1.fieldFromBase64)(node[i + 1]));
        }
    }
    return tree;
}
exports.treeFromJSON = treeFromJSON;
