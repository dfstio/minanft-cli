# Mina NFT offline CLI tool

## Features

- Reserve the NFT name using MinaNFT API (online mode) or frontend helper (offline mode)
- Create NFT locally (online mode) or locally with prepared in-advance IPFS or Arweave hashes (offline mode)
- Mint the NFT locally (online mode) or using frontend helper (offline mode)
- Add to the NFT during creation:
  - Public or private key-value pairs
  - Texts
  - Text, PNG, Word or binary files
- Indexing new NFT for the frontend (online only)
- Creating the masks for redacting the text or png files
- Redact text files using regular expressions
- Redact text and png files using masks
- Creating and verifying proofs for texts and files
- Creating and verifying proofs for redacted text and png files
- Setting configuration:
  - MinaNFT API JWT
  - IPFS Pintata JWS
  - Arweave key
- Encryption of user's data using user's password
- MINA accounts
  - Creating MINA account
  - Importing MINA account by using private or public key
  - Checking account balance (online only)
  - Exporting private and public keys of the account

## Installation

You need to install node and git
and clone this repo

```
    git clone https://github.com/dfstio/minanft-cli
    cd minanft-cli
    yarn
```

Make sure that minanft command is executable by running from the minanft-cli folder

```
    chmod +x ./src/cli.ts
    npm link
```

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
  provepng [options] <name> <key> <original> <redacted> Prove NFT png image
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
  word <name>                                           Convert word file to text
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
