"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balance = exports.getAccount = exports.exportAccount = exports.createAccount = void 0;
const o1js_1 = require("o1js");
const files_1 = require("./files");
const debug_1 = require("./debug");
const offline_1 = require("./offline");
const minanft_1 = require("minanft");
const mina_1 = require("./mina");
async function createAccount(params) {
    const { name, privateKey, publicKey } = params;
    if ((0, debug_1.debug)())
        console.log("Creating account:\n", { name, privateKey, publicKey });
    try {
        let sk = privateKey ?? "";
        let pk = publicKey ?? "";
        if (!privateKey && !publicKey)
            sk = o1js_1.PrivateKey.random().toBase58();
        if (!publicKey)
            pk = o1js_1.PrivateKey.fromBase58(sk).toPublicKey().toBase58();
        else if (privateKey &&
            o1js_1.PrivateKey.fromBase58(sk).toPublicKey().toBase58() !== publicKey) {
            console.error("Private and public keys do not match");
            return;
        }
        const acc = {
            publicKey: pk,
            privateKey: sk,
        };
        await (0, files_1.write)({ data: acc, filename: name, type: "account" });
    }
    catch (e) {
        console.error(e);
    }
}
exports.createAccount = createAccount;
async function exportAccount(name) {
    const acc = await (0, files_1.load)({ filename: name, type: "account" });
    console.log(acc);
}
exports.exportAccount = exportAccount;
async function getAccount(name) {
    const acc = await (0, files_1.load)({ filename: name, type: "account" });
    return acc;
}
exports.getAccount = getAccount;
async function balance(name) {
    try {
        const acc = await (0, files_1.load)({ filename: name, type: "account" });
        if ((0, offline_1.offline)()) {
            const filename = await (0, files_1.write)({
                data: { request: "balance", name, publicKey: acc.publicKey },
                filename: "balance",
                type: "request",
            });
            if (!filename) {
                console.error(`Error creating balance request file`);
                return;
            }
            else {
                console.log(`Created balance request file ${filename}, please send it to the online computer and execute on https://minanft.io/tools`);
            }
        }
        else {
            (0, mina_1.init)();
            const balance = await (0, minanft_1.accountBalanceMina)(o1js_1.PublicKey.fromBase58(acc.publicKey));
            console.log(`Balance of ${acc.publicKey} is ${balance} MINA`);
        }
    }
    catch (e) {
        console.error(`Error receiving balance of the account`, e);
    }
}
exports.balance = balance;
