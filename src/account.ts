import {
    Mina,
    PrivateKey,
    PublicKey,
    isReady,
    Field,
    fetchAccount,
    fetchTransactionStatus,
    TransactionStatus,
    shutdown,
    AccountUpdate,
    SmartContract,
    state,
    State,
    method,
    Signature,
    UInt64,
    DeployArgs,
    Permissions,
    Poseidon,
    Proof,
    verify,
    MerkleTree,
    MerkleMapWitness,
    Encoding,
    MerkleWitness,
} from "snarkyjs";

import {
    MINAURL,
    MINAEXPLORER,
    MINAFEE,
    NFT_SALT,
    NFT_SECRET,
} from "./config.json";

import { AvatarNFT } from "./avatarnft";
import AccountData from "./accountData";

export function formatWinstonTime(ms: number): string {
    if (ms === undefined) return "";
    if (ms < 1000) return ms.toString() + " ms";
    if (ms < 60 * 1000)
        return parseInt((ms / 1000).toString()).toString() + " sec";
    if (ms < 60 * 60 * 1000)
        return parseInt((ms / 1000 / 60).toString()).toString() + " min";
    return parseInt((ms / 1000 / 60 / 60).toString()).toString() + " h";
}

function generateAccount(): AccountData {
    const zkAppPrivateKey = PrivateKey.random();
    const zkAppPrivateKeyString = PrivateKey.toBase58(zkAppPrivateKey);
    const zkAppAddress = zkAppPrivateKey.toPublicKey();
    const zkAppAddressString = PublicKey.toBase58(zkAppAddress);
    const salt = Field.random();

    return {
        privateKey: zkAppPrivateKeyString,
        publicKey: zkAppAddressString,
        explorer: `${MINAEXPLORER}${zkAppAddressString}`,
        salt: salt.toJSON(),
    };
}

async function topupAccount(publicKey: string) {
    await Mina.faucet(PublicKey.fromBase58(publicKey));
}

async function accountBalance(publicKey: string) {
    const address = PublicKey.fromBase58(publicKey);
    let check = await Mina.hasAccount(address);
    console.log("check1", check);
    if (!check) {
        await fetchAccount({ publicKey: address });
        check = await Mina.hasAccount(address);
        console.log("check2", check);
        if (!check) return 0;
    }
    const balance = await Mina.getBalance(address);
    return balance.toBigInt();
}

async function minaInit() {
    await isReady;
    const Network = Mina.Network(MINAURL);
    await Mina.setActiveInstance(Network);
    console.log("SnarkyJS loaded");
}

const deployTransactionFee = 100_000_000;

async function deploy(
    deployerPrivateKey: PrivateKey,
    zkAppPrivateKey: PrivateKey,
    zkapp: AvatarNFT,
    verificationKey: { data: string; hash: string | Field }
) {
    let sender = deployerPrivateKey.toPublicKey();
    let zkAppPublicKey = zkAppPrivateKey.toPublicKey();
    console.log(
        "using deployer private key with public key",
        sender.toBase58()
    );
    console.log(
        "using zkApp private key with public key",
        zkAppPublicKey.toBase58()
    );

    console.log("Deploying zkapp for public key", zkAppPublicKey.toBase58());
    let transaction = await Mina.transaction(
        { sender, fee: deployTransactionFee },
        () => {
            AccountUpdate.fundNewAccount(sender);
            // NOTE: this calls `init()` if this is the first deploy
            zkapp.deploy({ verificationKey });
        }
    );
    await transaction.prove();
    transaction.sign([deployerPrivateKey, zkAppPrivateKey]);

    console.log("Sending the deploy transaction...");
    const res = await transaction.send();
    const hash = res.hash();
    if (hash === undefined) {
        console.log("error sending transaction (see above)");
    } else {
        console.log(
            "See deploy transaction at",
            "https://berkeley.minaexplorer.com/transaction/" + hash
        );
        console.log("waiting for zkApp account to be deployed...");
        await res.wait();
    }
}

export async function account(): Promise<void> {
    await minaInit();
    const acc = await generateAccount();
    console.log("Created account:\n", acc);
}
