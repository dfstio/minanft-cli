#! /usr/bin/env ts-node
import { Command, CommanderError } from "commander";
import * as readline from "node:readline/promises";
import { debug } from "./debug";

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
    console.log({ key, value, options });
  });

programNFT
  .command("image")
  .description("Add image to NFT")
  .argument("<file>", "File name of the image")
  .option("--noroot", "Skip calculating Merkle Tree root of the image")
  .action(async (file, options) => {
    console.log(`Adding image ${file}...`);
    console.log({ file, options });
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
    } else {
      const commandArr = command.split(" ");
      try {
        await programNFT.parseAsync(commandArr, { from: "user" });
      } catch (e) {
        console.error("Error:", e);
      }
      console.log("After parsing...");
      await waitForUserInput();
    }
  }
  await waitForUserInput();
}
