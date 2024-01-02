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

export async function exportJWT(): Promise<void> {
  const jwt = await getJWT();
  if (jwt === undefined) console.error("JWT token is not set");
  else console.log(jwt);
}
