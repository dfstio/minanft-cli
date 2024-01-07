#! /usr/bin/env ts-node
import { Command } from "commander";
import { createAccount, exportAccount, balance } from "./account";
import { reserve, createNFT, indexName } from "./nft";
import { changePassword } from "./files";
import { setJWT, exportJWT, setPinataJWT, setArweaveKey } from "./jwt";
import { proveMap } from "./provemap";
import { proveFile } from "./provefile";
import { proveTextFile } from "./provetextfile";
import { provePNGFile } from "./provepngfile";
import { verifyMap } from "./verifymap";
import { verifyFile } from "./verifyfile";
import { verifyText } from "./verifytext";
import { verifyPNG } from "./verifypng";
import { mask } from "./mask";
import { redact } from "./redact";
import { redactedProof, verifyRedactedProof } from "./redactedproof";
import { regexp } from "./regexp";
import { debug } from "./debug";
import { readWord } from "./word";

export const program = new Command();

program
  .name("minanft")
  .description("Mina NFT CLI tool")
  .version("1.0.5")
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
  .command("balance")
  .description("Check the balance of the existing MINA protocol account")
  .argument("<name>", "Name of the account")
  .action(async (name) => {
    console.log(`Checking the balance of the ${name}...`);
    await balance(name);
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
  .command("create")
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
  .command("index")
  .description("Index NFT name for minanft.io frontend")
  .argument("<name>", "Name of the NFT")
  .action(async (name) => {
    console.log(`Indexing NFT name ${name}...`);
    await indexName(name);
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
  .command("provefile")
  .description("Prove NFT file")
  .argument("<name>", "Name of the NFT")
  .argument("<key>", "Key of the file to prove")
  .option("--api", "Use MinaNFT API to calculate proofs")
  .action(async (name, key, options) => {
    console.log(`Proving file ${key} for NFT ${name}...`);
    if (options.api)
      console.error(
        "API mode is not included in the public release due to potential high AWS costs. Please contact support@minanft.io to enable it."
      );
    else await proveFile(name, key);
  });

program
  .command("provetext")
  .description("Prove NFT text")
  .argument("<name>", "Name of the NFT")
  .argument("<key>", "Key of the file to prove")
  .option("--api", "Use MinaNFT API to calculate proofs")
  .option("--mask <string>", "Use mask to calculate redacted text file proofs")
  .option("--redacted <string>", "Use redacted file instead of mask")
  .action(async (name, key, options) => {
    console.log(`Proving text ${key} for NFT ${name}...`);
    if (options.redacted !== undefined && options.mask !== undefined) {
      console.error(`Please specify --mask or --redacted`);
      return;
    }
    if (options.redacted === undefined && options.mask === undefined) {
      console.error(`Please specify --mask or --redacted`);
      return;
    }
    if (options.api)
      console.error(
        "API mode is not included in the public release due to potential high AWS costs. Please contact support@minanft.io to enable it."
      );
    else await proveTextFile(name, key, options.mask, options.redacted);
  });

program
  .command("provepng")
  .description("Prove NFT png image")
  .argument("<name>", "Name of the NFT")
  .argument("<key>", "Key of the png file to prove")
  .argument("<original>", "Original png file")
  .argument("<redacted", "Redacted png file")
  .option("--api", "Use MinaNFT API to calculate proofs")
  .action(async (name, key, original, redacted, options) => {
    console.log(`Proving PNG file ${key} for NFT ${name}...`);
    if (options.api)
      console.error(
        "API mode is not included in the public release due to potential high AWS costs. Please contact support@minanft.io to enable it."
      );
    else await provePNGFile(name, key, original, redacted);
  });

program
  .command("verify")
  .description("Verify NFT metadata")
  .argument("<name>", "Name of the NFT")
  .action(async (name) => {
    console.log(`Verifying proof for NFT ${name}...`);
    await verifyMap(name);
  });

program
  .command("verifyfile")
  .description("Verify NFT file")
  .argument("<name>", "Name of the NFT")
  .argument("<key>", "Key of the file to verify")
  .argument("<file>", "File to verify")
  .option("--noroot", "Skip calculating Merkle Tree root of the file")
  .action(async (name, key, file, options) => {
    console.log(`Verifying file ${key} for NFT ${name}...`);
    await verifyFile(name, key, file, options.noroot ?? false);
  });

program
  .command("verifytext")
  .description("Verify NFT redacted text file")
  .argument("<name>", "Name of the NFT")
  .argument("<key>", "Key of the text to verify")
  .action(async (name, key) => {
    console.log(`Verifying text ${key} for NFT ${name}...`);
    await verifyText(name, key);
  });

program
  .command("verifypng")
  .description("Verify NFT redacted png file")
  .argument("<name>", "Name of the NFT")
  .argument("<key>", "Key of the png to verify")
  .argument("<png>", "Redacted png file")
  .action(async (name, key, png) => {
    console.log(`Verifying png ${key} for NFT ${name}...`);
    await verifyPNG(name, key, png);
  });

program
  .command("mask")
  .description("Create or update file mask")
  .argument("<name>", "Name of the mask")
  .argument("<start", "Number - start of the mask")
  .argument("<end>", "Number - end of the mask")
  .action(async (name, start, end) => {
    console.log(`Creating or updating mask ${name}...`);
    await mask(name, start, end);
  });

program
  .command("redact")
  .description("Create redacted file using mask")
  .argument("<name>", "Name of the file")
  .argument("<mask>", "Name of the mask")
  .option("--png", "file is png")
  .option("--text", "file is text")
  .action(async (name, mask, options) => {
    if (options.png === undefined && options.text === undefined) {
      console.error(`Please specify --png or --text`);
      return;
    }
    if (options.png !== undefined && options.text !== undefined) {
      console.error(`Please specify --png or --text`);
      return;
    }
    console.log(`Creating redacted file using mask...`);
    await redact(name, mask, options.text === true ? "text" : "png");
  });

program
  .command("regexp")
  .description("Create redacted file using regular expression")
  .argument("<name>", "Name of the file")
  .argument("<mask>", "Regular expression")
  .action(async (name, mask) => {
    console.log(`Creating redacted file using regular expression...`);
    // minanft regexp ./example/tesla.txt "\d" -d
    await regexp(name, mask);
  });

program
  .command("redactedproof")
  .description("Create redacted file proof")
  .argument("<name>", "Name of the original file")
  .option("--png", "file is png image")
  .option("--text", "file is text")
  .option("--mask <string>", "Mask name, optional if redacted file is used")
  .option("--redacted <string>", "Use redacted file instead of mask")
  .action(async (name, options) => {
    if (debug()) console.log("redactedproof", { name, options });
    if (options.redacted !== undefined && options.mask !== undefined) {
      console.error(`Please specify --mask or --redacted`);
      return;
    }
    if (options.redacted === undefined && options.mask === undefined) {
      console.error(`Please specify --mask or --redacted`);
      return;
    }
    if (options.png === undefined && options.text === undefined) {
      console.error(`Please specify --png or --text`);
      return;
    }
    if (options.png !== undefined && options.text !== undefined) {
      console.error(`Please specify --png or --text`);
      return;
    }
    console.log(`Creating redacted file proof...`);
    await redactedProof(
      name,
      options.mask,
      options.redacted,
      options.text === true ? "text" : "png"
    );
  });

program
  .command("verifyredactedproof")
  .description("Verify redacted file proof")
  .argument("<name>", "Name of the proof file")
  .option("--png <string>", "Redacted PNG file")
  .action(async (name, options) => {
    if (debug()) console.log("verifyredactedproof", { name, options });
    await verifyRedactedProof(name, options.png);
  });

program
  .command("jwt")
  .description("Set JWT token for the online MinaNFT API")
  .argument("<jwt>", "JWT token. Get it at https://t.me/minanft_bot?start=auth")
  .action(async (jwt) => {
    console.log(`Setting JWT token...`);
    await setJWT(jwt);
  });

program
  .command("exportjwt")
  .description("Export MinaNFT JWT token")
  .action(async () => {
    console.log("Exporting JWT token... ");
    await exportJWT();
  });

program
  .command("word")
  .description("Convert word file to JSON")
  .description("Verify redacted file proof")
  .argument("<name>", "Name of the word file")
  .action(async (name) => {
    console.log("Converting word file... ");
    const text = await readWord(name);
    console.log(text);
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

async function main() {
  console.log("Mina NFT CLI tool (c) DFST 2024 www.minanft.io\n");
  await program.parseAsync();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
