"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportJWT = exports.getPinataJWT = exports.getArweaveKey = exports.getJWT = exports.setArweaveKey = exports.setPinataJWT = exports.setJWT = void 0;
const files_1 = require("./files");
const debug_1 = require("./debug");
async function setJWT(jwt) {
    if ((0, debug_1.debug)())
        console.log("Setting JWT:\n", { jwt });
    try {
        await (0, files_1.write)({
            data: { jwt },
            filename: "minanft",
            type: "jwt",
            allowRewrite: true,
        });
        console.log(`MinaNFT JWT token has been set`);
    }
    catch (e) {
        console.error(e);
    }
}
exports.setJWT = setJWT;
async function setPinataJWT(jwt) {
    if ((0, debug_1.debug)())
        console.log("Setting Pinata JWT:\n", { jwt });
    try {
        await (0, files_1.write)({
            data: { jwt },
            filename: "pinata",
            type: "jwt",
            allowRewrite: true,
        });
        console.log(`Pinata JWT token has been set`);
    }
    catch (e) {
        console.error(e);
    }
}
exports.setPinataJWT = setPinataJWT;
async function setArweaveKey(jwt) {
    if ((0, debug_1.debug)())
        console.log("Setting Arweave key\n", { jwt });
    try {
        await (0, files_1.write)({
            data: { jwt },
            filename: "arweave",
            type: "jwt",
            allowRewrite: true,
        });
        console.log(`Arweave key has been set`);
    }
    catch (e) {
        console.error(e);
    }
}
exports.setArweaveKey = setArweaveKey;
async function getJWT() {
    try {
        const data = await (0, files_1.load)({ filename: "minanft", type: "jwt" });
        if ((0, debug_1.debug)())
            console.log("JWT data:", data);
        return data?.jwt;
    }
    catch (e) {
        console.error("Error reading ./data/minanft.jwt.json file:", e);
        return undefined;
    }
}
exports.getJWT = getJWT;
async function getArweaveKey() {
    try {
        const data = await (0, files_1.load)({ filename: "arweave", type: "jwt" });
        if ((0, debug_1.debug)())
            console.log("JWT data:", data);
        return data?.jwt;
    }
    catch (e) {
        console.error("Error reading ./data/arweave.jwt.json file:", e);
        return undefined;
    }
}
exports.getArweaveKey = getArweaveKey;
async function getPinataJWT() {
    try {
        const data = await (0, files_1.load)({ filename: "pinata", type: "jwt" });
        if ((0, debug_1.debug)())
            console.log("JWT data:", data);
        return data?.jwt;
    }
    catch (e) {
        console.error("Error reading ./data/pinata.jwt.json file:", e);
        return undefined;
    }
}
exports.getPinataJWT = getPinataJWT;
async function exportJWT() {
    const jwt = await getJWT();
    if (jwt === undefined)
        console.error("JWT token is not set");
    else
        console.log(jwt);
}
exports.exportJWT = exportJWT;
