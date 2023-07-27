#! /usr/bin/env ts-node
import { Command } from 'commander';
const program = new Command();
import { account } from './account';



program.name('minanft').description('Mina NFT offline CLI tool').version('1.0.0');

program
    .command('account')
    .description('Create new MINA protocol account')
    .action(async () => {
        console.log('Creating account... ');
        await account();
    });

program
    .command('sign')
    .description('Sign transaction')
    .argument('<transaction>', 'transaction')
    .action(async (price) => {
        console.log('Not yet implemented');
    });

program
    .command('prove')
    .description('Prove text file content')
    .argument('<file>', 'file')
    .option('--sanitized', 'sanitized text file')
    .action(async (file, options) => {
        console.log('Not yet implemented');
    });

program
    .command('verify')
    .description('Verify text file content')
    .action(async () => {
        console.log('Not yet implemented');

    });


async function main() {
		console.log("Mina NFT offline CLI tool (c) 2023 www.minanft.io\n")
    await program.parseAsync();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
