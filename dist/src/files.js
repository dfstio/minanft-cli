"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.saveText = exports.saveBinary = exports.loadText = exports.loadBinary = exports.loadPlain = exports.isFileExist = exports.load = exports.save = exports.write = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const crypto_1 = __importDefault(require("crypto"));
const debug_1 = require("./debug");
const password_1 = require("./password");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function write(params) {
    const { data, filename, type, allowRewrite, password } = params;
    const folder = type === "request" ? "./requests/" : "./data/";
    const name = folder +
        (type === "request" ? getFormattedDateTime() + "." : "") +
        filename +
        "." +
        type +
        ".json";
    try {
        await createDirectories();
        if ((0, debug_1.debug)())
            console.log("Writing file", {
                data,
                filename,
                type,
                allowRewrite,
            });
        if (!allowRewrite && (await isExist(name))) {
            console.error(`File ${name} already exists`);
            return;
        }
        await backup(filename, type);
        const pwd = password ?? (0, password_1.password)();
        let encryptedData = undefined;
        if (pwd && type !== "request")
            encryptedData = encrypt(JSON.stringify(data), pwd);
        const filedata = {
            filename,
            type,
            timestamp: Date.now(),
            data: encryptedData ? encryptedData.encryptedData : data,
        };
        if (encryptedData)
            filedata.iv = encryptedData.iv;
        await promises_1.default.writeFile(name, JSON.stringify(filedata, null, 2));
        return name;
    }
    catch (e) {
        console.error(`Error writing file ${name}`);
        return undefined;
    }
}
exports.write = write;
async function save(params) {
    const { data, filename, type, allowRewrite } = params;
    const folder = type === "request" ? "./requests/" : "./data/";
    const name = folder +
        (type === "request" ? getFormattedDateTime() + "." : "") +
        filename +
        "." +
        type +
        ".json";
    try {
        await createDirectories();
        if ((0, debug_1.debug)())
            console.log("Writing file", {
                data,
                filename,
                type,
                allowRewrite,
            });
        if (!allowRewrite && (await isExist(name))) {
            console.error(`File ${name} already exists`);
            return;
        }
        await backup(filename, type);
        await promises_1.default.writeFile(name, JSON.stringify(data, null, 2));
        return name;
    }
    catch (e) {
        console.error(`Error writing file ${name}`);
        return undefined;
    }
}
exports.save = save;
async function load(params) {
    const { filename, type, password } = params;
    const name = "./data/" + filename + "." + type + ".json";
    if ((0, debug_1.debug)())
        console.log("load", { filename, type, name });
    try {
        const filedata = await promises_1.default.readFile(name, "utf8");
        if ((0, debug_1.debug)())
            console.log("filedata", filedata);
        const data = JSON.parse(filedata);
        if (data.type !== type && type !== "rollup.nft") {
            console.error(`File ${name} is not of type ${type}`);
            return;
        }
        if (data.iv) {
            const pwd = password ?? (0, password_1.password)();
            if (!pwd) {
                console.error(`File ${name} is encrypted and no password is provided`);
                return undefined;
            }
            try {
                return JSON.parse(decrypt(data.iv, data.data, pwd));
            }
            catch (e) {
                console.error(`File ${name} is encrypted and password is wrong`);
                return undefined;
            }
        }
        else
            return type === "rollup.nft" ? data : data.data;
    }
    catch (e) {
        console.error(`File ${name} does not exist or has wrong format`);
        return undefined;
    }
}
exports.load = load;
async function isFileExist(params) {
    const { filename, type } = params;
    const folder = type === "request" ? "./requests/" : "./data/";
    const name = folder +
        (type === "request" ? getFormattedDateTime() + "." : "") +
        filename +
        "." +
        type +
        ".json";
    try {
        if ((0, debug_1.debug)())
            console.log("isFileExist", {
                filename,
                type,
                name,
            });
        if (await isExist(name))
            return true;
        else
            return false;
    }
    catch (e) {
        console.error(`Error checking file ${name}`);
        return false;
    }
}
exports.isFileExist = isFileExist;
async function loadPlain(params) {
    const { filename, type } = params;
    const name = "./data/" + filename + "." + type + ".json";
    try {
        const filedata = await promises_1.default.readFile(name, "utf8");
        const data = JSON.parse(filedata);
        return data;
    }
    catch (e) {
        console.error(`File ${name} does not exist or has wrong format`);
        return undefined;
    }
}
exports.loadPlain = loadPlain;
async function loadBinary(filename) {
    try {
        return await promises_1.default.readFile(filename, "binary");
    }
    catch (e) {
        console.error(`Cannot read file ${filename}`, e);
        return undefined;
    }
}
exports.loadBinary = loadBinary;
async function loadText(filename) {
    try {
        return await promises_1.default.readFile(filename, "utf8");
    }
    catch (e) {
        console.error(`Cannot read file ${filename}`, e);
        return undefined;
    }
}
exports.loadText = loadText;
async function saveBinary(params) {
    const { data, filename } = params;
    try {
        await promises_1.default.writeFile(filename, data, "binary");
    }
    catch (e) {
        console.error(`Error writing file ${filename}`, e);
    }
}
exports.saveBinary = saveBinary;
async function saveText(params) {
    const { data, filename } = params;
    try {
        await promises_1.default.writeFile(filename, data, "utf8");
    }
    catch (e) {
        console.error(`Error writing file ${filename}`, e);
    }
}
exports.saveText = saveText;
async function changePassword(filename, type, oldPwd, newPwd) {
    const name = "./data/" + filename + "." + type + ".json";
    try {
        if (await isExist(name)) {
            const data = await load({ filename, type, password: oldPwd });
            if (data)
                await write({
                    data,
                    filename,
                    type,
                    allowRewrite: true,
                    password: newPwd,
                });
        }
        else {
            console.error(`File ${name} does not exist`);
        }
    }
    catch (e) {
        console.error(`Error changing password for file ${name}`);
        return undefined;
    }
}
exports.changePassword = changePassword;
async function isExist(name) {
    // check if file exists
    try {
        await promises_1.default.access(name);
        return true;
    }
    catch (e) {
        // if not, return
        return false;
    }
}
async function backup(filename, type) {
    const name = "./data/" + filename + "." + type + ".json";
    const backupName = "./data/backup/" +
        filename +
        "." +
        type +
        "." +
        getFormattedDateTime() +
        ".json";
    // check if file exists
    try {
        await promises_1.default.access(name);
    }
    catch (e) {
        // if not, return
        return;
    }
    // copy file to backup
    await promises_1.default.copyFile(name, backupName);
}
async function createDirectories() {
    // check if data directory exists
    try {
        await promises_1.default.access("./data");
    }
    catch (e) {
        // if not, create it
        await promises_1.default.mkdir("./data");
    }
    // check if data directory exists
    try {
        await promises_1.default.access("./data/backup");
    }
    catch (e) {
        // if not, create it
        await promises_1.default.mkdir("./data/backup");
    }
    try {
        await promises_1.default.access("./requests");
    }
    catch (e) {
        // if not, create it
        await promises_1.default.mkdir("./requests");
    }
}
function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
}
function encrypt(text, password) {
    const iv = crypto_1.default.randomBytes(16);
    const key = crypto_1.default.scryptSync(password, "salt", 32);
    const cipher = crypto_1.default.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = cipher.update(text, "utf8", "hex") + cipher.final("hex");
    return { iv: iv.toString("hex"), encryptedData: encrypted };
}
function decrypt(iv, encryptedData, password) {
    const key = crypto_1.default.scryptSync(password, "salt", 32);
    const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
    const decrypted = decipher.update(encryptedData, "hex", "utf8") + decipher.final("utf8");
    return decrypted;
}
