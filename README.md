# Mina NFT offline CLI tool

## Installation

You need to install node and git
and clone this repo

    git clone https://github.com/dfstio/minanft-cli
    cd minanft-cli
    yarn

Make sure that minanft command is executable by running from the minanft-cli folder

    chmod +x ./src/cli.ts
    npm link

## Usage:

### minanft commands

```
Usage: minanft [options] [command]

Mina NFT CLI tool

Options:
  -V, --version                                         output the version number
  -p, --password <string>                               password
  -o, --offline                                         offline mode
  -d, --debug                                           debug mode
  -h, --help                                            display help for command

Commands:
  createaccount [options] <name>                        Create new MINA protocol account or import
                                                        existing one
  exportaccount <name>                                  Export existing MINA protocol account
  balance <name>                                        Check the balance of the existing MINA protocol
                                                        account
  reserve <name> [account]                              Reserve NFT name
  create [options] <name> [owner]                       Create NFT
  index <name>                                          Index NFT name for minanft.io frontend
  prove [options] <name>                                Prove NFT metadata
  provefile [options] <name> <key>                      Prove NFT file
  provetext [options] <name> <key>                      Prove NFT text
  provepng [options] <name> <key> <original> <redacte>  Prove NFT png image
  verify <name>                                         Verify NFT metadata
  verifyfile [options] <name> <key> <file>              Verify NFT file
  verifytext <name> <key>                               Verify NFT redacted text file
  verifypng <name> <key> <png>                          Verify NFT redacted png file
  mask <name> <star> <end>                              Create or update file mask
  redact [options] <name> <mask>                        Create redacted file using mask
  regexp <name> <mask>                                  Create redacted file using regular expression
  redactedproof [options] <name>                        Create redacted file proof
  verifyredactedproof [options] <name>                  Verify redacted file proof
  jwt <jwt>                                             Set JWT token for the online MinaNFT API
  exportjwt                                             Export MinaNFT JWT token
  word <name>                                           Verify redacted file proof
  ipfs <jw>                                             Set Pinata JWT token for the IPFS storage
  arweave <ke>                                          Set Arweave private key for the Arweave storage
  changepassword <name> <type> <oldPwd> <newPwd>        Change password for existing file
  help [command]                                        display help for command

```

### create subcommands

```
  Commands:
  key [options] <key> <value>  Add key-value pair to NFT
  image [options] <file>       Add image to NFT
  file [options] <key> <file>  Add file to NFT
  text [options] <key> <text>  Add text to NFT
  description <text>           Add description to NFT
  help [command]               display help for command
  mint                         Mint NFT
  exit                         Exit without minting

```

## Documentation

https://docs.minanft.io

## MinaNFT CLI tool repo

https://github.com/dfstio/minanft-cli

## Website

https://minanft.io

## Library

https://www.npmjs.com/package/minanft

## Faucet

https://faucet.minaprotocol.com
