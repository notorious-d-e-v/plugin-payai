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
  peerStore: {
    persistence: true,
    threshold: 5
  },
  peerDiscovery: [
    bootstrap({
      list: bootstrap_default.addresses
    })
  ],
  connectionManager: {
    autoDial: true
    // automatically dial stored peers
  },
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/0", "/ip4/0.0.0.0/tcp/0/ws"]
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
import fs from "fs";

// src/utils.ts
import { createHash } from "crypto";
import bs58 from "bs58";
import {
  signBytes,
  createKeyPairFromPrivateKeyBytes,
  verifySignature
} from "@solana/web3.js";
import { CID } from "multiformats/cid";
import { base58btc } from "multiformats/bases/base58";
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
async function prepareServiceAd(services, runtime) {
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
      wallet: base58PublicKey
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
    const globalState = await this.getGlobalStateAccount();
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
    try {
      elizaLogger2.info("Initializing PayAI Client");
      const agentDir = dataDir + "/" + runtime.character.name;
      const userPublicKey = await getBase58PublicKey(runtime);
      elizaLogger2.info("User public key: ", userPublicKey);
      await paymentClient.initialize(runtime);
      const libp2pDatastore = new LevelDatastore(agentDir + "/libp2p");
      const libp2pConfig = Object.assign({}, libp2pOptions);
      libp2pConfig.datastore = libp2pDatastore;
      this.libp2p = await createLibp2p(libp2pConfig);
      const blockstore = new FsBlockstore(agentDir + "/ipfs");
      this.ipfs = await createHelia({ libp2p: this.libp2p, blockstore });
      this.orbitdb = await createOrbitDB({ ipfs: this.ipfs, directory: agentDir });
      this.updatesDB = await this.orbitdb.open(bootstrap_default.databases.updates, { sync: true });
      this.updatesDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai updates db: ", entry.payload.value);
      });
      this.serviceAdsDB = await this.orbitdb.open(bootstrap_default.databases.serviceAds, { sync: true });
      this.serviceAdsDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai service ads db: ", entry.payload.value);
      });
      this.buyOffersDB = await this.orbitdb.open(bootstrap_default.databases.buyOffers, { sync: true });
      this.buyOffersDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai buy offers db: ", entry.payload.value);
      });
      this.agreementsDB = await this.orbitdb.open(bootstrap_default.databases.agreements, { sync: true });
      this.agreementsDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai agreements db: ", entry.payload.value);
      });
      this.fundedContractsDB = await this.orbitdb.open(bootstrap_default.databases.fundedContracts, { sync: true });
      this.fundedContractsDB.events.on("update", async (entry) => {
        elizaLogger2.debug("payai funded contracts db: ", entry.payload.value);
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
   * Initializes the seller agent functionality.
   * This includes loading the sellerServices.json file, updating the serviceAds database
   * if necessary, and periodically checking for updates to the sellerServices.json file.
   * @param runtime - The runtime context for the client.
   */
  async initSellerAgentFunctionality(runtime) {
    if (fs.existsSync(this.servicesConfigPath)) {
      const localServices = JSON.parse(fs.readFileSync(this.servicesConfigPath, "utf-8"));
      this.setServicesConfig(localServices);
      const localServiceAd = await prepareServiceAd(localServices, runtime);
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
    fs.writeFileSync(this.servicesConfigPath, services);
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
import { Service, elizaLogger as elizaLogger3, ServiceType, stringToUuid } from "@elizaos/core";
var PayAIJobManagerService = class extends Service {
  static get serviceType() {
    return ServiceType.TEXT_GENERATION;
  }
  handleWorkInterval;
  async initialize(runtime) {
    this.handleWorkInterval = setInterval(() => {
      this.handlePayAIWork(runtime);
    }, 3e4);
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
        const completedWork = jobDetails.completedWork;
        const contactInfo = jobDetails.contactInfo;
        const messageToUser = `@${contactInfo.handle} I've completed the work for this contract. ${completedWork.url}`;
        const twitterClient = runtime.clients.find((client) => {
          var _a;
          if (!client) return false;
          return ((_a = client == null ? void 0 : client.constructor) == null ? void 0 : _a.name) === "TwitterManager";
        });
        try {
          const newTweet = await twitterClient.post.postTweet(
            runtime,
            twitterClient.client,
            messageToUser,
            jobDetails.contactInfo.roomId,
            messageToUser
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
        await runtime.cacheManager.remove(`${runtime.agentId}-payai-contracts-${contract}`);
      } else {
        elizaLogger3.warn("Unknown job status, dropping job. You should look into this.");
        elizaLogger3.debug("jobDetails: ", jobDetails);
        await runtime.cacheManager.remove(`${runtime.agentId}-payai-contracts-${contract}`);
      }
    }
  }
};
async function runJob(runtime, contract, jobDetails) {
  var _a;
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
      void 0,
      callback
    );
  }
  jobDetails.status = "COMPLETED";
  await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
  elizaLogger3.debug("Marked job as COMPLETED");
}
var payAIJobManagerService = new PayAIJobManagerService();

// src/actions/browseAgents.ts
import {
  ModelClass,
  composeContext,
  elizaLogger as elizaLogger4,
  generateText,
  getEmbeddingZeroVector,
  cleanJsonResponse
} from "@elizaos/core";
var findMatchingServicesTemplate = `
Analyze the following conversation to extract a list of services that match what the user is looking for.

The Service Name is the name of the service that the Seller is offering.
The Service Description is a brief description of the service.
The Service Price is the price of the service.
The Seller is identified by their solana wallet address.
The Service Ad CID is identified by the hash of the entry.
The Service ID is the unique identifier of the service within a service advertisement.


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
Seller: B2imQsisfrTLoXxzgQfxtVJ3vQR9bGbpmyocVu3nWGJ6
Service Ad CID: bafyreifo4inpuekp466muw2bmldqkg6zetiwi6psjyiwzzyz35bsmcvhrq
Service ID

Service Name
Service Description
Service Price
Seller: updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM
Service Ad CID: bafyreifo4inpuekp46zetiwi6psjyiwzzyz35bsmcvhrq6muw2bmldqkg6
Service ID"
}

If no matching services were found, then set the "success" field to false and set the result to a string informing the user that no matching services were found, and ask them to try rewording their search. Be natural and polite.
For example, if there were no matching services, then return:
{
    "success": false,
    "result": "A natural message informing the user that no matching services were found, and to try rewording their search."
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
      const findMatchingServicesContext = composeContext({
        state,
        template: findMatchingServicesTemplate
      });
      const findMatchingServicesContent = await generateText({
        runtime,
        context: findMatchingServicesContext,
        modelClass: ModelClass.LARGE
      });
      elizaLogger4.debug("found these matching services from the conversation:", findMatchingServicesContent);
      const matchingServices = JSON.parse(cleanJsonResponse(findMatchingServicesContent));
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
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
      }
      return true;
    } catch (error) {
      console.error("Error in BROWSE_PAYAI_AGENTS handler:", error);
      if (callback) {
        callback({
          text: "Error processing BROWSE_PAYAI_AGENTS request.",
          content: { error: "Error processing BROWSE_PAYAI_AGENTS request." }
        });
      }
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
  ModelClass as ModelClass2,
  composeContext as composeContext2,
  elizaLogger as elizaLogger5,
  generateText as generateText2,
  cleanJsonResponse as cleanJsonResponse2,
  getEmbeddingZeroVector as getEmbeddingZeroVector2
} from "@elizaos/core";
var extractOfferDetailsTemplate = `
Analyze the Conversation below to extract Offer Details from a buyer to a seller.
Offer Details have this schema when successful:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "wallet": "Solana public key of the seller",
        "desiredServiceID": "ID of the service the buyer wants to purchase",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase"
}

Offer Details have this schema when unsuccessful:
{
    "success": false,
    "result": "feedback message"
}

Conversation:
{{recentMessages}}


Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "wallet": "Solana public key of the seller",
        "desiredServiceID": "ID of the service the buyer wants to purchase",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase"
    }
}

If the buyer provided the seller's identity or wallet in the conversation, then set the wallet field to equal the seller's identity or wallet.
If the buyer provided the service ID or amount of units in the conversation, then set the desiredServiceID or desiredUnitAmount fields to equal the service ID or amount of units.
If the buyer provided the seller's service ad CID in the conversation, then set the serviceAdCID field to equal the seller's service ad CID.

If not all information was provided, or the information was unclear, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could only find the seller's wallet or identity, then return:
{
    "success": false,
    "result": "Please provide the service ID, and the amount of units you want to purchase."
}

Make sure you recognize when a user is asking to purchase a new service.
If you see in the message history that you recently created a purchase order for a user, and now they are asking for a new service, then you should forget the previous order that they created and help them create a new purchase order for a new service.

Only return a JSON markdown block.
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
      const makeOfferContext = composeContext2({
        state,
        template: extractOfferDetailsTemplate
      });
      const extractedDetailsText = await generateText2({
        runtime,
        context: makeOfferContext,
        modelClass: ModelClass2.SMALL
      });
      elizaLogger5.debug("extractedDetailsText:", extractedDetailsText);
      const extractedDetails = JSON.parse(cleanJsonResponse2(extractedDetailsText));
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
        desiredServiceID: extractedDetails.result.desiredServiceID,
        desiredUnitAmount: extractedDetails.result.desiredUnitAmount
      };
      const buyOffer = await prepareBuyOffer(offerDetails, runtime);
      elizaLogger5.debug("Publishing buy offer to IPFS:", buyOffer);
      const result = await payAIClient.buyOffersDB.put(buyOffer);
      const CID3 = getCIDFromOrbitDbHash(result);
      elizaLogger5.info("Published Buy Offer to IPFS: ", CID3);
      let responseToUser = `Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${extractedDetails.result.wallet}.`;
      responseToUser += `
Your Buy Offer's IPFS CID is ${CID3}`;
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `@${state.senderName} ${responseToUser}`,
            action: "MAKE_OFFER",
            source: message.content.source,
            buyOffer: offerDetails
          },
          embedding: getEmbeddingZeroVector2()
        };
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
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
          text: "Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${extractedDetails.result.wallet}. Your Buy Offer's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          action: "MAKE_OFFER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase 3 units of service ID 2."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
          action: "MAKE_OFFER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase service ID 1."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
          action: "MAKE_OFFER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase seller 9ovkK7WoiSXyEJDM5cZG3or3W95bdzZLDDHhuMgSJT9U"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
          action: "MAKE_OFFER"
        }
      }
    ],
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
          text: "Please provide the serviceAdCID of the seller's services.",
          action: "MAKE_OFFER"
        }
      }
    ]
  ]
};
var makeOfferAction_default = makeOfferAction;

// src/actions/acceptOfferAction.ts
import {
  ModelClass as ModelClass3,
  composeContext as composeContext3,
  elizaLogger as elizaLogger6,
  generateText as generateText3,
  cleanJsonResponse as cleanJsonResponse3,
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

If the buyer did not provide the CID of the Buy Offer, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the CID of the Buy Offer, then return:
{
    "success": false,
    "result": "Please provide the CID of the Buy Offer."
}

Only return a JSON markdown block.
`;
var acceptOfferAction = {
  name: "ACCEPT_OFFER",
  similes: ["AGREE_TO_OFFER", "ACCEPT_PROPOSAL", "ACCEPT_TERMS", "ACCEPT_BUY_OFFER"],
  description: "This action allows a seller to accept an offer from a buyer on the PayAI marketplace.",
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
      const acceptOfferContext = composeContext3({
        state,
        template: extractOfferCIDTemplate
      });
      const extractedDetailsText = await generateText3({
        runtime,
        context: acceptOfferContext,
        modelClass: ModelClass3.SMALL
      });
      elizaLogger6.debug("extracted the following Buy Offer CID from the conversation:", extractedDetailsText);
      const extractedDetails = JSON.parse(cleanJsonResponse3(extractedDetailsText));
      if (extractedDetails.success === false || extractedDetails.success === "false") {
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
      const { isValid, reason } = await isValidBuyOffer(extractedDetails.result.buyOfferCID, runtime);
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
      let responseToUser = `I accepted the offer and signed an agreement. The Agreement's IPFS CID is ${CID3}`;
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `@${state.senderName} ${responseToUser}`,
            action: "ACCEPT_OFFER",
            source: message.content.source,
            agreement: agreementDetails
          },
          embedding: getEmbeddingZeroVector3()
        };
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
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
          text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
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
          text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Buy Offer signature is invalid.",
          action: "ACCEPT_OFFER"
        }
      }
    ],
    // Example where the user provides a Buy Offer that references a non-existent Service Ad
    [
      {
        user: "{{user1}}",
        content: {
          text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "ServiceAd referenced by Buy Offer does not exist",
          action: "ACCEPT_OFFER"
        }
      }
    ],
    // Example where the user provides a Buy Offer that references a Service Ad that does not match the seller's most recent Service Ad
    [
      {
        user: "{{user1}}",
        content: {
          text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "ServiceAd does not match the seller's most recent service Ad. Seller's most recent service ad can be found at bafybeibml5uieyxa5tufngvg7fgwbkwvlsuntwbxgtskoqynbt7wlchmfm",
          action: "ACCEPT_OFFER"
        }
      }
    ]
  ]
};
async function isValidBuyOffer(buyOfferCID, runtime) {
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
  ModelClass as ModelClass4,
  composeContext as composeContext4,
  elizaLogger as elizaLogger7,
  generateText as generateText4,
  getEmbeddingZeroVector as getEmbeddingZeroVector4,
  cleanJsonResponse as cleanJsonResponse4
} from "@elizaos/core";
var extractServicesTemplate = `
Analyze the following conversation to extract the services that the user wants to sell.
There could be multiple services, so make sure you extract all of them.

Return a JSON object containing only the fields where information was clearly found.

For example:
{
    "success": true,
    "result": [
        {
            "name": "Service Name",
            "description": "Service Description",
            "price": "Service Price"
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
    try {
      if (!state) {
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const extractServicesContext = composeContext4({
        state,
        template: extractServicesTemplate
      });
      const extractedServicesText = await generateText4({
        runtime,
        context: extractServicesContext,
        modelClass: ModelClass4.SMALL
      });
      elizaLogger7.debug("extracted services from generateText:", extractedServicesText);
      const extractedServices = JSON.parse(cleanJsonResponse4(extractedServicesText));
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
      const serviceAd = await prepareServiceAd(extractedServices.result, runtime);
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
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
      }
      return true;
    } catch (error) {
      elizaLogger7.error("Error in SELL_SERVICES handler:", error);
      console.error(error);
      if (callback) {
        callback({
          text: "Error processing SELL_SERVICES request.",
          action: "SELL_SERVICES",
          source: message.content.source
        });
      }
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
  ModelClass as ModelClass5,
  composeContext as composeContext5,
  elizaLogger as elizaLogger8,
  generateText as generateText5,
  cleanJsonResponse as cleanJsonResponse5,
  getEmbeddingZeroVector as getEmbeddingZeroVector5
} from "@elizaos/core";
var extractAgreementCIDTemplate = `
Analyze the following conversation to extract the CID of the Agreement from the seller.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "agreementCID": "CID of the Agreement"
    }
}

If the seller did not provide the CID of the Agreement, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the CID of the Agreement, then return:
{
    "success": false,
    "result": "Please provide the CID of the Agreement."
}

Only return a JSON markdown block.
`;
var executeContractAction = {
  name: "EXECUTE_CONTRACT",
  similes: ["START_ENGAGEMENT", "BEGIN_CONTRACT", "INITIATE_CONTRACT"],
  description: "This action allows a buyer to start the contract by sending funds to an escrow account on Solana.",
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
      const executeContractContext = composeContext5({
        state,
        template: extractAgreementCIDTemplate
      });
      const extractedDetailsText = await generateText5({
        runtime,
        context: executeContractContext,
        modelClass: ModelClass5.SMALL
      });
      elizaLogger8.debug("extracted the following Agreement CID from the conversation:", extractedDetailsText);
      const extractedDetails = JSON.parse(cleanJsonResponse5(extractedDetailsText));
      if (extractedDetails.success === false || extractedDetails.success === "false") {
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
      const agreement = (await payAIClient.getEntryFromCID(extractedDetails.result.agreementCID, payAIClient.agreementsDB)).payload.value;
      ;
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
      ;
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
      let responseToUser = `Successfully started the contract. You can see the transaction at https://solscan.io/tx/${tx}`;
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `@${state.senderName} ${responseToUser}`,
            action: "EXECUTE_CONTRACT",
            source: message.content.source,
            agreement: extractedDetails.result.agreementCID
          },
          embedding: getEmbeddingZeroVector5()
        };
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
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
          text: "I have signed an agreement with CID bafybeihdwdcojee6xedzdetojuzjevtenxquvykuefgh4dqkjv67uzcmw7"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Great! I checked it out and everything looks good. I just started the contract. You can see the transaction here: https://solscan.io/tx/4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I have signed an agreement with CID bafybeihdwdcojee6xedzdetojuzjevtenxquvykuefgh4dqkjv67uzcmw7"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "I could not find anything with that CID. Please double check and provide it again."
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I have signed an agreement with CID bafybeihdwdcojee6xedzdetojuzjevtenxquvykuefgh4dqkjv67uzcmw7"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Agreement signature is invalid."
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I have signed an agreement with CID bafybeihdwdcojee6xedzdetojuzjevtenxquvykuefgh4dqkjv67uzcmw7"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "The signature of the Buy Offer that this Agreement references is invalid."
        }
      }
    ]
  ]
};
var executeContractAction_default = executeContractAction;

// src/actions/startWork.ts
import {
  ModelClass as ModelClass6,
  composeContext as composeContext6,
  elizaLogger as elizaLogger9,
  generateText as generateText6,
  cleanJsonResponse as cleanJsonResponse6,
  getEmbeddingZeroVector as getEmbeddingZeroVector6
} from "@elizaos/core";
var extractTransactionSignatureTemplate = `
Analyze the following conversation to extract the transaction signature of the contract.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "transactionSignature": "transaction signature of the contract"
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
      const startWorkContext = composeContext6({
        state,
        template: extractTransactionSignatureTemplate
      });
      const extractedDetailsText = await generateText6({
        runtime,
        context: startWorkContext,
        modelClass: ModelClass6.SMALL
      });
      const extractedDetails = JSON.parse(cleanJsonResponse6(extractedDetailsText));
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
      let responseToUser = `Thanks for funding the contract. I will start work now!`;
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: `@${state.senderName} ${responseToUser}`,
            action: "START_WORK",
            source: message.content.source
          },
          embedding: getEmbeddingZeroVector6()
        };
        await runtime.messageManager.createMemory(newMemory);
        const callbackResponse = await callback(newMemory.content);
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

// src/index.ts
var payaiPlugin = {
  name: "payai",
  description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
  actions: [browseAgents_default, makeOfferAction_default, acceptOfferAction_default, advertiseServicesAction_default, executeContractAction_default, startWork_default],
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
