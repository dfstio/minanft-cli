"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFromIPFS = exports.saveToIPFS = void 0;
const axios_1 = __importDefault(require("axios"));
const zkcloudworker_1 = require("zkcloudworker");
const ipfsData = {};
let useLocalIpfsData = false;
async function saveToIPFS(params) {
    const { data, pinataJWT, name, keyvalues } = params;
    //console.log("saveToIPFS:", { name });
    if (pinataJWT === "local") {
        const hash = (0, zkcloudworker_1.makeString)(`QmTosaezLecDB7bAoUoXcrJzeBavHNZyPbPff1QHWw8xus`.length);
        ipfsData[hash] = data;
        useLocalIpfsData = true;
        return hash;
    }
    try {
        const pinataData = {
            pinataOptions: {
                cidVersion: 1,
            },
            pinataMetadata: {
                name,
                keyvalues,
            },
            pinataContent: data,
        };
        const str = JSON.stringify(pinataData);
        const auth = "Bearer " + pinataJWT ?? "";
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: auth,
            },
        };
        if (auth === "Bearer ")
            //for running tests
            return `QmTosaezLecDB7bAoUoXcrJzeBavHNZyPbPff1QHWw8xus`;
        const res = await axios_1.default.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", str, config);
        console.log("saveToIPFS result:", { result: res.data, name, keyvalues });
        return res.data.IpfsHash;
    }
    catch (error) {
        console.error("saveToIPFS error:", error?.message, { name, keyvalues });
        return undefined;
    }
}
exports.saveToIPFS = saveToIPFS;
async function loadFromIPFS(hash) {
    if (useLocalIpfsData) {
        return ipfsData[hash];
    }
    try {
        const url = "https://salmon-effective-amphibian-898.mypinata.cloud/ipfs/" +
            hash +
            "?pinataGatewayToken=gFuDmY7m1Pa5XzZ3bL1TjPPvO4Ojz6tL-VGIdweN1fUa5oSFZXce3y9mL8y1nSSU";
        //"https://gateway.pinata.cloud/ipfs/" + hash;
        const result = await axios_1.default.get(url);
        return result.data;
    }
    catch (error) {
        console.error("loadFromIPFS error:", error?.message);
        return undefined;
    }
}
exports.loadFromIPFS = loadFromIPFS;
