#! /usr/bin/env ts-node
import { Command } from "commander";
const program = new Command();
import { account } from "./account";
import { prove } from "./prove";
import { verifyProof } from "./verify";

program
  .name("minanft")
  .description("Mina NFT offline CLI tool")
  .version("1.0.3");

program
  .command("account")
  .description("Create new MINA protocol account")
  .action(async () => {
    console.log("Creating account... ");
    await account();
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

program
  .command("verify")
  .description("Verify text file content")
  .argument("<proof>", "proof")
  .action(async (proof) => {
    console.log("Verifying...");
    await verifyProof(proof);
  });

program
  .command("prepare")
  .description("Prepare file metadata for NFT creation to verify it on-chain")
  .argument("<file>", "file")
  .action(async (file) => {
    console.log("Not implemented yet");
    //await createProof(file);
  });

program
  .command("sign")
  .description("Sign transaction")
  .argument("<transaction>", "transaction")
  .action(async (price) => {
    console.log("Not yet implemented");
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
