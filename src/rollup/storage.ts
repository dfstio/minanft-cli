import axios from "axios";
import { makeString } from "zkcloudworker";

const ipfsData: { [key: string]: string } = {};
let useLocalIpfsData = false;

export async function saveToIPFS(params: {
  data: any;
  pinataJWT: string;
  name: string;
  keyvalues?: object;
}): Promise<string | undefined> {
  const { data, pinataJWT, name, keyvalues } = params;
  //console.log("saveToIPFS:", { name });
  if (pinataJWT === "local") {
    const hash = makeString(
      `QmTosaezLecDB7bAoUoXcrJzeBavHNZyPbPff1QHWw8xus`.length
    );
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

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      str,
      config
    );

    console.log("saveToIPFS result:", { result: res.data, name, keyvalues });
    return res.data.IpfsHash;
  } catch (error: any) {
    console.error("saveToIPFS error:", error?.message, { name, keyvalues });
    return undefined;
  }
}

export async function loadFromIPFS(hash: string): Promise<any | undefined> {
  if (useLocalIpfsData) {
    return ipfsData[hash];
  }
  try {
    const url =
      "https://salmon-effective-amphibian-898.mypinata.cloud/ipfs/" +
      hash +
      "?pinataGatewayToken=gFuDmY7m1Pa5XzZ3bL1TjPPvO4Ojz6tL-VGIdweN1fUa5oSFZXce3y9mL8y1nSSU";
    //"https://gateway.pinata.cloud/ipfs/" + hash;
    const result = await axios.get(url);
    return result.data;
  } catch (error: any) {
    console.error("loadFromIPFS error:", error?.message);
    return undefined;
  }
}
