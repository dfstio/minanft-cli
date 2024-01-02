import fs from "fs/promises";
import crypto from "crypto";
import { FileType, FileData } from "./model/fileData";
import { debug } from "./debug";
import { password as getPassword } from "./password";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function write(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  filename: string;
  type: FileType;
  allowRewrite?: boolean;
  password?: string;
}): Promise<string | undefined> {
  const { data, filename, type, allowRewrite, password } = params;
  const folder = type === "request" ? "./requests/" : "./data/";
  const name =
    folder +
    (type === "request" ? getFormattedDateTime() + "." : "") +
    filename +
    "." +
    type +
    ".json";
  try {
    await createDirectories();
    if (debug())
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
    const pwd = password ?? getPassword();
    let encryptedData = undefined;
    if (pwd && type !== "request")
      encryptedData = encrypt(JSON.stringify(data), pwd);

    const filedata: FileData = {
      filename,
      type,
      timestamp: Date.now(),
      data: encryptedData ? encryptedData.encryptedData : data,
    };
    if (encryptedData) filedata.iv = encryptedData.iv;
    await fs.writeFile(name, JSON.stringify(filedata, null, 2));
    return name;
  } catch (e) {
    console.error(`Error writing file ${name}`);
    return undefined;
  }
}

export async function load(params: {
  filename: string;
  type: FileType;
  password?: string;
}) {
  const { filename, type, password } = params;
  const name = "./data/" + filename + "." + type + ".json";
  try {
    const filedata = await fs.readFile(name, "utf8");
    const data = JSON.parse(filedata);
    if (data.type !== type) {
      console.error(`File ${name} is not of type ${type}`);
      return;
    }
    if (data.iv) {
      const pwd = password ?? getPassword();
      if (!pwd) {
        console.error(`File ${name} is encrypted and no password is provided`);
        return undefined;
      }
      try {
        return JSON.parse(decrypt(data.iv, data.data, pwd));
      } catch (e) {
        console.error(`File ${name} is encrypted and password is wrong`);
        return undefined;
      }
    } else return data.data;
  } catch (e) {
    console.error(`File ${name} does not exist or has wrong format`);
    return undefined;
  }
}

export async function changePassword(
  filename: string,
  type: FileType,
  oldPwd: string,
  newPwd: string
) {
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
    } else {
      console.error(`File ${name} does not exist`);
    }
  } catch (e) {
    console.error(`Error changing password for file ${name}`);
    return undefined;
  }
}

async function isExist(name: string): Promise<boolean> {
  // check if file exists
  try {
    await fs.access(name);
    return true;
  } catch (e) {
    // if not, return
    return false;
  }
}

async function backup(filename: string, type: FileType) {
  const name = "./data/" + filename + "." + type + ".json";

  const backupName =
    "./data/backup/" +
    filename +
    "." +
    type +
    "." +
    getFormattedDateTime() +
    ".json";
  // check if file exists
  try {
    await fs.access(name);
  } catch (e) {
    // if not, return
    return;
  }
  // copy file to backup
  await fs.copyFile(name, backupName);
}

async function createDirectories() {
  // check if data directory exists
  try {
    await fs.access("./data");
  } catch (e) {
    // if not, create it
    await fs.mkdir("./data");
  }
  // check if data directory exists
  try {
    await fs.access("./data/backup");
  } catch (e) {
    // if not, create it
    await fs.mkdir("./data/backup");
  }
  try {
    await fs.access("./requests");
  } catch (e) {
    // if not, create it
    await fs.mkdir("./requests");
  }
}

function getFormattedDateTime(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  return `${year}.${month}.${day}-${hours}:${minutes}:${seconds}`;
}

function encrypt(
  text: string,
  password: string
): { iv: string; encryptedData: string } {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = cipher.update(text, "utf8", "hex") + cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}

function decrypt(iv: string, encryptedData: string, password: string): string {
  const key = crypto.scryptSync(password, "salt", 32);
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "hex")
  );
  const decrypted =
    decipher.update(encryptedData, "hex", "utf8") + decipher.final("utf8");
  return decrypted;
}
