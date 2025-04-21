// src/clients/client.ts
import { elizaLogger as elizaLogger2 } from "@elizaos/core";
import { createHelia } from "helia";
import { createLibp2p } from "libp2p";
import { CID as CID2 } from "multiformats/cid";
import { base58btc as base58btc2 } from "multiformats/bases/base58";
import { createOrbitDB } from "@orbitdb/core";
import { FsBlockstore } from "blockstore-fs";
import { LevelDatastore } from "datastore-level";

// src/config/libp2p.ts
import { identify, identifyPush } from "@libp2p/identify";
import { bootstrap } from "@libp2p/bootstrap";
import { mdns } from "@libp2p/mdns";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";

// src/config/bootstrap.json
var bootstrap_default = {
  addresses: [
    "/ip4/146.0.79.23/tcp/2368/p2p/12D3KooWRZjd3sRLEuGDW2JR8xsnXedosU3eoe5XhnUAsqFauoTn",
    "/ip4/146.0.79.23/tcp/2369/ws/p2p/12D3KooWRZjd3sRLEuGDW2JR8xsnXedosU3eoe5XhnUAsqFauoTn",
    "/ip4/194.164.234.145/tcp/2368/p2p/12D3KooWSqFeLyhU1GFFpodBrbGFCTGEvqW4nFKV4LsZk3L4LoZz",
    "/ip4/194.164.234.145/tcp/2369/ws/p2p/12D3KooWSqFeLyhU1GFFpodBrbGFCTGEvqW4nFKV4LsZk3L4LoZz"
  ],
  databases: {
    updates: "/orbitdb/zdpuB29HS4Pd9vjr4qs9NdfEH5TCmVPqoHm9frf9c77Crq7Z5",
    serviceAds: "/orbitdb/zdpuAyvkTHk4w8wMTVCjvDRrFQpeGyYdrgoK48ufj8B5WgZst",
    buyOffers: "/orbitdb/zdpuAyM5AWffHSqTtxf2KubRARvwYFTycfuQX4ZG4MhhdyUML",
    agreements: "/orbitdb/zdpuAu9t5Avi2BVBEu3wjDTBcMYTyUKnuqPx3saFUKEw6GXhc",
    fundedContracts: "/orbitdb/zdpuArSuYKp4g3VHgWAFMEPUqAt82AhWU4huPRSBfBV4sMMgV"
  }
};

// src/config/libp2p.ts
var libp2pOptions = {
  peerDiscovery: [
    bootstrap({
      list: bootstrap_default.addresses
    }),
    mdns()
  ],
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/4206", "/ip4/0.0.0.0/tcp/4207/ws"]
  },
  transports: [
    tcp(),
    webSockets()
  ],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    identifyPush: identifyPush(),
    pubsub: gossipsub({ allowPublishToZeroTopicPeers: true })
  }
};

// src/datadir.ts
var cwd = process.cwd();
var dataDir = `${cwd}/data/payai`;

// src/clients/client.ts
import fs2 from "fs";

// src/utils.ts
import { createHash } from "crypto";
import { privateKeyFromRaw, generateKeyPair } from "@libp2p/crypto/keys";
import bs58 from "bs58";
import {
  signBytes,
  createKeyPairFromPrivateKeyBytes,
  verifySignature
} from "@solana/web3.js";
import { CID } from "multiformats/cid";
import { base58btc } from "multiformats/bases/base58";
import fs from "fs";
import path from "path";
async function getSolanaKeypair(base58PrivateKey) {
  let secretKeyBytes = bs58.decode(base58PrivateKey);
  if (secretKeyBytes.length === 64) {
    secretKeyBytes = secretKeyBytes.slice(0, 32);
  }
  const { privateKey, publicKey } = await createKeyPairFromPrivateKeyBytes(secretKeyBytes);
  return { privateKey, publicKey };
}
async function getCryptoKeyFromBase58PublicKey(base58EncodedPublicKey) {
  const publicKeyBytes = bs58.decode(base58EncodedPublicKey);
  const publicKey = await crypto.subtle.importKey(
    "raw",
    publicKeyBytes,
    { name: "Ed25519", namedCurve: "Ed25519" },
    true,
    ["verify"]
  );
  return publicKey;
}
async function getBase58PublicKeyFromCryptoKey(publicKey) {
  const publicKeyBytes = await crypto.subtle.exportKey("raw", publicKey);
  return bs58.encode(new Uint8Array(publicKeyBytes));
}
async function getOrCreateLibp2pKeypair(keypairPath) {
  let keypair;
  if (fs.existsSync(keypairPath)) {
    keypair = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
    keypair = await privateKeyFromRaw(Uint8Array.from(Object.values(keypair.raw)));
    console.log("Loaded existing keypair for libp2p.\n");
  } else {
    keypair = await generateKeyPair("Ed25519");
    console.log("Generated new keypair for libp2p.\n");
    const dir = path.dirname(keypairPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(keypairPath, JSON.stringify(keypair));
  }
  return keypair;
}
function prepareMessageForHashing(message) {
  const sortedMessage = sortObjectByKey(message);
  const serializedMessage = JSON.stringify(sortedMessage);
  return serializedMessage.replace(/\s/g, "");
}
async function hashAndSign(message, privateKey) {
  const serializedMessage = prepareMessageForHashing(message);
  const hash = createHash("sha256").update(serializedMessage).digest();
  const signedBytes = await signBytes(privateKey, hash);
  const encodedSignature = bs58.encode(signedBytes);
  return encodedSignature;
}
async function verifyMessage(identity, signature, message) {
  const publicKey = await getCryptoKeyFromBase58PublicKey(identity);
  const serializedMessage = prepareMessageForHashing(message);
  const hash = createHash("sha256").update(serializedMessage).digest();
  const decodedSignature = bs58.decode(signature);
  return verifySignature(publicKey, decodedSignature, hash);
}
function getCIDFromOrbitDbHash(hash) {
  return CID.parse(hash, base58btc).toString();
}
async function prepareBuyOffer(offerDetails, runtime) {
  try {
    const userDefinedPrivateKey = runtime.getSetting("SOLANA_PRIVATE_KEY");
    const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
    const signature = await hashAndSign(offerDetails, solanaKeypair.privateKey);
    const buyOffer = {
      message: offerDetails,
      identity: await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey),
      signature,
      _id: signature
      // TODO make this more resilient in the future
    };
    return buyOffer;
  } catch (error) {
    console.error("Error preparing buy offer", error);
    throw error;
  }
}
async function prepareServiceAd(services, runtime, contactInfo) {
  try {
    const userDefinedPrivateKey = runtime.getSetting("SOLANA_PRIVATE_KEY");
    const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
    const base58PublicKey = await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey);
    const message = {
      services: services.map((service, index) => {
        return {
          id: index,
          ...service
        };
      }),
      wallet: base58PublicKey,
      contactInfo
    };
    const signature = await hashAndSign(message, solanaKeypair.privateKey);
    const formattedServices = {
      message,
      identity: base58PublicKey,
      signature,
      _id: signature
      // TODO make this more resilient in the future
    };
    return formattedServices;
  } catch (error) {
    console.error("Error formatting sellerServices.json", error);
    throw error;
  }
}
async function prepareAgreement(agreementDetails, runtime) {
  try {
    const userDefinedPrivateKey = runtime.getSetting("SOLANA_PRIVATE_KEY");
    const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
    const base58PublicKey = await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey);
    const message = {
      ...agreementDetails
    };
    const signature = await hashAndSign(message, solanaKeypair.privateKey);
    const formattedAgreement = {
      message,
      identity: base58PublicKey,
      signature,
      _id: signature
    };
    return formattedAgreement;
  } catch (error) {
    console.error("Error formatting agreement", error);
    throw error;
  }
}
async function queryOrbitDbReturningCompleteEntries(db, findFunction) {
  const results = [];
  for await (const doc of db.iterator()) {
    if (findFunction(doc.value)) {
      doc.cid = getCIDFromOrbitDbHash(doc.hash);
      results.push(doc);
    }
  }
  return results;
}
async function getAllDbEntriesWithCIDs(db) {
  const results = [];
  for await (const doc of db.iterator()) {
    doc.cid = getCIDFromOrbitDbHash(doc.hash);
    results.push(doc);
  }
  return results;
}
async function getBase58PublicKey(runtime) {
  const userDefinedPrivateKey = runtime.getSetting("SOLANA_PRIVATE_KEY");
  const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
  return await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey);
}
function sortObjectByKey(message) {
  const sortedMessage = Object.keys(message).sort().reduce((obj, key) => {
    if (message[key] && typeof message[key] === "object") {
      if (Array.isArray(message[key])) {
        obj[key] = message[key].map(
          (item) => typeof item === "object" && item !== null ? sortObjectByKey(item) : item
        );
      } else {
        obj[key] = sortObjectByKey(message[key]);
      }
    } else {
      obj[key] = message[key];
    }
    return obj;
  }, {});
  return sortedMessage;
}
async function getTwitterClientFromRuntime(runtime) {
  const twitterClient = runtime.clients.find((client) => {
    var _a;
    if (!client) return false;
    return ((_a = client == null ? void 0 : client.constructor) == null ? void 0 : _a.name) === "TwitterManager";
  });
  return twitterClient;
}
async function getFullUrl(shortUrl) {
  const response = await fetch(shortUrl);
  return response.url;
}
async function getCIDFromShortUrl(shortUrl) {
  const url = await getFullUrl(shortUrl);
  const cid = await getCIDFromIpfsUrl(url);
  return cid;
}
async function getTxFromShortUrl(shortUrl) {
  const url = await getFullUrl(shortUrl);
  const tx = await getTxFromSolscanUrl(url);
  return tx;
}
async function getCIDFromIpfsUrl(ipfsUrl) {
  const cid = ipfsUrl.split("/ipfs/")[1];
  return cid;
}
async function getTxFromSolscanUrl(url) {
  const tx = url.split("/tx/")[1];
  return tx;
}

// src/payment.ts
import {
  appendTransactionMessageInstruction,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  createSignerFromKeyPair,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners
} from "@solana/web3.js";
import { getAddressEncoder as getAddressEncoder8, getProgramDerivedAddress as getProgramDerivedAddress10, getBytesEncoder as getBytesEncoder15 } from "@solana/web3.js";
import {
  elizaLogger
} from "@elizaos/core";

// src/generated/accounts/buyerContractCounter.ts
import {
  assertAccountExists,
  assertAccountsExist,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder
} from "@solana/web3.js";
var BUYER_CONTRACT_COUNTER_DISCRIMINATOR = new Uint8Array([
  181,
  162,
  88,
  45,
  74,
  176,
  199,
  99
]);
function getBuyerContractCounterDecoder() {
  return getStructDecoder([
    ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
    ["counter", getU64Decoder()]
  ]);
}
function decodeBuyerContractCounter(encodedAccount) {
  return decodeAccount(
    encodedAccount,
    getBuyerContractCounterDecoder()
  );
}
async function fetchBuyerContractCounter(rpc, address, config) {
  const maybeAccount = await fetchMaybeBuyerContractCounter(
    rpc,
    address,
    config
  );
  assertAccountExists(maybeAccount);
  return maybeAccount;
}
async function fetchMaybeBuyerContractCounter(rpc, address, config) {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeBuyerContractCounter(maybeAccount);
}

// src/generated/accounts/contract.ts
import {
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  assertAccountExists as assertAccountExists2,
  assertAccountsExist as assertAccountsExist2,
  combineCodec as combineCodec2,
  decodeAccount as decodeAccount2,
  fetchEncodedAccount as fetchEncodedAccount2,
  fetchEncodedAccounts as fetchEncodedAccounts2,
  fixDecoderSize as fixDecoderSize2,
  fixEncoderSize as fixEncoderSize2,
  getAddressDecoder,
  getAddressEncoder,
  getBooleanDecoder,
  getBooleanEncoder,
  getBytesDecoder as getBytesDecoder2,
  getBytesEncoder as getBytesEncoder2,
  getStructDecoder as getStructDecoder2,
  getStructEncoder as getStructEncoder2,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder as getU64Decoder2,
  getU64Encoder as getU64Encoder2,
  getUtf8Decoder,
  getUtf8Encoder,
  transformEncoder as transformEncoder2
} from "@solana/web3.js";
var CONTRACT_DISCRIMINATOR = new Uint8Array([
  172,
  138,
  115,
  242,
  121,
  67,
  183,
  26
]);
function getContractDecoder() {
  return getStructDecoder2([
    ["discriminator", fixDecoderSize2(getBytesDecoder2(), 8)],
    ["cid", addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ["buyer", getAddressDecoder()],
    ["seller", getAddressDecoder()],
    ["amount", getU64Decoder2()],
    ["buyerCounter", getU64Decoder2()],
    ["isReleased", getBooleanDecoder()]
  ]);
}
function decodeContract(encodedAccount) {
  return decodeAccount2(
    encodedAccount,
    getContractDecoder()
  );
}
async function fetchContract(rpc, address, config) {
  const maybeAccount = await fetchMaybeContract(rpc, address, config);
  assertAccountExists2(maybeAccount);
  return maybeAccount;
}
async function fetchMaybeContract(rpc, address, config) {
  const maybeAccount = await fetchEncodedAccount2(rpc, address, config);
  return decodeContract(maybeAccount);
}

// src/generated/accounts/globalState.ts
import {
  assertAccountExists as assertAccountExists3,
  assertAccountsExist as assertAccountsExist3,
  combineCodec as combineCodec3,
  decodeAccount as decodeAccount3,
  fetchEncodedAccount as fetchEncodedAccount3,
  fetchEncodedAccounts as fetchEncodedAccounts3,
  fixDecoderSize as fixDecoderSize3,
  fixEncoderSize as fixEncoderSize3,
  getAddressDecoder as getAddressDecoder2,
  getAddressEncoder as getAddressEncoder2,
  getBytesDecoder as getBytesDecoder3,
  getBytesEncoder as getBytesEncoder3,
  getStructDecoder as getStructDecoder3,
  getStructEncoder as getStructEncoder3,
  getU64Decoder as getU64Decoder3,
  getU64Encoder as getU64Encoder3,
  transformEncoder as transformEncoder3
} from "@solana/web3.js";
var GLOBAL_STATE_DISCRIMINATOR = new Uint8Array([
  163,
  46,
  74,
  168,
  216,
  123,
  133,
  98
]);
function getGlobalStateDecoder() {
  return getStructDecoder3([
    ["discriminator", fixDecoderSize3(getBytesDecoder3(), 8)],
    ["admin", getAddressDecoder2()],
    ["buyerFeePct", getU64Decoder3()],
    ["sellerFeePct", getU64Decoder3()]
  ]);
}
function decodeGlobalState(encodedAccount) {
  return decodeAccount3(
    encodedAccount,
    getGlobalStateDecoder()
  );
}
async function fetchGlobalState(rpc, address, config) {
  const maybeAccount = await fetchMaybeGlobalState(rpc, address, config);
  assertAccountExists3(maybeAccount);
  return maybeAccount;
}
async function fetchMaybeGlobalState(rpc, address, config) {
  const maybeAccount = await fetchEncodedAccount3(rpc, address, config);
  return decodeGlobalState(maybeAccount);
}

// src/generated/errors/payaiMarketplace.ts
import {
  isProgramError
} from "@solana/web3.js";

// src/generated/programs/payaiMarketplace.ts
import {
  containsBytes,
  fixEncoderSize as fixEncoderSize4,
  getBytesEncoder as getBytesEncoder4
} from "@solana/web3.js";
var PAYAI_MARKETPLACE_PROGRAM_ADDRESS = "5FhmaXvWm1FZ3bpsE5rxkey5pNWDLkvaGAzoGkTUZfZ3";

// src/generated/errors/payaiMarketplace.ts
var PAYAI_MARKETPLACE_ERROR__UNAUTHORIZED = 6e3;
var PAYAI_MARKETPLACE_ERROR__ALREADY_RELEASED = 6001;
var PAYAI_MARKETPLACE_ERROR__INVALID_AMOUNT = 6002;
var payaiMarketplaceErrorMessages;
if (process.env.NODE_ENV !== "production") {
  payaiMarketplaceErrorMessages = {
    [PAYAI_MARKETPLACE_ERROR__ALREADY_RELEASED]: `Payment has already been released`,
    [PAYAI_MARKETPLACE_ERROR__INVALID_AMOUNT]: `Invalid escrow amount`,
    [PAYAI_MARKETPLACE_ERROR__UNAUTHORIZED]: `Unauthorized action`
  };
}

// src/generated/instructions/collectPlatformFees.ts
import {
  combineCodec as combineCodec4,
  fixDecoderSize as fixDecoderSize4,
  fixEncoderSize as fixEncoderSize5,
  getBytesDecoder as getBytesDecoder4,
  getBytesEncoder as getBytesEncoder5,
  getProgramDerivedAddress,
  getStructDecoder as getStructDecoder4,
  getStructEncoder as getStructEncoder4,
  transformEncoder as transformEncoder4
} from "@solana/web3.js";

// src/generated/shared/index.ts
import {
  AccountRole,
  isProgramDerivedAddress,
  isTransactionSigner as web3JsIsTransactionSigner,
  upgradeRoleToSigner
} from "@solana/web3.js";
function expectAddress(value) {
  if (!value) {
    throw new Error("Expected a Address.");
  }
  if (typeof value === "object" && "address" in value) {
    return value.address;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
function getAccountMetaFactory(programAddress, optionalAccountStrategy) {
  return (account) => {
    if (!account.value) {
      if (optionalAccountStrategy === "omitted") return;
      return Object.freeze({
        address: programAddress,
        role: AccountRole.READONLY
      });
    }
    const writableRole = account.isWritable ? AccountRole.WRITABLE : AccountRole.READONLY;
    return Object.freeze({
      address: expectAddress(account.value),
      role: isTransactionSigner(account.value) ? upgradeRoleToSigner(writableRole) : writableRole,
      ...isTransactionSigner(account.value) ? { signer: account.value } : {}
    });
  };
}
function isTransactionSigner(value) {
  return !!value && typeof value === "object" && "address" in value && web3JsIsTransactionSigner(value);
}

// src/generated/instructions/collectPlatformFees.ts
var COLLECT_PLATFORM_FEES_DISCRIMINATOR = new Uint8Array([
  191,
  153,
  219,
  164,
  5,
  65,
  153,
  48
]);

// src/generated/instructions/initializeBuyerContractCounter.ts
import {
  combineCodec as combineCodec5,
  fixDecoderSize as fixDecoderSize5,
  fixEncoderSize as fixEncoderSize6,
  getAddressEncoder as getAddressEncoder3,
  getBytesDecoder as getBytesDecoder5,
  getBytesEncoder as getBytesEncoder6,
  getProgramDerivedAddress as getProgramDerivedAddress2,
  getStructDecoder as getStructDecoder5,
  getStructEncoder as getStructEncoder5,
  transformEncoder as transformEncoder5
} from "@solana/web3.js";
var INITIALIZE_BUYER_CONTRACT_COUNTER_DISCRIMINATOR = new Uint8Array([
  21,
  138,
  242,
  28,
  218,
  19,
  71,
  106
]);
function getInitializeBuyerContractCounterInstructionDataEncoder() {
  return transformEncoder5(
    getStructEncoder5([["discriminator", fixEncoderSize6(getBytesEncoder6(), 8)]]),
    (value) => ({
      ...value,
      discriminator: INITIALIZE_BUYER_CONTRACT_COUNTER_DISCRIMINATOR
    })
  );
}
function getInitializeBuyerContractCounterInstruction(input, config) {
  const programAddress = (config == null ? void 0 : config.programAddress) ?? PAYAI_MARKETPLACE_PROGRAM_ADDRESS;
  const originalAccounts = {
    signer: { value: input.signer ?? null, isWritable: true },
    buyerContractCounter: {
      value: input.buyerContractCounter ?? null,
      isWritable: true
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false }
  };
  const accounts = originalAccounts;
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111";
  }
  const getAccountMeta = getAccountMetaFactory(programAddress, "programId");
  const instruction = {
    accounts: [
      getAccountMeta(accounts.signer),
      getAccountMeta(accounts.buyerContractCounter),
      getAccountMeta(accounts.systemProgram)
    ],
    programAddress,
    data: getInitializeBuyerContractCounterInstructionDataEncoder().encode({})
  };
  return instruction;
}

// src/generated/instructions/initializeGlobalState.ts
import {
  combineCodec as combineCodec6,
  fixDecoderSize as fixDecoderSize6,
  fixEncoderSize as fixEncoderSize7,
  getBytesDecoder as getBytesDecoder6,
  getBytesEncoder as getBytesEncoder7,
  getProgramDerivedAddress as getProgramDerivedAddress3,
  getStructDecoder as getStructDecoder6,
  getStructEncoder as getStructEncoder6,
  transformEncoder as transformEncoder6
} from "@solana/web3.js";
var INITIALIZE_GLOBAL_STATE_DISCRIMINATOR = new Uint8Array([
  232,
  254,
  209,
  244,
  123,
  89,
  154,
  207
]);

// src/generated/instructions/readContract.ts
import {
  combineCodec as combineCodec7,
  fixDecoderSize as fixDecoderSize7,
  fixEncoderSize as fixEncoderSize8,
  getBytesDecoder as getBytesDecoder7,
  getBytesEncoder as getBytesEncoder8,
  getStructDecoder as getStructDecoder7,
  getStructEncoder as getStructEncoder7,
  transformEncoder as transformEncoder7
} from "@solana/web3.js";
var READ_CONTRACT_DISCRIMINATOR = new Uint8Array([
  25,
  214,
  238,
  0,
  237,
  193,
  42,
  3
]);

// src/generated/instructions/refundBuyer.ts
import {
  combineCodec as combineCodec8,
  fixDecoderSize as fixDecoderSize8,
  fixEncoderSize as fixEncoderSize9,
  getAddressEncoder as getAddressEncoder4,
  getBytesDecoder as getBytesDecoder8,
  getBytesEncoder as getBytesEncoder9,
  getProgramDerivedAddress as getProgramDerivedAddress4,
  getStructDecoder as getStructDecoder8,
  getStructEncoder as getStructEncoder8,
  transformEncoder as transformEncoder8
} from "@solana/web3.js";
var REFUND_BUYER_DISCRIMINATOR = new Uint8Array([
  199,
  139,
  203,
  146,
  192,
  150,
  53,
  218
]);

// src/generated/instructions/releasePayment.ts
import {
  combineCodec as combineCodec9,
  fixDecoderSize as fixDecoderSize9,
  fixEncoderSize as fixEncoderSize10,
  getAddressEncoder as getAddressEncoder5,
  getBytesDecoder as getBytesDecoder9,
  getBytesEncoder as getBytesEncoder10,
  getProgramDerivedAddress as getProgramDerivedAddress5,
  getStructDecoder as getStructDecoder9,
  getStructEncoder as getStructEncoder9,
  transformEncoder as transformEncoder9
} from "@solana/web3.js";
var RELEASE_PAYMENT_DISCRIMINATOR = new Uint8Array([
  24,
  34,
  191,
  86,
  145,
  160,
  183,
  233
]);
function getReleasePaymentInstructionDataEncoder() {
  return transformEncoder9(
    getStructEncoder9([["discriminator", fixEncoderSize10(getBytesEncoder10(), 8)]]),
    (value) => ({ ...value, discriminator: RELEASE_PAYMENT_DISCRIMINATOR })
  );
}
async function getReleasePaymentInstructionAsync(input, config) {
  const programAddress = (config == null ? void 0 : config.programAddress) ?? PAYAI_MARKETPLACE_PROGRAM_ADDRESS;
  const originalAccounts = {
    signer: { value: input.signer ?? null, isWritable: true },
    contract: { value: input.contract ?? null, isWritable: true },
    escrowVault: { value: input.escrowVault ?? null, isWritable: true },
    seller: { value: input.seller ?? null, isWritable: true },
    globalState: { value: input.globalState ?? null, isWritable: true },
    platformFeeVault: {
      value: input.platformFeeVault ?? null,
      isWritable: true
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false }
  };
  const accounts = originalAccounts;
  if (!accounts.escrowVault.value) {
    accounts.escrowVault.value = await getProgramDerivedAddress5({
      programAddress,
      seeds: [
        getBytesEncoder10().encode(
          new Uint8Array([
            101,
            115,
            99,
            114,
            111,
            119,
            95,
            118,
            97,
            117,
            108,
            116
          ])
        ),
        getAddressEncoder5().encode(expectAddress(accounts.contract.value))
      ]
    });
  }
  if (!accounts.globalState.value) {
    accounts.globalState.value = await getProgramDerivedAddress5({
      programAddress,
      seeds: [
        getBytesEncoder10().encode(
          new Uint8Array([
            103,
            108,
            111,
            98,
            97,
            108,
            95,
            115,
            116,
            97,
            116,
            101
          ])
        )
      ]
    });
  }
  if (!accounts.platformFeeVault.value) {
    accounts.platformFeeVault.value = await getProgramDerivedAddress5({
      programAddress,
      seeds: [
        getBytesEncoder10().encode(
          new Uint8Array([
            112,
            108,
            97,
            116,
            102,
            111,
            114,
            109,
            95,
            102,
            101,
            101,
            95,
            118,
            97,
            117,
            108,
            116
          ])
        )
      ]
    });
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111";
  }
  const getAccountMeta = getAccountMetaFactory(programAddress, "programId");
  const instruction = {
    accounts: [
      getAccountMeta(accounts.signer),
      getAccountMeta(accounts.contract),
      getAccountMeta(accounts.escrowVault),
      getAccountMeta(accounts.seller),
      getAccountMeta(accounts.globalState),
      getAccountMeta(accounts.platformFeeVault),
      getAccountMeta(accounts.systemProgram)
    ],
    programAddress,
    data: getReleasePaymentInstructionDataEncoder().encode({})
  };
  return instruction;
}

// src/generated/instructions/startContract.ts
import {
  addDecoderSizePrefix as addDecoderSizePrefix2,
  addEncoderSizePrefix as addEncoderSizePrefix2,
  combineCodec as combineCodec10,
  fixDecoderSize as fixDecoderSize10,
  fixEncoderSize as fixEncoderSize11,
  getAddressDecoder as getAddressDecoder3,
  getAddressEncoder as getAddressEncoder6,
  getBytesDecoder as getBytesDecoder10,
  getBytesEncoder as getBytesEncoder11,
  getProgramDerivedAddress as getProgramDerivedAddress6,
  getStructDecoder as getStructDecoder10,
  getStructEncoder as getStructEncoder10,
  getU32Decoder as getU32Decoder2,
  getU32Encoder as getU32Encoder2,
  getU64Decoder as getU64Decoder4,
  getU64Encoder as getU64Encoder4,
  getUtf8Decoder as getUtf8Decoder2,
  getUtf8Encoder as getUtf8Encoder2,
  transformEncoder as transformEncoder10
} from "@solana/web3.js";
var START_CONTRACT_DISCRIMINATOR = new Uint8Array([
  137,
  123,
  201,
  95,
  241,
  67,
  90,
  245
]);
function getStartContractInstructionDataEncoder() {
  return transformEncoder10(
    getStructEncoder10([
      ["discriminator", fixEncoderSize11(getBytesEncoder11(), 8)],
      ["cid", addEncoderSizePrefix2(getUtf8Encoder2(), getU32Encoder2())],
      ["payoutAddress", getAddressEncoder6()],
      ["escrowAmount", getU64Encoder4()]
    ]),
    (value) => ({ ...value, discriminator: START_CONTRACT_DISCRIMINATOR })
  );
}
async function getStartContractInstructionAsync(input, config) {
  const programAddress = (config == null ? void 0 : config.programAddress) ?? PAYAI_MARKETPLACE_PROGRAM_ADDRESS;
  const originalAccounts = {
    signer: { value: input.signer ?? null, isWritable: true },
    buyerContractCounter: {
      value: input.buyerContractCounter ?? null,
      isWritable: true
    },
    contract: { value: input.contract ?? null, isWritable: true },
    escrowVault: { value: input.escrowVault ?? null, isWritable: true },
    globalState: { value: input.globalState ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false }
  };
  const accounts = originalAccounts;
  const args = { ...input };
  if (!accounts.buyerContractCounter.value) {
    accounts.buyerContractCounter.value = await getProgramDerivedAddress6({
      programAddress,
      seeds: [
        getBytesEncoder11().encode(
          new Uint8Array([
            98,
            117,
            121,
            101,
            114,
            95,
            99,
            111,
            110,
            116,
            114,
            97,
            99,
            116,
            95,
            99,
            111,
            117,
            110,
            116,
            101,
            114
          ])
        ),
        getAddressEncoder6().encode(expectAddress(accounts.signer.value))
      ]
    });
  }
  if (!accounts.escrowVault.value) {
    accounts.escrowVault.value = await getProgramDerivedAddress6({
      programAddress,
      seeds: [
        getBytesEncoder11().encode(
          new Uint8Array([
            101,
            115,
            99,
            114,
            111,
            119,
            95,
            118,
            97,
            117,
            108,
            116
          ])
        ),
        getAddressEncoder6().encode(expectAddress(accounts.contract.value))
      ]
    });
  }
  if (!accounts.globalState.value) {
    accounts.globalState.value = await getProgramDerivedAddress6({
      programAddress,
      seeds: [
        getBytesEncoder11().encode(
          new Uint8Array([
            103,
            108,
            111,
            98,
            97,
            108,
            95,
            115,
            116,
            97,
            116,
            101
          ])
        )
      ]
    });
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111";
  }
  const getAccountMeta = getAccountMetaFactory(programAddress, "programId");
  const instruction = {
    accounts: [
      getAccountMeta(accounts.signer),
      getAccountMeta(accounts.buyerContractCounter),
      getAccountMeta(accounts.contract),
      getAccountMeta(accounts.escrowVault),
      getAccountMeta(accounts.globalState),
      getAccountMeta(accounts.systemProgram)
    ],
    programAddress,
    data: getStartContractInstructionDataEncoder().encode(
      args
    )
  };
  return instruction;
}

// src/generated/instructions/updateAdmin.ts
import {
  combineCodec as combineCodec11,
  fixDecoderSize as fixDecoderSize11,
  fixEncoderSize as fixEncoderSize12,
  getAddressDecoder as getAddressDecoder4,
  getAddressEncoder as getAddressEncoder7,
  getBytesDecoder as getBytesDecoder11,
  getBytesEncoder as getBytesEncoder12,
  getProgramDerivedAddress as getProgramDerivedAddress7,
  getStructDecoder as getStructDecoder11,
  getStructEncoder as getStructEncoder11,
  transformEncoder as transformEncoder11
} from "@solana/web3.js";
var UPDATE_ADMIN_DISCRIMINATOR = new Uint8Array([
  161,
  176,
  40,
  213,
  60,
  184,
  179,
  228
]);

// src/generated/instructions/updateBuyerFee.ts
import {
  combineCodec as combineCodec12,
  fixDecoderSize as fixDecoderSize12,
  fixEncoderSize as fixEncoderSize13,
  getBytesDecoder as getBytesDecoder12,
  getBytesEncoder as getBytesEncoder13,
  getProgramDerivedAddress as getProgramDerivedAddress8,
  getStructDecoder as getStructDecoder12,
  getStructEncoder as getStructEncoder12,
  getU64Decoder as getU64Decoder5,
  getU64Encoder as getU64Encoder5,
  transformEncoder as transformEncoder12
} from "@solana/web3.js";
var UPDATE_BUYER_FEE_DISCRIMINATOR = new Uint8Array([
  94,
  177,
  87,
  223,
  151,
  1,
  247,
  192
]);

// src/generated/instructions/updateSellerFee.ts
import {
  combineCodec as combineCodec13,
  fixDecoderSize as fixDecoderSize13,
  fixEncoderSize as fixEncoderSize14,
  getBytesDecoder as getBytesDecoder13,
  getBytesEncoder as getBytesEncoder14,
  getProgramDerivedAddress as getProgramDerivedAddress9,
  getStructDecoder as getStructDecoder13,
  getStructEncoder as getStructEncoder13,
  getU64Decoder as getU64Decoder6,
  getU64Encoder as getU64Encoder6,
  transformEncoder as transformEncoder13
} from "@solana/web3.js";
var UPDATE_SELLER_FEE_DISCRIMINATOR = new Uint8Array([
  34,
  255,
  173,
  137,
  17,
  241,
  9,
  193
]);

// src/payment.ts
var Payment = class {
  runtime;
  rpcClient;
  authority;
  constructor() {
  }
  /*
   * Initialize the payment client.
   * @param runtime - The runtime.
   */
  initialize = async (runtime) => {
    elizaLogger.info("Initializing PayAI Payment Client");
    this.rpcClient = this.createDefaultSolanaClient(runtime);
    this.authority = await this.createSignerFromBase58PrivateKey(runtime.getSetting("SOLANA_PRIVATE_KEY"));
  };
  /*
   * Create a default Solana client.
   * @param runtime - The runtime.
   * @returns The Solana client.
   */
  createDefaultSolanaClient = (runtime) => {
    const url = runtime.getSetting("SOLANA_RPC_URL");
    const wsUrl = runtime.getSetting("SOLANA_WS_URL");
    const rpc = createSolanaRpc(url);
    const rpcSubscriptions = createSolanaRpcSubscriptions(wsUrl);
    return { rpc, rpcSubscriptions };
  };
  /*
   * Create a signer from a base58 private key.
   * @param privateKey - The private key.
   * @returns The signer.
   */
  createSignerFromBase58PrivateKey = async (privateKey) => {
    const keypair = await getSolanaKeypair(privateKey);
    return createSignerFromKeyPair(keypair);
  };
  /*
   * Fetch a transaction from the RPC.
   * @param signature - The signature of the transaction.
   * @returns The transaction.
   */
  fetchTransaction = async (signature) => {
    const tx = await this.rpcClient.rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0
    }).send();
    return tx;
  };
  /*
   * Create a default transaction.
   * @returns The default transaction.
   */
  createDefaultTransaction = async () => {
    const rpcClient = this.rpcClient;
    const feePayer = this.authority;
    const { value: latestBlockhash } = await rpcClient.rpc.getLatestBlockhash().send();
    return pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx)
    );
  };
  /*
   * Sign and send a transaction.
   * @param rpcClient - The RPC client.
   * @param transactionMessage - The transaction message.
   * @param commitment - The commitment level.
   * @returns The signature of the transaction.
   */
  signAndSendTransaction = async (rpcClient, transactionMessage, commitment = "confirmed") => {
    const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
    const signature = getSignatureFromTransaction(signedTransaction);
    await sendAndConfirmTransactionFactory(rpcClient)(signedTransaction, {
      commitment
    });
    return signature;
  };
  /*
   * Return the address of the buyer contract counter account.
   * @param buyer - The address of the buyer.
   * @returns The address of the buyer contract counter account.
   */
  getBuyerContractCounterAccountAddress = async (buyer) => {
    const addressEncoder = getAddressEncoder8();
    const bytesEncoder = getBytesEncoder15();
    const [pda] = await getProgramDerivedAddress10({
      programAddress: PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
      seeds: [
        // "buyer_contract_counter" as bytes
        bytesEncoder.encode(new Uint8Array([
          98,
          117,
          121,
          101,
          114,
          95,
          99,
          111,
          110,
          116,
          114,
          97,
          99,
          116,
          95,
          99,
          111,
          117,
          110,
          116,
          101,
          114
        ])),
        addressEncoder.encode(buyer)
      ]
    });
    return pda;
  };
  /*
   * Return the address of the contract account.
   * @param signer - The address of the signer.
   * @param counter - The counter value from the buyer contract counter.
   * @returns The address of the contract account.
   */
  getContractAccountAddress = async (signer, counter) => {
    const addressEncoder = getAddressEncoder8();
    const bytesEncoder = getBytesEncoder15();
    const counterBuffer = new ArrayBuffer(8);
    const view = new DataView(counterBuffer);
    view.setUint32(0, Number(counter & BigInt(4294967295)), true);
    view.setUint32(4, Number(counter >> BigInt(32)), true);
    const [pda] = await getProgramDerivedAddress10({
      programAddress: PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
      seeds: [
        // "contract" as bytes
        bytesEncoder.encode(new Uint8Array([
          99,
          111,
          110,
          116,
          114,
          97,
          99,
          116
        ])),
        addressEncoder.encode(signer),
        new Uint8Array(counterBuffer)
      ]
    });
    return pda;
  };
  /* Return the BuyerContractCounter account for the given buyer.
   * @param buyer - The address of the buyer.
   * @returns The BuyerContractCounter account.
   */
  getBuyerContractCounterAccount = async (buyer) => {
    const buyerContractCounter = await this.getBuyerContractCounterAccountAddress(buyer);
    try {
      const counterAccount = await fetchBuyerContractCounter(
        this.rpcClient.rpc,
        buyerContractCounter
      );
      return counterAccount;
    } catch (error) {
      elizaLogger.error("BuyerContractCounter account not found");
      return null;
    }
  };
  /*
   * Return the address of the global state account.
   * @returns The address of the global state account.
   */
  getGlobalStateAccountAddress = async () => {
    const bytesEncoder = getBytesEncoder15();
    const [pda] = await getProgramDerivedAddress10({
      programAddress: PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
      seeds: [
        // "global_state" as bytes
        bytesEncoder.encode(new Uint8Array([103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]))
      ]
    });
    return pda;
  };
  /*
   * Return the address of the escrow vault account.
   * @returns The address of the escrow vault account.
   */
  getEscrowVaultAccountAddress = async () => {
    const bytesEncoder = getBytesEncoder15();
    const [pda] = await getProgramDerivedAddress10({
      programAddress: PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
      seeds: [
        // "escrow_vault" as bytes
        bytesEncoder.encode(new Uint8Array([101, 115, 99, 114, 111, 119, 95, 118, 97, 117, 108, 116]))
      ]
    });
    return pda;
  };
  /*
   * Return the address of the platform fee vault account.
   * @returns The address of the platform fee vault account.
   */
  getPlatformFeeVaultAccountAddress = async () => {
    const bytesEncoder = getBytesEncoder15();
    const [pda] = await getProgramDerivedAddress10({
      programAddress: PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
      seeds: [
        // "platform_fee_vault" as bytes
        bytesEncoder.encode(new Uint8Array([112, 108, 97, 116, 102, 111, 114, 109, 95, 102, 101, 101, 95, 118, 97, 117, 108, 116]))
      ]
    });
    return pda;
  };
  /* 
   * Return the global state account.
   * @returns The global state account.
   */
  getGlobalStateAccount = async () => {
    const globalStateAddress = await this.getGlobalStateAccountAddress();
    const globalState = await fetchGlobalState(this.rpcClient.rpc, globalStateAddress);
    return globalState;
  };
  /*
   * Initialize the BuyerContractCounter account for the agent.
   * It uses the agent's SOLANA_PRIVATE_KEY to sign the transaction.
   */
  initializeBuyerContractCounter = async () => {
    const initializeTx = getInitializeBuyerContractCounterInstruction({
      signer: this.authority,
      buyerContractCounter: await this.getBuyerContractCounterAccountAddress(this.authority.address)
    });
    await pipe(
      await this.createDefaultTransaction(),
      (tx) => appendTransactionMessageInstruction(initializeTx, tx),
      (tx) => this.signAndSendTransaction(this.rpcClient, tx)
    );
    elizaLogger.info("BuyerContractCounter account initialized.");
    const account = await this.getBuyerContractCounterAccount(this.authority.address);
    elizaLogger.debug("BuyerContractCounter account:", account);
    return account;
  };
  /*
   * Start the contract by funding the escrow.
   * @param cid - The IFPS CID of the Agreement.
   * @param seller - The address of the seller.
   * @param escrowAmount - The amount of lamports to fund the escrow.
   * @returns The signature of the transaction.
   */
  startContract = async (cid, seller, escrowAmount) => {
    var _a;
    elizaLogger.debug("Executing contract by funding escrow...");
    const buyer = this.authority.address;
    let buyerContractCounter = await this.getBuyerContractCounterAccount(buyer);
    if (!buyerContractCounter) {
      elizaLogger.debug("BuyerContractCounter account not found, initializing...");
      buyerContractCounter = await this.initializeBuyerContractCounter();
      elizaLogger.debug("BuyerContractCounter account initialized.");
    }
    const contractAccountAddress = await this.getContractAccountAddress(buyer, (_a = buyerContractCounter.data) == null ? void 0 : _a.counter);
    const globalStateAddress = await this.getGlobalStateAccountAddress();
    const startContractTx = await getStartContractInstructionAsync({
      signer: this.authority,
      buyerContractCounter,
      contract: contractAccountAddress,
      globalState: globalStateAddress,
      cid,
      payoutAddress: seller,
      escrowAmount: lamports(BigInt(escrowAmount))
    });
    const signature = await pipe(
      await this.createDefaultTransaction(),
      (tx) => appendTransactionMessageInstruction(startContractTx, tx),
      (tx) => this.signAndSendTransaction(this.rpcClient, tx)
    );
    elizaLogger.info("Contract started.");
    return signature;
  };
  /*
   * Release the payment from the contract.
   * @param contractAccountAddress - The address of the contract account.
   * @param seller - The address of the seller.
   * @returns The signature of the transaction.
   */
  releasePayment = async (contractAccountAddress, seller) => {
    elizaLogger.debug("Releasing funds from contract...");
    const globalStateAddress = await this.getGlobalStateAccountAddress();
    const platformFeeVaultAddress = await this.getPlatformFeeVaultAccountAddress();
    const releasePaymentTx = await getReleasePaymentInstructionAsync({
      signer: this.authority,
      contract: contractAccountAddress,
      seller,
      globalState: globalStateAddress,
      platformFeeVault: platformFeeVaultAddress
    });
    const signature = await pipe(
      await this.createDefaultTransaction(),
      (tx) => appendTransactionMessageInstruction(releasePaymentTx, tx),
      (tx) => this.signAndSendTransaction(this.rpcClient, tx)
    );
    elizaLogger.info(`Funds released for contract ${contractAccountAddress}`);
    return signature;
  };
  /*
   * Get the contract account from a transaction signature.
   * @param transactionSignature - The signature of the transaction that created the contract.
   * @returns The contract account data.
   */
  getContractAccountFromTransaction = async (transactionSignature) => {
    try {
      const transaction = await this.fetchTransaction(transactionSignature);
      if (!transaction) {
        elizaLogger.error("Transaction not found");
        return null;
      }
      let contractAccount;
      for (const account of transaction.transaction.message.accountKeys) {
        try {
          contractAccount = await fetchContract(
            this.rpcClient.rpc,
            account
          );
          if (contractAccount.data) {
            elizaLogger.debug("Contract found in account", account);
            break;
          }
        } catch (error) {
          elizaLogger.debug("Contract not found in account", account);
        }
      }
      return contractAccount;
    } catch (error) {
      elizaLogger.error("Error getting contract account from transaction:", error);
      return null;
    }
  };
};
var paymentClient = new Payment();

// src/clients/client.ts
var {
  createHash: createHash2
} = await import("node:crypto");
var PayAIClient = class {
  libp2p = null;
  ipfs = null;
  orbitdb = null;
  updatesDB = null;
  serviceAdsDB = null;
  buyOffersDB = null;
  agreementsDB = null;
  fundedContractsDB = null;
  servicesConfigPath;
  sellerServiceAdCID = null;
  constructor() {
    elizaLogger2.debug("PayAI Client created");
  }
  /**
   * Initializes the PayAI Client by creating libp2p, Helia, and OrbitDB instances.
   */
  async initialize(runtime) {
    var _a, _b;
    try {
      elizaLogger2.info("Initializing PayAI Client");
      const agentDir = dataDir + "/" + runtime.character.name;
      const userPublicKey = await getBase58PublicKey(runtime);
      elizaLogger2.info("User public key: ", userPublicKey);
      await paymentClient.initialize(runtime);
      const libp2pDatastore = new LevelDatastore(agentDir + "/libp2p");
      const libp2pConfig = Object.assign({}, libp2pOptions);
      libp2pConfig.datastore = libp2pDatastore;
      const libp2pPrivateKey = await getOrCreateLibp2pKeypair(agentDir + "/libp2p/keypair.json");
      libp2pConfig.privateKey = libp2pPrivateKey;
      this.libp2p = await createLibp2p(libp2pConfig);
      elizaLogger2.info("libp2p PeerID: ", (_a = this.libp2p) == null ? void 0 : _a.peerId.toString());
      elizaLogger2.info("libp2p addresses: ", this.libp2p.getMultiaddrs());
      const blockstore = new FsBlockstore(agentDir + "/ipfs");
      this.ipfs = await createHelia({ libp2p: this.libp2p, blockstore });
      this.orbitdb = await createOrbitDB({
        ipfs: this.ipfs,
        directory: agentDir,
        id: (_b = this.libp2p) == null ? void 0 : _b.peerId.toString()
      });
      this.updatesDB = await this.orbitdb.open(bootstrap_default.databases.updates, { sync: true });
      this.updatesDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai updates db: ", entry.payload.value);
        if (entry.key === this.orbitdb.identity.publicKey) {
          await this.restartLibp2p();
        }
      });
      this.serviceAdsDB = await this.orbitdb.open(bootstrap_default.databases.serviceAds, { sync: true });
      this.serviceAdsDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai service ads db: ", entry.payload.value);
        if (entry.key === this.orbitdb.identity.publicKey) {
          await this.restartLibp2p();
        }
      });
      this.buyOffersDB = await this.orbitdb.open(bootstrap_default.databases.buyOffers, { sync: true });
      this.buyOffersDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai buy offers db: ", entry.payload.value);
        if (entry.key === this.orbitdb.identity.publicKey) {
          await this.restartLibp2p();
        }
      });
      this.agreementsDB = await this.orbitdb.open(bootstrap_default.databases.agreements, { sync: true });
      this.agreementsDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai agreements db: ", entry.payload.value);
        if (entry.key === this.orbitdb.identity.publicKey) {
          await this.restartLibp2p();
        }
      });
      this.fundedContractsDB = await this.orbitdb.open(bootstrap_default.databases.fundedContracts, { sync: true });
      this.fundedContractsDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai funded contracts db: ", entry.payload.value);
        if (entry.key === this.orbitdb.identity.publicKey) {
          await this.restartLibp2p();
        }
      });
      this.servicesConfigPath = `${agentDir}/sellerServices.json`;
      await this.initSellerAgentFunctionality(runtime);
      elizaLogger2.info("PayAI Client initialized");
    } catch (error) {
      elizaLogger2.error("Failed to initialize PayAI Client", error);
      throw error;
    }
  }
  /**
   * Restarts the libp2p instance.
   * This is hacky but unfortunately necessary at the moment for orbitdb changes to propagate.
   */
  async restartLibp2p() {
    elizaLogger2.info("Restarting libp2p");
    await this.libp2p.stop();
    await this.libp2p.start();
  }
  /**
   * Initializes the seller agent functionality.
   * This includes loading the sellerServices.json file, updating the serviceAds database
   * if necessary, and periodically checking for updates to the sellerServices.json file.
   * @param runtime - The runtime context for the client.
   */
  async initSellerAgentFunctionality(runtime) {
    var _a;
    if (fs2.existsSync(this.servicesConfigPath)) {
      const localServices = JSON.parse(fs2.readFileSync(this.servicesConfigPath, "utf-8"));
      this.setServicesConfig(localServices);
      const contactInfo = { "libp2p": (_a = this.libp2p) == null ? void 0 : _a.peerId.toString() };
      const twitterUsername = runtime.getSetting("TWITTER_USERNAME");
      if (twitterUsername) {
        contactInfo["twitter"] = `@${twitterUsername}`;
      }
      const localServiceAd = await prepareServiceAd(localServices, runtime, contactInfo);
      const fetchedServiceAds = await queryOrbitDbReturningCompleteEntries(
        this.serviceAdsDB,
        (doc) => {
          return prepareMessageForHashing(doc.message) == prepareMessageForHashing(localServiceAd.message) && doc.signature === localServiceAd.signature;
        }
      );
      if (fetchedServiceAds.length === 0) {
        elizaLogger2.info("Local services does not match serviceAdsDB, adding to database");
        await this.publishPreparedServiceAd(localServiceAd);
      } else {
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(fetchedServiceAds[0].hash);
        elizaLogger2.info("Local services matches serviceAdsDB, no need to update the database");
      }
    }
  }
  /*
   * Sets the servicesConfig.
   * Should be called anytime the sellerServices.json file is updated.
   */
  setServicesConfig(servicesConfig) {
    this.servicesConfig = servicesConfig;
  }
  /*
   * Writes the services to the sellerServices.json file.
   * Updates the servicesConfig in memory.
   */
  saveSellerServices(services) {
    fs2.writeFileSync(this.servicesConfigPath, services);
    this.setServicesConfig(services);
  }
  /*
   * Publishes a service ad to the PayAI network.
   * Updates the sellerServiceAdCID in memory.
   * @param serviceAd - The service ad to publish.
   * @returns The IPFS CID of the published service ad.
   */
  async publishPreparedServiceAd(serviceAd) {
    try {
      const hash = await this.serviceAdsDB.put(serviceAd);
      const cid = getCIDFromOrbitDbHash(hash);
      this.sellerServiceAdCID = cid;
      elizaLogger2.info("Published service ad to IPFS:", this.sellerServiceAdCID);
      return this.sellerServiceAdCID;
    } catch (error) {
      elizaLogger2.error("Error publishing prepared service ad", error);
      throw error;
    }
  }
  /*
   * Function to get an OrbitDB entry using its hash.
   */
  async getEntryFromHash(hash, db) {
    try {
      const entry = await db.log.get(hash);
      return entry;
    } catch (error) {
      elizaLogger2.error("Error getting orbitdb entry from hash", error);
      throw error;
    }
  }
  /* Function to get an OrbitDB entry using its ipfs CID. */
  async getEntryFromCID(cid, db) {
    const hash = CID2.parse(cid).toString(base58btc2);
    return this.getEntryFromHash(hash, db);
  }
  /*
   * Close the OrbitDB databases.
   */
  async closeDatabases() {
    try {
      await this.updatesDB.close();
      await this.serviceAdsDB.close();
      await this.buyOffersDB.close();
      await this.agreementsDB.close();
      await this.fundedContractsDB.close();
    } catch (error) {
      elizaLogger2.error("Failed to close databases", error);
      throw error;
    }
  }
  /**
   * Starts the PayAI Client.
   * @param runtime - The runtime context for the client.
   */
  async start(runtime) {
    try {
      await this.initialize(runtime);
      elizaLogger2.info("PayAI Client started");
    } catch (error) {
      elizaLogger2.error("Error while starting PayAI Client", error);
      console.error(error);
      throw error;
    }
  }
  /**
   * Stops the PayAI Client.
   * @param runtime - The runtime context for the client.
   */
  async stop(runtime) {
    try {
      await this.closeDatabases();
      await this.orbitdb.stop();
      await this.ipfs.stop();
      elizaLogger2.info("PayAI Client stopped");
    } catch (error) {
      elizaLogger2.error("Error while stopping PayAI Client", error);
      throw error;
    }
  }
};
var payAIClient = new PayAIClient();

// src/services/services.ts
import { Service, elizaLogger as elizaLogger3, ServiceType, stringToUuid, composeContext, generateText, ModelClass, cleanJsonResponse } from "@elizaos/core";
var successfulResponseToUserTemplate = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Create a twitter post responding to the buyer letting them know that you have completed the work for this job.
Ask them to review the work and then release the payment if they are happy with the work.
Your response should be 260 characters or less.
The completed work is available at the following URL: {{completedWorkUrl}}
Don't tag the user in your response.

Here is a preview of the completed work:
{{previewOfCompletedWork}}

Here is your previous conversation with the buyer:
{{recentMessages}}

For example:
{
    "success": true,
    "result": "A natural message informing the user that the work has been completed, asking them to review the work, and including the URL to the work."
}

Return JSON markdown only.
`;
var PayAIJobManagerService = class extends Service {
  static get serviceType() {
    return ServiceType.TEXT_GENERATION;
  }
  handleWorkInterval;
  async initialize(runtime) {
    this.handleWorkInterval = setInterval(() => {
      this.handlePayAIWork(runtime);
    }, 6e4);
    elizaLogger3.info("PayAIJobManagerService initialized");
  }
  async stop() {
    clearInterval(this.handleWorkInterval);
    elizaLogger3.info("PayAIJobManagerService stopped");
  }
  /**
   * Handles PayAI work tasks in the background
   * @param runtime The agent runtime instance
   */
  async handlePayAIWork(runtime) {
    elizaLogger3.debug("Checking for new jobs to work on.");
    const cacheKey = `${runtime.agentId}-payai-contracts`;
    const contracts = await runtime.cacheManager.get(cacheKey);
    if (!contracts) {
      elizaLogger3.debug("No new jobs to be worked");
      return;
    }
    for (let contract in contracts) {
      const jobDetails = await runtime.cacheManager.get(
        `${runtime.agentId}-payai-job-details-contract-${contract}`
      );
      if (jobDetails.status === "NOT_STARTED") {
        try {
          await runJob(runtime, contract, jobDetails);
        } catch (error) {
          console.error(error);
          elizaLogger3.error(`Error working on job ${jobDetails.agreementCID}:`, error);
          jobDetails.status = "FAILED";
          await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
          elizaLogger3.debug("Marked job as FAILED");
        }
      } else if (jobDetails.status === "IN_PROGRESS") {
        elizaLogger3.debug("Job is in progress, need to implement checking if the work is complete.");
      } else if (jobDetails.status === "COMPLETED") {
        elizaLogger3.debug("Job is completed, now attempting to deliver the work.");
        const completedWorkUrl = jobDetails.completedWork.url;
        const previewOfCompletedWork = jobDetails.completedWork.message;
        const contactInfo = jobDetails.contactInfo;
        const state = await runtime.composeState(
          jobDetails.elizaMessage,
          { completedWorkUrl, previewOfCompletedWork }
        );
        const successfulResponseToUserContext = composeContext({
          state,
          template: successfulResponseToUserTemplate
        });
        const successfulResponseToUserText = await generateText({
          runtime,
          context: successfulResponseToUserContext,
          modelClass: ModelClass.LARGE
        });
        const successfulResponseToUser = JSON.parse(cleanJsonResponse(successfulResponseToUserText));
        const messageToUser = `@${contactInfo.handle} ${successfulResponseToUser.result}`;
        const twitterClient = await getTwitterClientFromRuntime(runtime);
        const coversationId = jobDetails.contactInfo.conversationId.split("/").pop();
        try {
          await twitterClient.post.postTweet(
            runtime,
            twitterClient.client,
            messageToUser,
            jobDetails.contactInfo.roomId,
            messageToUser,
            coversationId
          );
          jobDetails.status = "DELIVERED";
          await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
          elizaLogger3.debug("Marked job as DELIVERED");
        } catch (error) {
          elizaLogger3.error("Error posting new tweet: ", error);
          console.error(error);
        }
      } else if (jobDetails.status === "FAILED") {
        elizaLogger3.debug("Job failed, now attempting to retry the job.");
        await runJob(runtime, contract, jobDetails);
      } else if (jobDetails.status === "DELIVERED") {
        elizaLogger3.debug("Job delivered, any cleanup work can be done here.");
        await runtime.cacheManager.delete(`${runtime.agentId}-payai-contracts-${contract}`);
        elizaLogger3.debug("Contract removed from cache");
      } else {
        elizaLogger3.warn("Unknown job status, dropping job. You should look into this.");
        elizaLogger3.debug("jobDetails: ", jobDetails);
        await runtime.cacheManager.delete(`${runtime.agentId}-payai-contracts-${contract}`);
      }
    }
  }
};
async function runJob(runtime, contract, jobDetails) {
  var _a, _b;
  const callback = async (response, files) => {
    jobDetails.completedWork = {
      message: response.text,
      url: response.url
    };
    await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
    return [{
      userId: jobDetails.elizaMessage.userId,
      agentId: jobDetails.elizaMessage.agentId,
      content: {
        text: response.text,
        url: response.url
      },
      roomId: stringToUuid(`payai-${contract}-${runtime.agentId}`)
    }];
  };
  const serviceToActions = (_a = runtime.character.payai) == null ? void 0 : _a.serviceToActions;
  const buyOffer = jobDetails.buyOffer;
  const desiredServiceID = buyOffer.desiredServiceID;
  const desiredUnitAmount = buyOffer.desiredUnitAmount;
  const action = serviceToActions[desiredServiceID];
  jobDetails.status = "IN_PROGRESS";
  await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
  elizaLogger3.debug("marked job as IN_PROGRESS");
  const state = await runtime.composeState(jobDetails.elizaMessage, {
    jobDetails
  });
  for (let i = 0; i < desiredUnitAmount; i++) {
    await runtime.processActions(
      jobDetails.elizaMessage,
      [
        {
          userId: jobDetails.elizaMessage.userId,
          agentId: jobDetails.elizaMessage.agentId,
          roomId: jobDetails.elizaMessage.roomId,
          content: {
            text: "",
            action,
            source: jobDetails.elizaMessage.content.source
          },
          embedding: []
        }
      ],
      state,
      (response) => {
        return callback(response);
      }
    );
  }
  jobDetails = await runtime.cacheManager.get(`${runtime.agentId}-payai-job-details-contract-${contract}`);
  if ((_b = jobDetails == null ? void 0 : jobDetails.completedWork) == null ? void 0 : _b.url) {
    jobDetails.status = "COMPLETED";
    elizaLogger3.debug("Marked job as COMPLETED");
  } else {
    jobDetails.status = "FAILED";
    elizaLogger3.debug("Marked job as FAILED");
  }
  await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
}
var payAIJobManagerService = new PayAIJobManagerService();

// src/actions/browseAgents.ts
import {
  ModelClass as ModelClass2,
  composeContext as composeContext2,
  elizaLogger as elizaLogger4,
  generateText as generateText2,
  getEmbeddingZeroVector,
  cleanJsonResponse as cleanJsonResponse2
} from "@elizaos/core";
var findMatchingServicesTemplate = `
Analyze the following conversation to extract a list of services that match what the user is looking for.

The Service Name is the name of the service that the Seller is offering.
The Service Description is a brief description of the service.
The Service Price is the price of the service.
The Required Info is any additional details that the buyer needs to provide to the seller to complete the service.
The Seller is identified by their solana wallet address.
The Service Ad CID is identified by the hash of the entry.
The Service ID is the unique identifier of the service within a service advertisement.
The Contact Info is the contact information of the seller. This can be a twitter handle and/or a libp2p peer id.

All possible services:

{{services}}


Conversation:

{{searchQuery}}


Return a JSON object containing all of the services that match what the user is looking for.
For example:
{
    "success": true,
    "result": "Here are the services that match your query:

Service Name
Service Description
Service Price
Required Info
Seller: B2imQsisfrTLoXxzgQfxtVJ3vQR9bGbpmyocVu3nWGJ6
Service Ad CID: bafyreifo4inpuekp466muw2bmldqkg6zetiwi6psjyiwzzyz35bsmcvhrq
Service ID
Contact Info

Service Name
Service Description
Service Price
Required Info
Seller: updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM
Service Ad CID: bafyreifo4inpuekp46zetiwi6psjyiwzzyz35bsmcvhrq6muw2bmldqkg6
Service ID
Contact Info"
}

If no matching services were found, then set the "success" field to false and set the result to a string informing the user that no matching services were found, and ask them to try rewording their search. Be natural and polite.
For example, if there were no matching services, then return:
{
    "success": false,
    "result": "A natural message informing the user that no matching services were found, and to try rewording their search."
}

Only return a JSON mardown block.
`;
var formatResponseForTwitterTemplate = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Prepare a response for Twitter.
It needs to be 280 characters or less.

You previously gave me a list of services that are available on the PayAI marketplace.

Here is the list of services:

{{matchingServices}}

I need you to choose only one service from the list, that best matches the user's query.

Here is the user's query:

{{searchQuery}}

You should prefer services that have contact information that includes a Twitter handle.

I want you to prepare your response so that it only includes
 - the seller's Twitter handle
 - the cost of the service
 - the ipfs link to the service ad including the CID

For example:
{
    "success": true,
    "result": "I found a seller that offers this service! The seller is @tickertaco_ and the cost is 1 SOL. Here is the link to the service ad: https://ipfs.io/ipfs/bafyreifo4inpuekp46zetiwi6psjyiwzzyz35bsmcvhrq6muw2bmldqkg6"
}

Only return a JSON mardown block.
`;
var browseAgents = {
  name: "BROWSE_PAYAI_AGENTS",
  similes: ["SEARCH_SERVICES", "FIND_SELLER", "HIRE_AGENT", "FIND_SERVICE"],
  description: "Search through the PayAI marketplace to find a seller providing a service that the buyer is looking for.",
  suppressInitialMessage: true,
  validate: async (runtime, message) => {
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    try {
      const searchQuery = message.content.text;
      if (!state) {
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const services = await getAllDbEntriesWithCIDs(
        payAIClient.serviceAdsDB
      );
      const servicesString = JSON.stringify(services, null, 2);
      state.services = servicesString;
      state.searchQuery = searchQuery;
      const findMatchingServicesContext = composeContext2({
        state,
        template: findMatchingServicesTemplate
      });
      const findMatchingServicesContent = await generateText2({
        runtime,
        context: findMatchingServicesContext,
        modelClass: ModelClass2.LARGE
      });
      elizaLogger4.debug("found these matching services from the conversation:", findMatchingServicesContent);
      const matchingServices = JSON.parse(cleanJsonResponse2(findMatchingServicesContent));
      if (matchingServices.success === false || matchingServices.success === "false") {
        elizaLogger4.info("Couldn't find any services matching the user's request.");
        if (callback) {
          callback({
            text: matchingServices.result,
            action: "BROWSE_PAYAI_AGENTS",
            source: message.content.source
          });
        }
        return false;
      }
      if (callback && message.content.source === "twitter") {
        state.matchingServices = matchingServices.result;
        const formatResponseForTwitterContext = composeContext2({
          state,
          template: formatResponseForTwitterTemplate
        });
        const formatResponseForTwitterContent = await generateText2({
          runtime,
          context: formatResponseForTwitterContext,
          modelClass: ModelClass2.LARGE
        });
        const responseToUser2 = JSON.parse(cleanJsonResponse2(formatResponseForTwitterContent));
        elizaLogger4.info("response to user:", responseToUser2);
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: responseToUser2.result,
            action: "BROWSE_PAYAI_AGENTS",
            source: message.content.source
          },
          embedding: getEmbeddingZeroVector()
        };
        await callback(newMemory.content);
        await runtime.messageManager.createMemory(newMemory);
        return true;
      }
      const responseToUser = matchingServices.result;
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: responseToUser,
            action: "BROWSE_PAYAI_AGENTS",
            source: message.content.source,
            services: matchingServices.result
          },
          embedding: getEmbeddingZeroVector()
        };
        await callback(newMemory.content);
        await runtime.messageManager.createMemory(newMemory);
      }
      return true;
    } catch (error) {
      console.error("Error in BROWSE_PAYAI_AGENTS handler:", error);
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Find an agent that offers web development." }
      },
      {
        user: "{{user2}}",
        content: { text: "Found the following matching services. Check them out below!", action: "BROWSE_PAYAI_AGENTS" }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Show me all services available." }
      },
      {
        user: "{{user2}}",
        content: { text: "Here are all the available services:", action: "BROWSE_PAYAI_AGENTS" }
      }
    ]
  ]
};
var browseAgents_default = browseAgents;

// src/actions/makeOfferAction.ts
import {
  ModelClass as ModelClass3,
  composeContext as composeContext3,
  elizaLogger as elizaLogger5,
  generateText as generateText3,
  cleanJsonResponse as cleanJsonResponse3,
  getEmbeddingZeroVector as getEmbeddingZeroVector2
} from "@elizaos/core";
var extractOfferDetailsTemplate = `
Analyze the Conversation below to extract Offer Details from a buyer to a seller.
Offer Details have this schema when successful:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "desiredServiceID": "ID of the service the buyer wants to purchase or 0 if not provided",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase or 1 if not provided",
        "infoFromBuyer": "Any additional details that the buyer needs to provide to the seller to complete the service or empty string if not provided"
}

Offer Details have this schema when unsuccessful:
{
    "success": false,
    "result": "feedback message"
}

Conversation:
{{recentMessages}}


Return a JSON object containing the following fields.
For example:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "desiredServiceID": "ID of the service the buyer wants to purchase or 0 if not provided",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase or 1 if not provided",
        "infoFromBuyer": "Any additional details that the buyer needs to provide to the seller to complete the service or empty string if not provided"
    }
}

If the buyer provided the service ID then set the desiredServiceID to the service ID. Otherwise set the desiredServiceID to "0" if not provided.
If the buyer provided the amount of units then set the desiredUnitAmount to the amount of units. Otherwise set the desiredUnitAmount to "1" if not provided.
If the buyer provided the seller's service ad CID in the conversation, then set the serviceAdCID to the CID.
If the buyer provided the seller with any additional details in the conversation, then set the infoFromBuyer to the additional details.

If not all information could be determined from the conversation and from your instructions, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example:
{
    "success": false,
    "result": "Natural language asking for the missing information."
}

Only return a JSON markdown block.
`;
var successfulResponseToUserTemplate2 = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Based on the conversation below, respond to the seller letting them know that you have made an offer for their service, and ask them to accept it and sign an agreement.
You should use your own words and style.
The response should be 260 characters or less.

Conversation:
{{recentMessages}}


Make sure to include the @username of the seller and the link of the buy offer that you created so that the seller can check it out.
The link is https://ipfs.io/ipfs/{{buyOfferCID}}


For example:
{
    "success": true,
    "result": "A natural message tagging the seller and informing them that the offer has been made, and the ipfs link to the buy offer."
}

Return JSON markdown only.
`;
var makeOfferAction = {
  name: "MAKE_OFFER",
  similes: ["PURCHASE_SERVICE", "BUY_SERVICE", "HIRE_AGENT", "MAKE_PROPOSAL"],
  description: "Make an offer to purchase a service from a seller on the PayAI marketplace.",
  suppressInitialMessage: true,
  validate: async (runtime, message) => {
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    try {
      if (!state) {
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const makeOfferContext = composeContext3({
        state,
        template: extractOfferDetailsTemplate
      });
      const extractedDetailsText = await generateText3({
        runtime,
        context: makeOfferContext,
        modelClass: ModelClass3.LARGE
      });
      elizaLogger5.debug("extractedDetailsText:", extractedDetailsText);
      const extractedDetails = JSON.parse(cleanJsonResponse3(extractedDetailsText));
      elizaLogger5.debug("extractedDetails:", extractedDetails);
      if (extractedDetails.success === false) {
        elizaLogger5.info("Need more information from the user to make an offer.");
        if (callback) {
          callback({
            text: `@${state.senderName} ${extractedDetails.result}`,
            action: "MAKE_OFFER",
            source: message.content.source
          });
        }
        return false;
      }
      const offerDetails = {
        serviceAdCID: extractedDetails.result.serviceAdCID,
        desiredServiceID: extractedDetails.result.desiredServiceID || "0",
        desiredUnitAmount: extractedDetails.result.desiredUnitAmount || "1",
        infoFromBuyer: extractedDetails.result.infoFromBuyer
      };
      const buyOffer = await prepareBuyOffer(offerDetails, runtime);
      elizaLogger5.debug("Publishing buy offer to IPFS:", buyOffer);
      const result = await payAIClient.buyOffersDB.put(buyOffer);
      const CID3 = getCIDFromOrbitDbHash(result);
      elizaLogger5.info("Published Buy Offer to IPFS: ", CID3);
      state.buyOfferCID = CID3;
      const successfulResponseToUserContext = composeContext3({
        state,
        template: successfulResponseToUserTemplate2
      });
      const successfulResponseToUserText = await generateText3({
        runtime,
        context: successfulResponseToUserContext,
        modelClass: ModelClass3.LARGE
      });
      const successfulResponseToUser = JSON.parse(cleanJsonResponse3(successfulResponseToUserText));
      elizaLogger5.debug("Successful response to user:", successfulResponseToUser.result);
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `${successfulResponseToUser.result}`,
            action: "MAKE_OFFER",
            source: message.content.source
          },
          embedding: getEmbeddingZeroVector2()
        };
        await callback(newMemory.content);
        await runtime.messageManager.createMemory(newMemory);
      }
      return true;
    } catch (error) {
      elizaLogger5.error("Error in MAKE_OFFER handler:", error);
      console.error(error);
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase 5 units of service ID 1 from seller 9ovkK7WoiSXyEJDM5cZG3or3W95bdzZLDDHhuMgSJT9U"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Successfully made an offer for to the seller. Your Buy Offer's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          action: "MAKE_OFFER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase service with CID."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the service ad CID",
          action: "MAKE_OFFER"
        }
      }
    ]
  ]
};
var makeOfferAction_default = makeOfferAction;

// src/actions/acceptOfferAction.ts
import {
  ModelClass as ModelClass4,
  composeContext as composeContext4,
  elizaLogger as elizaLogger6,
  generateText as generateText4,
  cleanJsonResponse as cleanJsonResponse4,
  getEmbeddingZeroVector as getEmbeddingZeroVector3
} from "@elizaos/core";
var extractOfferCIDTemplate = `
Analyze the following conversation to extract the CID of the Buy Offer from the buyer.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "buyOfferCID": "CID of the Buy Offer"
    }
}

If you found a short url like https://t.co/9dj1CQ98yG instead of a CID, then you can set that as the "buyOfferCID" field.
For example:
{
    "success": true,
    "result": {
        "buyOfferCID": "https://t.co/9dj1CQ98yG"
    }
}

If the buyer did not provide the CID of the Buy Offer nor a short url, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example:
{
    "success": false,
    "result": "Please provide the CID of the Buy Offer."
}

Only return a JSON markdown block.
`;
var successfulResponseToUserTemplate3 = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Based on the conversation below, respond to the buyer letting them know that you have accepted their offer.
Ask the buyer to fund the contract.
You should use your own words and style.
Don't tag the buyer in your response.
The response should be 260 characters or less.


Conversation:
{{recentMessages}}

Make sure to include the link of the agreement that you created so that the buyer can review it.
The link is https://ipfs.io/ipfs/{{agreementCID}}


For example:
{
    "success": true,
    "result": "A natural message informing the user that the offer has been accepted, asking them to fund the contract, and including the ipfs link to the agreement."
}

Return JSON markdown only.
`;
var acceptOfferAction = {
  name: "ACCEPT_OFFER",
  similes: ["AGREE_TO_OFFER", "ACCEPT_PROPOSAL", "ACCEPT_TERMS", "ACCEPT_BUY_OFFER"],
  description: "This action allows a seller to check a buy offer from a buyer and accept it on the PayAI marketplace.",
  suppressInitialMessage: true,
  validate: async (runtime, message) => {
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    try {
      if (!state) {
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const acceptOfferContext = composeContext4({
        state,
        template: extractOfferCIDTemplate
      });
      const extractedDetailsText = await generateText4({
        runtime,
        context: acceptOfferContext,
        modelClass: ModelClass4.LARGE
      });
      elizaLogger6.debug("extracted the following Buy Offer CID from the conversation:", extractedDetailsText);
      const extractedDetails = JSON.parse(cleanJsonResponse4(extractedDetailsText));
      if (extractedDetails.success === false) {
        elizaLogger6.info("Need more information from the user to accept the offer.");
        if (callback) {
          callback({
            text: `@${state.senderName} ${extractedDetails.result}`,
            action: "ACCEPT_OFFER",
            source: message.content.source
          });
        }
        return false;
      }
      if (extractedDetails.result.buyOfferCID.includes("t.co")) {
        const cid = await getCIDFromShortUrl(extractedDetails.result.buyOfferCID);
        extractedDetails.result.buyOfferCID = cid;
      }
      const { isValid, reason } = await isValidBuyOffer(extractedDetails.result.buyOfferCID);
      if (!isValid) {
        elizaLogger6.info(reason);
        if (callback) {
          callback({
            text: `@${state.senderName} ${reason}`,
            action: "ACCEPT_OFFER",
            source: message.content.source
          });
        }
        return false;
      }
      const agreementDetails = {
        buyOfferCID: extractedDetails.result.buyOfferCID,
        accept: true
      };
      const agreement = await prepareAgreement(agreementDetails, runtime);
      elizaLogger6.debug("Publishing agreement to IPFS:", agreement);
      const result = await payAIClient.agreementsDB.put(agreement);
      const CID3 = getCIDFromOrbitDbHash(result);
      elizaLogger6.info("Published Agreement to IPFS: ", CID3);
      state.agreementCID = CID3;
      const successfulResponseToUserContext = composeContext4({
        state,
        template: successfulResponseToUserTemplate3
      });
      const successfulResponseToUserText = await generateText4({
        runtime,
        context: successfulResponseToUserContext,
        modelClass: ModelClass4.LARGE
      });
      const successfulResponseToUser = JSON.parse(cleanJsonResponse4(successfulResponseToUserText));
      elizaLogger6.debug("Successful response to user:", successfulResponseToUser.result);
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `@${state.senderName} ${successfulResponseToUser.result}`,
            action: "ACCEPT_OFFER",
            source: message.content.source,
            agreement: agreementDetails
          },
          embedding: getEmbeddingZeroVector3()
        };
        await callback(newMemory.content);
        await runtime.messageManager.createMemory(newMemory);
      }
      return true;
    } catch (error) {
      elizaLogger6.error("Error in ACCEPT_OFFER handler:", error);
      console.error(error);
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Hey I've just made an offer for your service! You can see it here: https://ipfs.io/ipfs/bafyreie5jopsd22lrb5d46qgmytjobxs72lqopdkrayf6e3mvblwufld7m. Looking forward to working with you!"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "I accept the offer. The Agreement's IPFS CID is bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
          action: "ACCEPT_OFFER"
        }
      }
    ],
    // Example where the user provides a Buy Offer with an invalid signature
    [
      {
        user: "{{user1}}",
        content: {
          text: "Hey I've just made an offer for your service! You can see it here: https://ipfs.io/ipfs/bafyreie5jopsd22lrb5d46qgmytjobxs72lqopdkrayf6e3mvblwufld7m. Looking forward to working with you!"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Buy Offer signature is invalid.",
          action: "ACCEPT_OFFER"
        }
      }
    ]
  ]
};
async function isValidBuyOffer(buyOfferCID) {
  try {
    const buyOffer = (await payAIClient.getEntryFromCID(buyOfferCID, payAIClient.buyOffersDB)).payload.value;
    const identity = buyOffer.identity;
    const signature = buyOffer.signature;
    const message = buyOffer.message;
    const isValidSignature = await verifyMessage(identity, signature, message);
    if (!isValidSignature) {
      return { isValid: false, reason: "Buy Offer signature is invalid." };
    }
    const serviceAd = await payAIClient.getEntryFromCID(message.serviceAdCID, payAIClient.serviceAdsDB);
    if (!serviceAd) {
      return { isValid: false, reason: "ServiceAd referenced by Buy Offer does not exist" };
    }
    const isCurrent = message.serviceAdCID === payAIClient.sellerServiceAdCID;
    if (!isCurrent) {
      return {
        isValid: false,
        reason: `ServiceAd does not match the seller's most recent service Ad. Seller's most recent service ad can be found at ${payAIClient.sellerServiceAdCID}`
      };
    }
    return { isValid: true, reason: "" };
  } catch (error) {
    console.error("Error validating Buy Offer:", error);
    throw error;
  }
}
var acceptOfferAction_default = acceptOfferAction;

// src/actions/advertiseServicesAction.ts
import {
  ModelClass as ModelClass5,
  composeContext as composeContext5,
  elizaLogger as elizaLogger7,
  generateText as generateText5,
  getEmbeddingZeroVector as getEmbeddingZeroVector4,
  cleanJsonResponse as cleanJsonResponse5
} from "@elizaos/core";
var extractServicesTemplate = `
Analyze the following conversation to extract the services that the user wants to sell.
There could be multiple services, so make sure you extract all of them.
For each service, ask the user to provide any additional details that they may need from the buyer to complete the service.

The conversation is below:

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.

For example:
{
    "success": true,
    "result": [
        {
            "name": "Service Name",
            "description": "Service Description",
            "price": "Service Price",
            "requiredInfo": "Additional Details"
        }
    ]
}

If the user did not provide enough information for any of the fields, then set the "success" field to false and set the result to a string asking the user to provide the missing information. 
Be natural and polite when asking for missing information.
For example, if you could not find the services, then return:
{
    "success": false,
    "result": "feedback message"
}

The conversation is below

{{recentMessages}}

Only return a JSON mardown block.
`;
var advertiseServicesAction = {
  name: "SELL_SERVICES",
  similes: ["ADVERTISE_SERVICES", "OFFER_SERVICES", "LIST_SERVICES"],
  description: "Ask the user for the services they want to sell, create the services file locally, and publish it to the serviceAdsDB.",
  suppressInitialMessage: true,
  validate: async (runtime, message) => {
    if (message.content.source !== "direct") {
      elizaLogger7.debug("SELL_SERVICES action is only allowed when interacting with the direct client. This message was from:", message.content.source);
      return false;
    }
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    var _a;
    try {
      if (!state) {
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const extractServicesContext = composeContext5({
        state,
        template: extractServicesTemplate
      });
      const extractedServicesText = await generateText5({
        runtime,
        context: extractServicesContext,
        modelClass: ModelClass5.LARGE
      });
      elizaLogger7.debug("extracted services from generateText:", extractedServicesText);
      const extractedServices = JSON.parse(cleanJsonResponse5(extractedServicesText));
      elizaLogger7.debug("extracted the following services from the conversation:", extractedServicesText);
      if (extractedServices.success === false || extractedServices.success === "false") {
        elizaLogger7.info("Need more information from the user to advertise services.");
        if (callback) {
          callback({
            text: extractedServices.result,
            action: "SELL_SERVICES",
            source: message.content.source
          });
        }
        return false;
      }
      const contactInfo = {
        "libp2p": (_a = payAIClient.libp2p) == null ? void 0 : _a.peerId.toString()
      };
      const twitterUsername = runtime.getSetting("TWITTER_USERNAME");
      if (twitterUsername) {
        contactInfo["twitter"] = `@${twitterUsername}`;
      }
      const serviceAd = await prepareServiceAd(extractedServices.result, runtime, contactInfo);
      const CID3 = await payAIClient.publishPreparedServiceAd(serviceAd);
      let responseToUser = `Successfully advertised your services. Your Service Ad's IPFS CID is ${CID3}`;
      const servicesFilePath = payAIClient.servicesConfigPath;
      elizaLogger7.debug("Updating the local services file with the seller's services");
      payAIClient.saveSellerServices(JSON.stringify(extractedServices.result, null, 2));
      elizaLogger7.info("Updated services file locally at:", servicesFilePath);
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: responseToUser,
            action: "SELL_SERVICES",
            source: message.content.source,
            services: extractedServices.result
          },
          embedding: getEmbeddingZeroVector4()
        };
        await callback(newMemory.content);
        await runtime.messageManager.createMemory(newMemory);
      }
      return true;
    } catch (error) {
      elizaLogger7.error("Error in SELL_SERVICES handler:", error);
      console.error(error);
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to sell my services."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Okay! Please tell me more about the services you want to sell. Can you tell me the name, description, and price?",
          action: "SELL_SERVICES"
        }
      },
      {
        user: "{{user1}}",
        content: {
          text: "I want to sell web development services for $50 per hour."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Successfully advertised your services. Your Service Ad's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          action: "SELL_SERVICES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to sell graphic design services."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the services you want to sell, including the name, description, and price.",
          action: "SELL_SERVICES"
        }
      }
    ]
  ]
};
var advertiseServicesAction_default = advertiseServicesAction;

// src/actions/executeContractAction.ts
import {
  ModelClass as ModelClass6,
  composeContext as composeContext6,
  elizaLogger as elizaLogger8,
  generateText as generateText6,
  cleanJsonResponse as cleanJsonResponse6,
  getEmbeddingZeroVector as getEmbeddingZeroVector5
} from "@elizaos/core";
var extractAgreementCIDTemplate = `
Analyze the following conversation to extract the ipfs CID of the Agreement from the seller.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "agreementCID": "ipfs CID of the Agreement"
    }
}

If the seller provided a short url instead of the ipfs CID, then you should extract the short url and put it in the "agreementCID" field.
For example:
{
    "success": true,
    "result": {
        "agreementCID": "https://t.co/9dj1CQ98yG"
    }
}

If the seller did not provide the ipfs CID of the Agreement or a short url, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the ipfs CID of the Agreement, then return:
{
    "success": false,
    "result": "feedback message to the user"
}

Only return a JSON markdown block.
`;
var successfulResponseToUserTemplate4 = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Based on the conversation below, respond to the seller letting them know that you have funded the contract for them to start working on the service.
You should use your own words and style. Ask the user to start working on the service.
Don't tag the user in your response.
The response should be 260 characters or less.


Conversation:
{{recentMessages}}

Make sure to include the link of the transaction that funded the contract so that the seller can review.
The link is https://solscan.io/tx/{{tx}}


For example:
{
    "success": true,
    "result": "A natural message informing the user that the contract has been funded and that they can start working now, and the solscan link to the solana transaction."
}

Return JSON markdown only.
`;
var executeContractAction = {
  name: "EXECUTE_CONTRACT",
  similes: ["START_ENGAGEMENT", "BEGIN_CONTRACT", "INITIATE_CONTRACT", "FUND_CONTRACT"],
  description: "This action allows a buyer to start the contract by sending funds to an escrow account on Solana. The seller will start working after the funds are sent.",
  suppressInitialMessage: true,
  validate: async (runtime, message) => {
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    try {
      if (!state) {
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const executeContractContext = composeContext6({
        state,
        template: extractAgreementCIDTemplate
      });
      const extractedDetailsText = await generateText6({
        runtime,
        context: executeContractContext,
        modelClass: ModelClass6.LARGE
      });
      elizaLogger8.debug("extracted the following Agreement CID from the conversation:", extractedDetailsText);
      const extractedDetails = JSON.parse(cleanJsonResponse6(extractedDetailsText));
      if (extractedDetails.success === false) {
        elizaLogger8.info("Need more information from the user to execute the contract.");
        if (callback) {
          callback({
            text: `@${state.senderName} ${extractedDetails.result}`,
            action: "EXECUTE_CONTRACT",
            source: message.content.source
          });
        }
        return false;
      }
      if (extractedDetails.result.agreementCID.includes("t.co")) {
        const shortUrl = extractedDetails.result.agreementCID;
        const cid = await getCIDFromShortUrl(shortUrl);
        extractedDetails.result.agreementCID = cid;
      }
      if (extractedDetails.result.agreementCID.includes("ipfs.io")) {
        const cid = await getCIDFromIpfsUrl(extractedDetails.result.agreementCID);
        extractedDetails.result.agreementCID = cid;
      }
      const agreement = (await payAIClient.getEntryFromCID(extractedDetails.result.agreementCID, payAIClient.agreementsDB)).payload.value;
      const isValidAgreement = await verifyMessage(agreement.identity, agreement.signature, agreement.message);
      if (!isValidAgreement) {
        elizaLogger8.info("Agreement signature is invalid.");
        if (callback) {
          callback({
            text: `@${state.senderName} Agreement signature is invalid.`,
            action: "EXECUTE_CONTRACT",
            source: message.content.source
          });
        }
        return false;
      }
      const buyOffer = (await payAIClient.getEntryFromCID(agreement.message.buyOfferCID, payAIClient.buyOffersDB)).payload.value;
      const isValidBuyOffer2 = await verifyMessage(buyOffer.identity, buyOffer.signature, buyOffer.message);
      if (!isValidBuyOffer2) {
        elizaLogger8.info("Buy Offer signature is invalid.");
        if (callback) {
          callback({
            text: `@${state.senderName} Buy Offer signature is invalid.`,
            action: "EXECUTE_CONTRACT",
            source: message.content.source
          });
        }
        return false;
      }
      const base58PublicKey = await getBase58PublicKey(runtime);
      if (buyOffer.identity !== base58PublicKey) {
        elizaLogger8.info("The Buy Offer that this Agreement references was not signed by my keypair.");
        if (callback) {
          callback({
            text: `@${state.senderName} Buy Offer was not signed by my keypair.`,
            action: "EXECUTE_CONTRACT",
            source: message.content.source
          });
        }
        return false;
      }
      const serviceAd = (await payAIClient.getEntryFromCID(buyOffer.message.serviceAdCID, payAIClient.serviceAdsDB)).payload.value;
      const priceString = serviceAd.message.services[parseInt(buyOffer.message.desiredServiceID)].price;
      const priceMatch = priceString.match(/(\d+\.?\d*)/);
      if (!priceMatch) {
        throw new Error(`Could not extract price from string: ${priceString}`);
      }
      const priceInSOL = parseFloat(priceString);
      const units = parseInt(buyOffer.message.desiredUnitAmount);
      const totalSOL = priceInSOL * units;
      const lamportsPerSOL = 1e9;
      const totalLamports = Math.round(totalSOL * lamportsPerSOL).toString();
      const tx = await paymentClient.startContract(extractedDetails.result.agreementCID, agreement.identity, totalLamports);
      state.tx = tx;
      const successfulResponseToUserContext = composeContext6({
        state,
        template: successfulResponseToUserTemplate4
      });
      const successfulResponseToUserText = await generateText6({
        runtime,
        context: successfulResponseToUserContext,
        modelClass: ModelClass6.LARGE
      });
      const successfulResponseToUser = JSON.parse(cleanJsonResponse6(successfulResponseToUserText));
      elizaLogger8.debug("Successful response to user:", successfulResponseToUser.result);
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `@${state.senderName} ${successfulResponseToUser.result}`,
            action: "EXECUTE_CONTRACT",
            source: message.content.source,
            agreement: extractedDetails.result.agreementCID
          },
          embedding: getEmbeddingZeroVector5()
        };
        await callback(newMemory.content);
        await runtime.messageManager.createMemory(newMemory);
      }
      await payAIClient.fundedContractsDB.add(tx.toString());
      return true;
    } catch (error) {
      elizaLogger8.error("Error in EXECUTE_CONTRACT handler:", error);
      console.error(error);
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I'm thrilled to let you know that I've accepted your offer You can review the agreement here: https://t.co/hEdbwgNnWS. Looking forward to collaborating on this project!"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Great! I checked it out and everything looks good. I just funded the contract. You can see the transaction here: https://solscan.io/tx/4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I'm thrilled to let you know that I've accepted your offer You can review the agreement here: https://t.co/dxtzIbMN24. Looking forward to collaborating on this project!"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Great! I checked it out and everything looks good. I just funded the contract. You can see the transaction here: https://solscan.io/tx/4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I'm thrilled to let you know that I've accepted your offer You can review the agreement here: https://t.co/dxtzIbMN24. Looking forward to collaborating on this project!"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "I could not find anything with that CID. Please double check and provide it again."
        }
      }
    ]
  ]
};
var executeContractAction_default = executeContractAction;

// src/actions/startWork.ts
import {
  ModelClass as ModelClass7,
  composeContext as composeContext7,
  elizaLogger as elizaLogger9,
  generateText as generateText7,
  cleanJsonResponse as cleanJsonResponse7,
  getEmbeddingZeroVector as getEmbeddingZeroVector6
} from "@elizaos/core";
var extractTransactionSignatureTemplate = `
Analyze the following conversation to extract the transaction signature of the contract that funded the work.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "transactionSignature": "transaction signature of the contract"
    }
}

If the user provided a short url instead of the transaction signature, then you should extract the short url and put it in a field "shortUrl".
For example:
{
    "success": true,
    "result": {
        "shortUrl": "https://t.co/9dj1CQ98yG"
    }
}

If the user did not provide the transaction signature, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the transaction signature, then return:
{
    "success": false,
    "result": "Please provide the transaction signature of the contract execution."
}

Only return a JSON markdown block.
`;
var successfulResponseToUserTemplate5 = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Based on the conversation below, respond to the buyer thanking them for funding the contract and letting them know that you have started working the job.
Let them know that you will follow up with them once the work is complete.
You should use your own words and style.
The response should be 260 characters or less.

Conversation:
{{recentMessages}}


For example:
{
    "success": true,
    "result": "A natural message thanking the buyer for funding the contract and letting them know that you have started working the job."
}

Return JSON markdown only.
`;
var startWorkAction = {
  name: "START_WORK",
  similes: ["BEGIN_WORK", "START_WORK_FOR_CONTRACT", "BEGIN_WORK_FOR_CONTRACT"],
  description: "This action is used to start work by the seller agent after the buyer agent funds and starts the contract.",
  suppressInitialMessage: true,
  validate: async (runtime, message) => {
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    try {
      if (!state) {
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const startWorkContext = composeContext7({
        state,
        template: extractTransactionSignatureTemplate
      });
      const extractedDetailsText = await generateText7({
        runtime,
        context: startWorkContext,
        modelClass: ModelClass7.LARGE
      });
      const extractedDetails = JSON.parse(cleanJsonResponse7(extractedDetailsText));
      if (extractedDetails.success === false) {
        elizaLogger9.info("Need more information from the user to start work.");
        if (callback) {
          callback({
            text: extractedDetails.result,
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      if (extractedDetails.result.shortUrl) {
        const shortUrl = extractedDetails.result.shortUrl;
        const transactionSignature = await getTxFromShortUrl(shortUrl);
        extractedDetails.result.transactionSignature = transactionSignature;
      }
      const contractAccount = await paymentClient.getContractAccountFromTransaction(extractedDetails.result.transactionSignature);
      if (!contractAccount) {
        elizaLogger9.info("Could not find the contract account from the given transaction.");
        if (callback) {
          callback({
            text: "Could not find the contract account from the given transaction. Please verify the transaction signature.",
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      const contractAccountData = contractAccount.data;
      const agreement = (await payAIClient.getEntryFromCID(contractAccountData.cid, payAIClient.agreementsDB)).payload.value;
      const isValidAgreement = await verifyMessage(agreement.identity, agreement.signature, agreement.message);
      if (!isValidAgreement) {
        elizaLogger9.info("Agreement signature is invalid.");
        if (callback) {
          callback({
            text: "Agreement signature is invalid.",
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      const base58PublicKey = await getBase58PublicKey(runtime);
      if (agreement.identity !== base58PublicKey) {
        elizaLogger9.info("The Agreement was not signed by my keypair.");
        if (callback) {
          callback({
            text: "Agreement was not signed by my keypair.",
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      const buyOffer = (await payAIClient.getEntryFromCID(agreement.message.buyOfferCID, payAIClient.buyOffersDB)).payload.value;
      const isValidBuyOffer2 = await verifyMessage(buyOffer.identity, buyOffer.signature, buyOffer.message);
      if (!isValidBuyOffer2) {
        elizaLogger9.info("Buy Offer signature is invalid.");
        if (callback) {
          callback({
            text: "Buy Offer signature is invalid.",
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      const serviceAd = (await payAIClient.getEntryFromCID(buyOffer.message.serviceAdCID, payAIClient.serviceAdsDB)).payload.value;
      if (contractAccountData.seller.toString() !== serviceAd.message.wallet) {
        elizaLogger9.info("The seller's address in the contract does not match the wallet address of the service advertisement.");
        if (callback) {
          callback({
            text: `The seller's address in the contract (${contractAccountData.seller.toString()}) does not match the wallet address of the service advertisement (${serviceAd.message.wallet}).`,
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      const isValidServiceAd = await verifyMessage(serviceAd.identity, serviceAd.signature, serviceAd.message);
      if (!isValidServiceAd) {
        elizaLogger9.info("Service Advertisement signature is invalid.");
        if (callback) {
          callback({
            text: "Service Advertisement signature is invalid.",
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      if (serviceAd.identity !== base58PublicKey) {
        elizaLogger9.info("The Service Advertisement was not signed by my keypair.");
        if (callback) {
          callback({
            text: "Service Advertisement was not signed by my keypair.",
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      const priceString = serviceAd.message.services[parseInt(buyOffer.message.desiredServiceID)].price;
      const priceMatch = priceString.match(/(\d+\.?\d*)/);
      if (!priceMatch) {
        throw new Error(`Could not extract price from string: ${priceString}`);
      }
      const priceInSOL = parseFloat(priceString);
      const units = parseInt(buyOffer.message.desiredUnitAmount);
      const totalSOL = priceInSOL * units;
      const lamportsPerSOL = 1e9;
      const totalLamports = Math.round(totalSOL * lamportsPerSOL).toString();
      if (contractAccountData.amount.toString() !== totalLamports) {
        elizaLogger9.info("Contract amount does not match expected amount.");
        if (callback) {
          callback({
            text: `Contract amount (${contractAccountData.amount.toString()}) does not match expected amount (${totalLamports}).`,
            action: "START_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      const contractAddress = contractAccount.address.toString();
      let jobs = await runtime.cacheManager.get(`${message.agentId}-payai-contracts`);
      if (jobs === void 0) {
        jobs = {};
      }
      jobs[contractAddress] = contractAddress;
      await runtime.cacheManager.set(`${runtime.agentId}-payai-contracts`, jobs);
      const jobsFromCache = await runtime.cacheManager.get(`${runtime.agentId}-payai-contracts`);
      const jobDetails = {
        agreementCID: contractAccountData.cid,
        agreement: agreement.message,
        buyOfferCID: agreement.message.buyOfferCID,
        buyOffer: buyOffer.message,
        serviceAdCID: buyOffer.message.serviceAdCID,
        serviceAd: serviceAd.message,
        contractAddress: contractAccount.address,
        contractFundedAmount: totalLamports,
        contractBuyer: contractAccountData.buyer.toString(),
        contractSeller: contractAccountData.seller.toString(),
        contactInfo: {
          client: state.recentMessagesData[0].content.source || message.content.source,
          roomId: state.recentMessagesData[0].roomId || message.roomId,
          handle: state.senderName || message.senderName,
          conversationId: state.recentMessagesData[0].content.url || message.content.url
        },
        elizaMessage: {
          userId: message.userId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: message.content
        },
        status: "NOT_STARTED"
      };
      const cacheKey = `${runtime.agentId}-payai-job-details-contract-${contractAccount.address}`;
      await runtime.cacheManager.set(cacheKey, jobDetails);
      const successfulResponseToUserContext = composeContext7({
        state,
        template: successfulResponseToUserTemplate5
      });
      const successfulResponseToUserText = await generateText7({
        runtime,
        context: successfulResponseToUserContext,
        modelClass: ModelClass7.LARGE
      });
      const successfulResponseToUser = JSON.parse(cleanJsonResponse7(successfulResponseToUserText));
      elizaLogger9.debug("Successful response to user:", successfulResponseToUser.result);
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `@${state.senderName} ${successfulResponseToUser.result}`,
            action: "START_WORK",
            source: message.content.source
          },
          embedding: getEmbeddingZeroVector6()
        };
        await callback(newMemory.content);
        await runtime.messageManager.createMemory(newMemory);
      }
      return true;
    } catch (error) {
      elizaLogger9.error("Error in START_WORK handler:", error);
      console.error(error);
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I just started the contract in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Successfully verified the contract. I will start work now."
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I started the contract and funded it in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3. Feel free to check it out and start work."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Got it, thanks! I will start work now."
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I have funded the contract in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "I couldn't find the contract account from the transaction. Please verify the transaction signature and send it to me again."
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I have funded the contract in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "The Agreement you referenced in your contract was not signed by me. Please verify the contract and send me the transaction id again."
        }
      }
    ]
  ]
};
var startWork_default = startWorkAction;

// src/actions/reviewWork.ts
import {
  ModelClass as ModelClass8,
  composeContext as composeContext8,
  elizaLogger as elizaLogger10,
  generateText as generateText8,
  cleanJsonResponse as cleanJsonResponse8,
  getEmbeddingZeroVector as getEmbeddingZeroVector7
} from "@elizaos/core";
var extractDeliveredWorkTemplate = `
Analyze the following conversation to extract a link of the work that the seller has delivered.
I need to review the work before I can release the funds to the seller.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "deliveredWorkLink": "link containing the delivered work to be reviewed"
    }
}

If the user did not provide the delivery link, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the delivery link, then return:
{
    "success": false,
    "result": "Please provide a link of your work."
}

Only return a JSON markdown block.
`;
var extractTransactionLinkTemplate = `
Analyze the following conversation to extract the link of the transaction that funded the contract.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "transactionLink": "link to the transaction that funded the contract"
    }
}

If you cannot find the transaction link in the conversation, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the transaction link, then return:
{
    "success": false,
    "result": "A natural message asking the user to provide the transaction link of the contract execution that funded the work."
}

Only return a JSON markdown block.
`;
var reviewWorkTemplate = `
You are the buyer in a contract with a seller.
You have received the work that the seller has delivered.
You need to review the work to determine if the seller has delivered the work as promised in the contract.

Here is the work that the seller has delivered:

{{deliveredWorkText}}

Here is the seller's advertised service:

{{serviceAdText}}

Based on the work and the service advertisement, please determine if the delivered work is satisfactory.

Return a JSON object containing your assessment.
For example:
{
    "success": true,
    "result": {
        "satisfactory": true
    }
}

If the work is not satisfactory, then set the "success" field to false, and set the "result" field to a string explaining why the work is not satisfactory.
For example, if the work is not satisfactory, then return:
{
    "success": false,
    "result": "the reason goes here"
}

Only return a JSON markdown block.
`;
var successfulResponseToUserTemplate6 = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Based on the conversation below, respond to the seller thanking them for delivering the work, and letting them know that you have reviewed the work and that everything looks good.
Let them know that you released the payment from escrow to their wallet in transaction https://solscan.io/tx/{{tx}}.
You should use your own words and style.
The response should be 260 characters or less.
Conversation:
{{recentMessages}}

For example:
{
    "success": true,
    "result": "A natural message thanking the seller for delivering the work, and letting them know that you have reviewed the work and that everything looks good. Letting them know that you released the payment from escrow to their wallet in transaction https://solscan.io/tx/{{tx}}."
}

Return JSON markdown only.
`;
var reviewWorkAction = {
  name: "REVIEW_WORK",
  similes: ["REVIEW_DELIVERY", "REVIEW_DELIVERED_WORK", "CHECK_WORK", "CHECK_DELIVERED_WORK", "RELEASE_FUNDS", "PAY_SELLER"],
  description: "This action is used to review the work that the seller has delivered, and release the funds to the seller if the work is satisfactory.",
  suppressInitialMessage: true,
  validate: async (runtime, message) => {
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    var _a;
    try {
      if (!state) {
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      console.log("REVIEW_WORK message: ");
      console.dir(message, { depth: null });
      console.log("REVIEW_WORK state: ");
      console.dir(state, { depth: null });
      const transactionLinkContext = composeContext8({
        state,
        template: extractTransactionLinkTemplate
      });
      const extractedTransactionLinkText = await generateText8({
        runtime,
        context: transactionLinkContext,
        modelClass: ModelClass8.LARGE
      });
      const extractedTransactionLink = JSON.parse(cleanJsonResponse8(extractedTransactionLinkText));
      if (extractedTransactionLink.success === false) {
        elizaLogger10.info("Need more information from the user to review the work.", extractedTransactionLink.result);
        if (callback) {
          callback({
            text: `@${state.senderName} ${extractedTransactionLink.result}`,
            action: "REVIEW_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      if (extractedTransactionLink.result.transactionLink.includes("t.co")) {
        const tx2 = await getTxFromShortUrl(extractedTransactionLink.result.transactionLink);
        extractedTransactionLink.result.transactionLink = tx2;
      }
      if (extractedTransactionLink.result.transactionLink.includes("solscan.io")) {
        const tx2 = await getTxFromSolscanUrl(extractedTransactionLink.result.transactionLink);
        extractedTransactionLink.result.transactionLink = tx2;
      }
      const validationResult = await validateContract(
        runtime,
        extractedTransactionLink.result.transactionLink,
        callback,
        message
      );
      if (!validationResult || !validationResult.success) {
        return false;
      }
      console.log("VALIDATION RESULT: ");
      console.dir(validationResult, { depth: null });
      const extractDeliveredWorkContext = composeContext8({
        state,
        template: extractDeliveredWorkTemplate
      });
      const extractedDeliveredWorkText = await generateText8({
        runtime,
        context: extractDeliveredWorkContext,
        modelClass: ModelClass8.LARGE
      });
      const extractedDetails = JSON.parse(cleanJsonResponse8(extractedDeliveredWorkText));
      if (extractedDetails.success === false) {
        elizaLogger10.info("Need more information from the user to review the work. ", extractedDetails.result);
        if (callback) {
          callback({
            text: `@${state.senderName} ${extractedDetails.result}`
          });
        }
        return false;
      }
      const shortUrl = extractedDetails.result.deliveredWorkLink;
      const fullUrl = await getFullUrl(shortUrl);
      const twitterClient = await getTwitterClientFromRuntime(runtime);
      const { conversationId, username } = getConversationIdAndUsername(fullUrl);
      const rootTweet = await twitterClient.client.getTweet(conversationId);
      const query = `conversation_id:${conversationId} from:${username}`;
      const threadTweets = await twitterClient.client.fetchSearchTweets(query, 100);
      let sortedTweets = [rootTweet];
      threadTweets.tweets.sort((a, b) => a.id - b.id);
      sortedTweets.push(...threadTweets.tweets);
      let tweetText = "";
      for (const tweet of sortedTweets) {
        tweetText += tweet.text + "\n\n";
      }
      const desiredServiceID = parseInt(validationResult.buyOffer.message.desiredServiceID);
      const serviceAdDescription = (_a = validationResult.serviceAd.message.services.find((service) => service.id === desiredServiceID)) == null ? void 0 : _a.description;
      state.deliveredWorkText = tweetText;
      state.serviceAdText = serviceAdDescription;
      const reviewWorkContext = composeContext8({
        state,
        template: reviewWorkTemplate
      });
      const reviewWorkText = await generateText8({
        runtime,
        context: reviewWorkContext,
        modelClass: ModelClass8.LARGE
      });
      const reviewWorkResult = JSON.parse(cleanJsonResponse8(reviewWorkText));
      if (reviewWorkResult.success === false) {
        elizaLogger10.info("The work is not satisfactory. ", reviewWorkResult.result);
        if (callback) {
          callback({
            text: `@${state.senderName} ${reviewWorkResult.result}`,
            action: "REVIEW_WORK",
            source: message.content.source
          });
        }
        return false;
      }
      const contractAccountAddress = validationResult.contractAccount.address;
      const seller = validationResult.contractAccount.data.seller.toString();
      const tx = await paymentClient.releasePayment(contractAccountAddress, seller);
      state.tx = tx;
      const successfulResponseToUserContext = composeContext8({
        state,
        template: successfulResponseToUserTemplate6
      });
      const successfulResponseToUserText = await generateText8({
        runtime,
        context: successfulResponseToUserContext,
        modelClass: ModelClass8.LARGE
      });
      const successfulResponseToUser = JSON.parse(cleanJsonResponse8(successfulResponseToUserText));
      elizaLogger10.debug("Successful response to user:", successfulResponseToUser.result);
      if (callback) {
        const newMemory = {
          userId: message.userId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `@${state.senderName} ${successfulResponseToUser.result}`,
            action: "REVIEW_WORK",
            source: message.content.source
          },
          embedding: getEmbeddingZeroVector7()
        };
        await callback(newMemory.content);
        await runtime.messageManager.createMemory(newMemory);
      }
      return true;
    } catch (error) {
      elizaLogger10.error("Error in REVIEW_WORK handler:", error);
      console.error(error);
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I finished working on our contract. Here is the link to the work: https://t.co/9dj1CQ98yG"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Thanks for sending, I will review the work now and release the funds to you if it is satisfactory."
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I finished working on our contract. Here is the link to the work: https://t.co/9dj1CQ98yG"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Thanks! I just reviewed the work and everything looks good. I released the payment to you in transaction https://solscan.io/tx/4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3. Feel free to check it out."
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I finished working on our contract. Here is the link to the work: https://t.co/9dj1CQ98yG"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "The contract that you mentioned was not funded by me. Please verify the transaction signature and send it to me again."
        }
      }
    ]
  ]
};
async function validateContract(runtime, transactionSignature, callback, message) {
  const contractAccount = await paymentClient.getContractAccountFromTransaction(transactionSignature);
  if (!contractAccount) {
    elizaLogger10.info("Could not find the contract account from the given transaction.");
    if (callback) {
      callback({
        text: "Could not find the contract account from the given transaction. Please verify the transaction signature.",
        action: "START_WORK",
        source: message.content.source
      });
    }
    return false;
  }
  const contractAccountData = contractAccount.data;
  const paymentReleased = contractAccountData.isReleased;
  if (paymentReleased) {
    elizaLogger10.info("The payment has already been released for contract account: ", contractAccount.address);
    if (callback) {
      callback({
        text: `The payment has already been released for contract account: ${contractAccount.address}. Please check the contract on https://solscan.io/account/${contractAccount.address} to verify the payment.`,
        action: "REVIEW_WORK",
        source: message.content.source
      });
    }
    return false;
  }
  const agreement = (await payAIClient.getEntryFromCID(contractAccountData.cid, payAIClient.agreementsDB)).payload.value;
  const isValidAgreement = await verifyMessage(agreement.identity, agreement.signature, agreement.message);
  if (!isValidAgreement) {
    elizaLogger10.info("Agreement signature is invalid.");
    if (callback) {
      callback({
        text: "Agreement signature is invalid.",
        action: "START_WORK",
        source: message.content.source
      });
    }
    return false;
  }
  const base58PublicKey = await getBase58PublicKey(runtime);
  if (agreement.identity !== contractAccountData.seller.toString()) {
    elizaLogger10.info("The Agreement was not signed by the seller's wallet address.");
    if (callback) {
      callback({
        text: "Agreement was not signed by the seller's wallet address.",
        action: "START_WORK",
        source: message.content.source
      });
    }
    return false;
  }
  const buyOffer = (await payAIClient.getEntryFromCID(agreement.message.buyOfferCID, payAIClient.buyOffersDB)).payload.value;
  const isValidBuyOffer2 = await verifyMessage(buyOffer.identity, buyOffer.signature, buyOffer.message);
  if (!isValidBuyOffer2) {
    elizaLogger10.info("Buy Offer signature is invalid.");
    if (callback) {
      callback({
        text: "Buy Offer signature is invalid.",
        action: "START_WORK",
        source: message.content.source
      });
    }
    return false;
  }
  if (buyOffer.identity !== base58PublicKey) {
    elizaLogger10.info("The Buy Offer was not signed by my keypair.");
    if (callback) {
      callback({
        text: "Buy Offer was not signed by my keypair.",
        action: "START_WORK",
        source: message.content.source
      });
    }
    return false;
  }
  const serviceAd = (await payAIClient.getEntryFromCID(buyOffer.message.serviceAdCID, payAIClient.serviceAdsDB)).payload.value;
  if (contractAccountData.seller.toString() !== serviceAd.message.wallet) {
    elizaLogger10.info("The seller's address in the contract does not match the wallet address of the service advertisement.");
    if (callback) {
      callback({
        text: `The seller's address in the contract (${contractAccountData.seller.toString()}) does not match the wallet address of the service advertisement (${serviceAd.message.wallet}).`,
        action: "START_WORK",
        source: message.content.source
      });
    }
    return false;
  }
  const isValidServiceAd = await verifyMessage(serviceAd.identity, serviceAd.signature, serviceAd.message);
  if (!isValidServiceAd) {
    elizaLogger10.info("Service Advertisement signature is invalid.");
    if (callback) {
      callback({
        text: "Service Advertisement signature is invalid.",
        action: "START_WORK",
        source: message.content.source
      });
    }
    return false;
  }
  return {
    success: true,
    contractAccount,
    agreement,
    buyOffer,
    serviceAd
  };
}
function getConversationIdAndUsername(fullUrl) {
  const url = new URL(fullUrl);
  const conversationId = url.pathname.split("/")[3];
  const username = url.pathname.split("/")[1];
  return { conversationId, username };
}
var reviewWork_default = reviewWorkAction;

// src/index.ts
var payaiPlugin = {
  name: "payai",
  description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
  actions: [
    advertiseServicesAction_default,
    browseAgents_default,
    makeOfferAction_default,
    acceptOfferAction_default,
    executeContractAction_default,
    startWork_default,
    reviewWork_default
  ],
  evaluators: [],
  providers: [],
  services: [payAIJobManagerService],
  clients: [payAIClient]
};
var index_default = payaiPlugin;
export {
  index_default as default,
  payaiPlugin
};
