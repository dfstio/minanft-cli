#! /usr/bin/env ts-node
import { Command } from "commander";
import { createAccount, exportAccount, balance } from "./account";
import { prove } from "./prove";
import { reserve } from "./nft";
import { changePassword } from "./files";
import { setJWT, exportJWT } from "./jwt";

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

program
  .command("createnft")
  .description("Create new NFT")
  .argument("<name>", "Name")
  .argument("<type>", "Type: account | nft | request | map | answer")
  .argument("<oldPwd>", "Old password")
  .argument("<newPwd>", "New password")
  .action(async (name, type, oldPwd, newPwd) => {
    console.log(`Changing password for ${name}...`);
    await changePassword(name, type, oldPwd, newPwd);
  });

program
  .command("prove")
  .description("Prove text file content")
  .argument("<file>", "file")
  .option("-s, --sanitized <string>", "sanitized text file")
  .action(async (file, options) => {
    console.log("Proving content of ", file);
    await prove(file, options.sanitized ? options.sanitized : "");
  });

async function main() {
  console.log("Mina NFT offline CLI tool (c) 2024 www.minanft.io\n");
  await program.parseAsync();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
