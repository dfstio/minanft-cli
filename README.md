# Mina NFT offline cli tool


## Installation

You need to install node and git
and clone this repo

	git clone https://github.com/dfstio/minanft-cli
	cd minanft-cli
	yarn

Make sure that minanft command is executable by running from minanft-cli folder

	chmod +x ./src/cli.ts
	npm link

Faucet:   
https://faucet.minaprotocol.com


## Website

https://minanft.io

## Usage:
```
Usage (from minanft-cli folder): minanft [options] [command]

Options:
  -V, --version           output the version number
  -h, --help              display help for command

Commands:
  account                 Create new MINA protocol account
  sign <transaction>      Sign transaction
  prove [options] <file>  Prove text file content
  verify                  Verify text file content
  help [command]          display help for command

Example:
  minanft account

// result:
Mina NFT offline CLI tool (c) 2023 www.minanft.io

Creating account... 
SnarkyJS loaded
Created account:
 {
  privateKey: 'EKF1hkz9LX47B67qBtM872c8GqNk4UFjxiFSAdJ4dyi58Ak6hJmV',
  publicKey: 'B62qmP8CNnjHHjb7LFX6TrkkLPLLmq6wJcQu1vtTXgMye3divxyz17C',
  explorer: 'https://berkeley.minaexplorer.com/wallet/B62qmP8CNnjHHjb7LFX6TrkkLPLLmq6wJcQu1vtTXgMye3divxyz17C',
  salt: '12451526092217142223536597288402454046942356947273816571698560584321730205579'
}


```


## TODO

