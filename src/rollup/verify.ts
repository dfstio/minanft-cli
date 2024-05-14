import {
  method,
  SmartContract,
  PublicKey,
  Field,
  Struct,
  AccountUpdate,
  UInt64,
  PrivateKey,
  Mina,
  state,
  State,
} from "o1js";

import {
  RollupVerifierProof,
  KeyVerifierProof,
  RollupVerifier,
  KeyVerifier,
} from "./proof";
import {
  BlockContract,
  RollupContract,
  BlockParams,
  RollupNftName,
} from "./contract";
import { contractAddress, verifierAddress, deployer, chain } from "./config";
import { fetchMinaAccount, accountBalanceMina, initBlockchain } from "minanft";
import { fee, sleep } from "zkcloudworker";

export class RollupNFTKeyVerification extends Struct({
  blockAddress: PublicKey,
  blockRoot: Field,
}) {}

export class RollupNFTKeyVerificationEvent extends Struct({
  blockAddress: PublicKey,
  blockRoot: Field,
  nft: RollupNftName,
  key: Field,
  kind: Field,
  data: Field,
}) {}

export class RollupNFTKeyVerifier extends SmartContract {
  @state(PublicKey) rollup = State<PublicKey>();

  events = {
    verified: RollupNFTKeyVerificationEvent,
  };

  @method async verify(
    verificationData: RollupNFTKeyVerification,
    rollupProof: RollupVerifierProof,
    keyProof: KeyVerifierProof
  ) {
    const rollup = this.rollup.getAndRequireEquals();
    /*
    const contract = new RollupContract(rollup);
    const tokenId = contract.deriveTokenId();
    // check that the address contains the block
    AccountUpdate.create(verificationData.blockAddress, tokenId)
      .account.balance.getAndRequireEquals()
      .assertEquals(UInt64.from(1_000_000_000));
    const block = new BlockContract(verificationData.blockAddress, tokenId);
    const blockData = BlockParams.unpack(block.blockParams.get());
    const blockRoot = block.root.get();
    blockRoot.assertEquals(verificationData.blockRoot);
    blockData.isProved.assertTrue();
    rollupProof.publicInput.root.assertEquals(blockRoot);
    */
    rollupProof.verify();
    keyProof.verify();
    keyProof.publicInput.nft.data.metadata.kind.assertEquals(
      rollupProof.publicInput.nft.data.metadata.kind
    );
    keyProof.publicInput.nft.data.metadata.data.assertEquals(
      rollupProof.publicInput.nft.data.metadata.data
    );
    keyProof.publicInput.nft.name.assertEquals(
      rollupProof.publicInput.nft.name
    );
    keyProof.publicInput.nft
      .hash()
      .assertEquals(rollupProof.publicInput.nft.hash());

    const eventData = new RollupNFTKeyVerificationEvent({
      blockAddress: verificationData.blockAddress,
      blockRoot: verificationData.blockRoot,
      nft: rollupProof.publicInput.nft,
      key: keyProof.publicInput.key,
      kind: keyProof.publicInput.kind,
      data: keyProof.publicInput.data,
    });
    this.emitEvent("verified", eventData);
  }
}

export async function deployRollupVerifier(privateKey: string) {
  const deployerPrivateKey = PrivateKey.fromBase58(deployer);
  const contractPrivateKey = PrivateKey.fromBase58(privateKey);
  const contractPublicKey = contractPrivateKey.toPublicKey();
  if (contractPublicKey.toBase58() !== verifierAddress) {
    console.error("Verifier address does not match");
    return;
  }
  const sender = deployerPrivateKey.toPublicKey();

  await initBlockchain(chain);
  console.log("blockchain initialized:", chain);
  await fetchMinaAccount({ publicKey: sender, force: true });
  console.log("contract address:", contractPublicKey.toBase58());
  console.log("sender:", sender.toBase58());
  console.log("Sender balance:", await accountBalanceMina(sender));
  console.time("compiled RollupVerifier");
  await RollupVerifier.compile();
  console.timeEnd("compiled RollupVerifier");
  console.time("compiled KeyVerifier");
  await KeyVerifier.compile();
  console.timeEnd("compiled KeyVerifier");
  console.time("compiled RollupNFTKeyVerifier");
  await RollupNFTKeyVerifier.compile();
  console.timeEnd("compiled RollupNFTKeyVerifier");
  const zkApp = new RollupNFTKeyVerifier(contractPublicKey);

  const tx = await Mina.transaction(
    {
      sender,
      fee: await fee(),
      memo: "MinaNFT: deploy",
    },
    async () => {
      AccountUpdate.fundNewAccount(sender);
      await zkApp.deploy({});
      zkApp.rollup.set(PublicKey.fromBase58(contractAddress));
      zkApp.account.zkappUri.set("https://minanft.io");
    }
  );
  await tx.prove();
  tx.sign([deployerPrivateKey, contractPrivateKey]);
  await sendTx(tx, "deploy");
}

export async function upgradeRollupVerifier(privateKey: string) {
  const deployerPrivateKey = PrivateKey.fromBase58(deployer);
  const contractPrivateKey = PrivateKey.fromBase58(privateKey);
  const contractPublicKey = contractPrivateKey.toPublicKey();
  if (contractPublicKey.toBase58() !== verifierAddress) {
    console.error("Verifier address does not match");
    return;
  }
  const sender = deployerPrivateKey.toPublicKey();

  await initBlockchain(chain);
  console.log("blockchain initialized:", chain);
  await fetchMinaAccount({ publicKey: sender, force: true });
  console.log("contract address:", contractPublicKey.toBase58());
  console.log("sender:", sender.toBase58());
  console.log("Sender balance:", await accountBalanceMina(sender));
  console.time("compiled RollupVerifier");
  await RollupVerifier.compile();
  console.timeEnd("compiled RollupVerifier");
  console.time("compiled KeyVerifier");
  await KeyVerifier.compile();
  console.timeEnd("compiled KeyVerifier");
  console.time("compiled RollupNFTKeyVerifier");
  const { verificationKey } = await RollupNFTKeyVerifier.compile();
  console.timeEnd("compiled RollupNFTKeyVerifier");
  const zkApp = new RollupNFTKeyVerifier(contractPublicKey);

  const tx = await Mina.transaction(
    {
      sender,
      fee: await fee(),
      memo: "MinaNFT: upgrade",
    },
    async () => {
      const update = AccountUpdate.createSigned(contractPublicKey);
      update.account.verificationKey.set(verificationKey);
    }
  );
  await tx.prove();
  tx.sign([deployerPrivateKey, contractPrivateKey]);
  await sendTx(tx, "upgrade");
}

export async function verifyKeyOnChain(params: {
  verificationData: RollupNFTKeyVerification;
  rollupProof: RollupVerifierProof;
  keyProof: KeyVerifierProof;
}) {
  const { verificationData, rollupProof, keyProof } = params;
  const deployerPrivateKey = PrivateKey.fromBase58(deployer);
  const contractPublicKey = PublicKey.fromBase58(verifierAddress);
  const sender = deployerPrivateKey.toPublicKey();

  await initBlockchain(chain);
  console.log("blockchain initialized:", chain);
  await fetchMinaAccount({ publicKey: sender, force: true });
  console.log("contract address:", contractPublicKey.toBase58());
  console.log("sender:", sender.toBase58());
  console.log("Sender balance:", await accountBalanceMina(sender));
  console.time("compiled RollupVerifier");
  await RollupVerifier.compile();
  console.timeEnd("compiled RollupVerifier");
  console.time("compiled KeyVerifier");
  await KeyVerifier.compile();
  console.timeEnd("compiled KeyVerifier");
  console.time("compiled RollupNFTKeyVerifier");
  await RollupNFTKeyVerifier.compile();
  console.timeEnd("compiled RollupNFTKeyVerifier");
  const zkApp = new RollupNFTKeyVerifier(contractPublicKey);
  const rollupAddress = PublicKey.fromBase58(contractAddress);
  const rollup = new RollupContract(rollupAddress);
  const tokenId = rollup.deriveTokenId();
  await fetchMinaAccount({ publicKey: sender, force: true });
  await fetchMinaAccount({ publicKey: contractPublicKey, force: true });
  await fetchMinaAccount({ publicKey: rollupAddress, force: true });
  await fetchMinaAccount({
    publicKey: verificationData.blockAddress,
    tokenId,
    force: true,
  });

  const tx = await Mina.transaction(
    {
      sender,
      fee: await fee(),
      memo: "MinaNFT: verify",
    },
    async () => {
      await zkApp.verify(verificationData, rollupProof, keyProof);
    }
  );
  await tx.prove();
  tx.sign([deployerPrivateKey]);
  await sendTx(tx, "verify");
}

async function sendTx(
  tx: Mina.Transaction<false, true> | Mina.Transaction<true, true>,
  description?: string
) {
  try {
    let txSent;
    let sent = false;
    while (!sent) {
      txSent = await tx.safeSend();
      if (txSent.status == "pending") {
        sent = true;
        console.log(
          `${description ?? ""} tx sent: hash: ${txSent.hash} status: ${
            txSent.status
          }`
        );
      } else if (chain === "zeko") {
        console.log("Retrying Zeko tx");
        await sleep(10000);
      } else {
        console.log(
          `${description ?? ""} tx NOT sent: hash: ${txSent?.hash} status: ${
            txSent?.status
          }`
        );
        return "Error sending transaction";
      }
    }
    if (txSent === undefined) throw new Error("txSent is undefined");
    if (txSent.errors.length > 0) {
      console.error(
        `${description ?? ""} tx error: hash: ${txSent.hash} status: ${
          txSent.status
        }  errors: ${txSent.errors}`
      );
    }

    if (txSent.status === "pending") {
      console.log(`Waiting for tx inclusion...`);
      const txIncluded = await txSent.safeWait();
      console.log(
        `${description ?? ""} tx included into block: hash: ${
          txIncluded.hash
        } status: ${txIncluded.status}`
      );
    }
  } catch (error) {
    if (chain !== "zeko") console.error("Error sending tx", error);
  }
  if (chain !== "local") await sleep(10000);
}
