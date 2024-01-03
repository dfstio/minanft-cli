import { write, load } from "./files";
import { debug } from "./debug";

export async function setJWT(jwt: string): Promise<void> {
  if (debug()) console.log("Setting JWT:\n", { jwt });
  try {
    await write({
      data: { jwt },
      filename: "minanft",
      type: "jwt",
      allowRewrite: true,
    });
    console.log(`MinaNFT JWT token has been set`);
  } catch (e) {
    console.error(e);
  }
}

export async function setPinataJWT(jwt: string): Promise<void> {
  if (debug()) console.log("Setting Pinata JWT:\n", { jwt });
  try {
    await write({
      data: { jwt },
      filename: "pinata",
      type: "jwt",
      allowRewrite: true,
    });
    console.log(`Pinata JWT token has been set`);
  } catch (e) {
    console.error(e);
  }
}

export async function setArweaveKey(jwt: string): Promise<void> {
  if (debug()) console.log("Setting Arweave key\n", { jwt });
  try {
    await write({
      data: { jwt },
      filename: "arweave",
      type: "jwt",
      allowRewrite: true,
    });
    console.log(`Arweave key has been set`);
  } catch (e) {
    console.error(e);
  }
}

export async function getJWT(): Promise<string | undefined> {
  try {
    const data = await load({ filename: "minanft", type: "jwt" });
    if (debug()) console.log("JWT data:", data);
    return data?.jwt;
  } catch (e) {
    console.error("Error reading ./data/minanft.jwt.json file:", e);
    return undefined;
  }
}

export async function getArweaveKey(): Promise<string | undefined> {
  try {
    const data = await load({ filename: "arweave", type: "jwt" });
    if (debug()) console.log("JWT data:", data);
    return data?.jwt;
  } catch (e) {
    console.error("Error reading ./data/arweave.jwt.json file:", e);
    return undefined;
  }
}

export async function getPinataJWT(): Promise<string | undefined> {
  try {
    const data = await load({ filename: "pinata", type: "jwt" });
    if (debug()) console.log("JWT data:", data);
    return data?.jwt;
  } catch (e) {
    console.error("Error reading ./data/pinata.jwt.json file:", e);
    return undefined;
  }
}

export async function exportJWT(): Promise<void> {
  const jwt = await getJWT();
  if (jwt === undefined) console.error("JWT token is not set");
  else console.log(jwt);
}
