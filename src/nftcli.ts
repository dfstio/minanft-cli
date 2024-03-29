import { Command } from "commander";
import * as readline from "node:readline/promises";
import { debug } from "./debug";
import { nft, pinataJWT, arweaveKey, mint } from "./nft";
import { readWord } from "./word";
import fs from "fs/promises";

export const programNFT = new Command();
/*
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function myExitOverride(error: CommanderError) {
  //console.log("exitOverride Error:", error.message);
}
*/

programNFT.name("add").description("Create NFT").version("1.0.3");

programNFT
  .command("key")
  .description("Add key-value pair to NFT")
  .argument("<key>", "Key, maximum 30 characters")
  .argument("<value>", "Value, maximum 30 characters")
  .option("--private", "Make this key private")
  .action(async (key, value, options) => {
    console.log(`Creating key ${key}...`);
    if (debug()) console.log({ key, value, options });
    nft().update({ key, value, isPrivate: options.private ?? false });
  });

programNFT
  .command("image")
  .description("Add image to NFT")
  .argument("<file>", "File name of the image")
  .option("--noroot", "Skip calculating Merkle Tree root of the image")
  .option("--ipfs <string>", "IPFS hash of the file")
  .option("--arweave <string>", "Arweave hash of the file")
  .action(async (file, options) => {
    console.log(`Adding image ${file}...`);
    if (debug()) console.log({ file, options });
    await nft().updateImage({
      filename: file,
      pinataJWT,
      arweaveKey,
      calculateRoot: options.noroot === true ? false : true,
      IPFSHash: options.ipfs,
      ArweaveHash: options.arweave,
    });
  });

programNFT
  .command("file")
  .description("Add file to NFT")
  .argument("<key>", "Key, maximum 30 characters")
  .argument("<file>", "File name")
  .option("--private", "Make this file private")
  .option("--ipfs <string>", "IPFS hash of the file")
  .option("--arweave <string>", "Arweave hash of the file")
  .option("--noroot", "Skip calculating Merkle Tree root of the file")
  .option("--text", "Text file")
  .option("--word", "Text file")
  .option("--png", "PNG file")
  .action(async (key, file, options) => {
    if (debug()) console.log({ file, options });
    if (options.text === true) {
      console.log(`Adding text file ${file}...`);
      const text = await fs.readFile(file, "utf8");
      nft().updateText({ key, text, isPrivate: options.private ?? false });
    } else if (options.png === true) {
      console.log(`Adding png file ${file}...`);
      await nft().updateFile({
        key,
        filename: file,
        pinataJWT,
        arweaveKey,
        calculateRoot: options.noroot === true ? false : true,
        IPFSHash: options.ipfs,
        ArweaveHash: options.arweave,
        fileType: "png",
        isPrivate: options.private ?? false,
      });
    } else {
      console.log(`Adding binary file ${file}...`);
      await nft().updateFile({
        key,
        filename: file,
        pinataJWT,
        arweaveKey,
        isPrivate: options.private ?? false,
        calculateRoot: options.noroot === true ? false : true,
        IPFSHash: options.ipfs,
        ArweaveHash: options.arweave,
        fileType: options.word === true ? "word" : "binary",
      });
      if (options.word === true) {
        console.log(`Adding word file text...`);
        const text = await readWord(file);
        nft().updateText({
          key: key.substring(0, 25) + ".text",
          text,
          isPrivate: options.private ?? false,
        });
      }
    }
  });

programNFT
  .command("text")
  .description("Add text to NFT")
  .argument("<key>", "Key, maximum 30 characters")
  .argument("<text>", "Text to add")
  .option("--private", "Make this text private")
  .action(async (key, text, options) => {
    console.log(`Adding text...`);
    if (debug()) console.log({ key, text, options });
    nft().updateText({ key, text, isPrivate: options.private ?? false });
  });

programNFT
  .command("description")
  .description("Add description to NFT")
  .argument("<text>", "Description text")
  .action(async (text) => {
    console.log(`Adding description: ${text}`);
    nft().updateText({ key: "description", text });
  });

export async function getCommands() {
  if (debug()) console.log("Create NFT getCommands\n");
  //await programNFT.parseAsync(["help"]);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function waitForUserInput() {
    const command = await rl.question("command > ");

    if (command === "exit" || command === "quit") {
      rl.close();
      console.log("Exiting...");
    } else if (command === "mint") {
      rl.close();
      console.log("Minting...");
      await mint();
    } else {
      const commandArr = command.split(
        /(?<=^[^\"]*(?:\"[^\"]*\"[^\"]*)*) (?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/
      );
      const commands: string[] = [];
      for (const command of commandArr) {
        if (command.startsWith('"')) {
          commands.push(command.substring(1, command.length - 1));
        } else {
          commands.push(command);
        }
      }
      //const commandArr = command.split(" ");
      //const pattern = @"(?<=(\s|\b)\"")[^""]+(?=(\s|\b)\"")|(?<=\s|\b)[^""\s]+?(?=\s|\b)";
      //const commandArr = Regex.Matches(text, pattern).Cast<Match>().Select(x => x.ToString()).ToArray();
      if (debug()) console.log("Parsed command:", commands);
      try {
        await programNFT.parseAsync(commands, { from: "user" });
      } catch (e) {
        console.error("Error:", e);
      }
      if (debug()) console.log("After parsing...");
      await waitForUserInput();
    }
  }
  await waitForUserInput();
}
