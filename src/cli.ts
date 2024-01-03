#! /usr/bin/env ts-node
import { Command } from "commander";
import { createAccount, exportAccount, balance } from "./account";
import { prove } from "./provetree";
import { reserve, createNFT } from "./nft";
import { changePassword } from "./files";
import { setJWT, exportJWT, setPinataJWT, setArweaveKey } from "./jwt";
import { proveMap } from "./provemap";

export const program = new Command();

program
  .name("minanft")
  .description("Mina NFT CLI tool")
  .version("1.0.3")
  .option("-p, --password <string>", "password")
  .option("-o, --offline", "offline mode")
  .option("-d, --debug", "debug mode");

program
  .command("createaccount")
  .description("Create new MINA protocol account or import existing one")
  .argument("<name>", "Name of the account")
  .option("--private <string>", "private key")
  .option("--public <string>", "public key")
  .action(async (name, options) => {
    console.log(`Creating account ${name}...`);
    await createAccount({
      name,
      privateKey: options.private,
      publicKey: options.public,
    });
  });

program
  .command("exportaccount")
  .description("Export existing MINA protocol account")
  .argument("<name>", "Name of the account")
  .action(async (name) => {
    console.log(`Exporting account ${name}...`);
    await exportAccount(name);
  });

program
  .command("reserve")
  .description("Reserve NFT name")
  .argument("<name>", "Name of the NFT")
  .argument("[account]", "NFT account, should have private key")
  .action(async (name, account) => {
    console.log(`Reserving NFT name ${name}...`);
    await reserve(name, account);
  });

program
  .command("prove")
  .description("Prove NFT metadata")
  .argument("<name>", "Name of the NFT")
  .requiredOption("-k, --keys <strings...>", "Keys to prove")
  .action(async (name, options) => {
    console.log(`Proving keys for NFT ${name}...`);
    await proveMap(name, options.keys);
  });

program
  .command("createnft")
  .description("Create NFT")
  .argument("<name>", "Reserved name of the NFT")
  .argument("[owner]", "Owner account, should have private key")
  .option("--arweave", "Use Arweave for storage")
  .option("--creator <string>", "Creator name")
  .action(async (name, owner, options) => {
    console.log(`Creating NFT ${name}...`);
    await createNFT(name, owner, options.arweave ?? false, options.creator);
  });

program
  .command("exportjwt")
  .description("Export MinaNFT JWT token")
  .action(async () => {
    console.log("Exporting JWT token... ");
    await exportJWT();
  });

program
  .command("balance")
  .description("Check the balance of the existing MINA protocol account")
  .argument("<name>", "Name of the account")
  .action(async (name) => {
    console.log(`Checking the balance of the ${name}...`);
    await balance(name);
  });

program
  .command("jwt")
  .description("Set JWT token for the online MinaNFT API")
  .argument("<jwt", "JWT token. Get it at https://t.me/minanft_bot?start=auth")
  .action(async (jwt) => {
    console.log(`Setting JWT token...`);
    await setJWT(jwt);
  });

program
  .command("ipfs")
  .description("Set Pinata JWT token for the IPFS storage")
  .argument("<jwt", "Pinata JWT token. Get it at https://pinata.cloud")
  .action(async (jwt) => {
    console.log(`Setting Pinata JWT token...`);
    await setPinataJWT(jwt);
  });

program
  .command("arweave")
  .description("Set Arweave private key for the Arweave storage")
  .argument(
    "<key",
    "Arweave private key. Generate it using Arweave using instructions in README.md"
  )
  .action(async (key) => {
    console.log(`Setting Arweave private key...`);
    await setArweaveKey(key);
  });

program
  .command("changepassword")
  .description("Change password for existing file")
  .argument("<name>", "Name")
  .argument("<type>", "Type: account | nft | request | map | answer")
  .argument("<oldPwd>", "Old password")
  .argument("<newPwd>", "New password")
  .action(async (name, type, oldPwd, newPwd) => {
    console.log(`Changing password for ${name}...`);
    await changePassword(name, type, oldPwd, newPwd);
  });

/*
program
  .command("prove")
  .description("Prove text file content")
  .argument("<file>", "file")
  .option("-s, --sanitized <string>", "sanitized text file")
  .action(async (file, options) => {
    console.log("Proving content of ", file);
    await prove(file, options.sanitized ? options.sanitized : "");
  });
*/

async function main() {
  console.log("Mina NFT CLI tool (c) 2024 www.minanft.io\n");
  await program.parseAsync();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
