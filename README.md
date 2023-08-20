# Mina NFT offline CLI tool


## Installation

You need to install node and git
and clone this repo

	git clone https://github.com/dfstio/minanft-cli
	cd minanft-cli
	yarn

Make sure that minanft command is executable by running from minanft-cli folder

	chmod +x ./src/cli.ts
	npm link


## Run examples:
```
// Create proof for sanitized file
minanft prove -s sanitized.txt test.txt
// Result:
Proving content of  test.txt
 ████████████████████████████████████████ 100% | ETA: 0s | 1167/1166
Took 5 sec or 8 ms per char
Proof is written to test.txt.json

// Verify proof of sanitized file
minanft verify test.txt.json
// Result:
Verifying...
 ████████████████████████████████████████ 100% | ETA: 0s | 583/583
Passed true 
took 5 sec or 8 ms per char

// Generate account
minanft account
// Result:
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


## Usage:
```
Usage (from minanft-cli folder): minanft [options] [command]

Options:
  -V, --version           output the version number
  -h, --help              display help for command

Commands:
  account                 Create new MINA protocol account
  prove [options] <file>  Prove text file content
  verify <proof>          Verify text file content
  prepare <file>          Prepare file metadata for NFT creation to verify it on-chain
  sign <transaction>      Sign transaction
  help [command]          display help for command
  

```

## Website
https://minanft.io

## Library
https://www.npmjs.com/package/minanft

## Faucet 
https://faucet.minaprotocol.com






