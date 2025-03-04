// src/client.ts
import { elizaLogger } from "@elizaos/core";
import { createHelia } from "helia";
import { createLibp2p } from "libp2p";
import { CID } from "multiformats/cid";
import { base58btc } from "multiformats/bases/base58";
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
    "/ip4/146.0.79.23/tcp/2369/ws/p2p/12D3KooWRZjd3sRLEuGDW2JR8xsnXedosU3eoe5XhnUAsqFauoTn"
  ],
  databases: {
    updates: "/orbitdb/zdpuB29HS4Pd9vjr4qs9NdfEH5TCmVPqoHm9frf9c77Crq7Z5",
    serviceAds: "/orbitdb/zdpuAyvkTHk4w8wMTVCjvDRrFQpeGyYdrgoK48ufj8B5WgZst",
    buyOffers: "/orbitdb/zdpuAyM5AWffHSqTtxf2KubRARvwYFTycfuQX4ZG4MhhdyUML",
    agreements: "/orbitdb/zdpuAu9t5Avi2BVBEu3wjDTBcMYTyUKnuqPx3saFUKEw6GXhc"
  }
};

// src/config/libp2p.ts
console.log("bootstrapConfig.addresses: ", bootstrap_default.addresses);
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

// src/client.ts
import fs from "fs";

// src/utils.ts
import { createHash } from "crypto";
import bs58 from "bs58";
import {
  signBytes,
  createKeyPairFromPrivateKeyBytes,
  verifySignature
} from "@solana/web3.js";
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
  const serializedMessage = JSON.stringify(message);
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
  return hash;
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
      ...agreementDetails,
      identity: base58PublicKey
    };
    const signature = await hashAndSign(message, solanaKeypair.privateKey);
    const formattedAgreement = {
      message,
      signature,
      _id: signature
      // TODO make this more resilient in the future
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
      results.push(doc);
    }
  }
  return results;
}

// src/client.ts
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
  servicesConfig = null;
  servicesConfigPath;
  servicesConfigInterval = null;
  sellerServiceAdCID = null;
  constructor() {
    elizaLogger.debug("PayAI Client created");
  }
  /**
   * Initializes the PayAI Client by creating libp2p, Helia, and OrbitDB instances.
   */
  async initialize(runtime) {
    try {
      elizaLogger.info("Initializing PayAI Client");
      const agentDir = dataDir + "/" + runtime.character.name;
      const libp2pDatastore = new LevelDatastore(agentDir + "/libp2p");
      const libp2pConfig = Object.assign({}, libp2pOptions);
      libp2pConfig.datastore = libp2pDatastore;
      this.libp2p = await createLibp2p(libp2pConfig);
      const blockstore = new FsBlockstore(agentDir + "/ipfs");
      this.ipfs = await createHelia({ libp2p: this.libp2p, blockstore });
      this.orbitdb = await createOrbitDB({ ipfs: this.ipfs, directory: agentDir });
      this.updatesDB = await this.orbitdb.open(bootstrap_default.databases.updates, { sync: true });
      this.updatesDB.events.on("update", async (entry) => {
        elizaLogger.debug("payai updates db: ", entry.payload.value);
      });
      this.serviceAdsDB = await this.orbitdb.open(bootstrap_default.databases.serviceAds, { sync: true });
      this.serviceAdsDB.events.on("update", async (entry) => {
        elizaLogger.debug("payai service ads db: ", entry.payload.value);
      });
      this.buyOffersDB = await this.orbitdb.open(bootstrap_default.databases.buyOffers, { sync: true });
      this.buyOffersDB.events.on("update", async (entry) => {
        elizaLogger.debug("payai buy offers db: ", entry.payload.value);
      });
      this.agreementsDB = await this.orbitdb.open(bootstrap_default.databases.agreements, { sync: true });
      this.agreementsDB.events.on("update", async (entry) => {
        elizaLogger.debug("payai agreements db: ", entry.payload.value);
      });
      await this.updatesDB.add(`Agent ${runtime.character.name} joined the payai network`);
      this.servicesConfigPath = `${agentDir}/sellerServices.json`;
      await this.initSellerAgentFunctionality(runtime);
      elizaLogger.info("PayAI Client initialized");
    } catch (error) {
      elizaLogger.error("Failed to initialize PayAI Client", error);
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
      this.servicesConfig = localServices;
      const localServiceAd = await prepareServiceAd(localServices, runtime);
      const fetchedServiceAds = await queryOrbitDbReturningCompleteEntries(
        this.serviceAdsDB,
        (doc) => {
          return doc.message.toString() === localServiceAd.message.toString() && doc.signature === localServiceAd.signature;
        }
      );
      if (fetchedServiceAds.length === 0) {
        elizaLogger.info("Local services does not match serviceAdsDB, adding to database");
        const result = await this.serviceAdsDB.put(localServiceAd);
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(result);
        elizaLogger.info("Added new service to serviceAdsDB");
        elizaLogger.info("CID: ", CID.parse(result, base58btc).toString());
      } else {
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(fetchedServiceAds[0].hash);
        elizaLogger.info("Local services marches serviceAdsDB, no need to update the database");
      }
    }
    await this.checkServicesConfig(runtime);
    this.servicesConfigInterval = setInterval(() => {
      this.checkServicesConfig(runtime).catch((error) => {
        elizaLogger.error("Error in servicesConfigInterval", error);
      });
    }, 1e4);
  }
  readAndParseServicesConfig() {
    try {
      const fileContents = fs.readFileSync(this.servicesConfigPath, "utf-8");
      return JSON.parse(fileContents);
    } catch (error) {
      elizaLogger.error("Error reading sellerServices.json", error);
      console.error(error);
      throw error;
    }
  }
  /**
   * Checks the sellerServices.json file for updates and updates the serviceAdsDB if necessary.
   */
  async checkServicesConfig(runtime) {
    try {
      if (!fs.existsSync(this.servicesConfigPath)) {
        return;
      }
      const parsedContents = this.readAndParseServicesConfig();
      if (JSON.stringify(this.servicesConfig) !== JSON.stringify(parsedContents)) {
        elizaLogger.info("sellerServices.json has changed");
        this.servicesConfig = parsedContents;
        const serviceAd = await prepareServiceAd(this.servicesConfig, runtime);
        const result = await this.serviceAdsDB.put(serviceAd);
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(result);
        elizaLogger.info("Updated serviceAdsDB with new sellerServices.json contents");
      }
    } catch (error) {
      elizaLogger.error("Error checking sellerServices.json", error);
      console.error(error);
      throw error;
    }
  }
  /*
   * Function to get an OrbitDB entry using its hash.
   */
  async getEntryFromHash(hash, db) {
    try {
      const entry = await db.log.get(hash);
      return entry.payload.value;
    } catch (error) {
      elizaLogger.error("Error getting orbitdb entry from hash", error);
      throw error;
    }
  }
  // TODO this will change once PayAI content is available from publicly accessible IPFS nodes
  /* Function to get an OrbitDB entry using its ipfs CID. */
  async getEntryFromCID(cid, db) {
    return this.getEntryFromHash(cid, db);
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
      if (this.servicesConfigInterval) {
        clearInterval(this.servicesConfigInterval);
        this.servicesConfigInterval = null;
      }
    } catch (error) {
      elizaLogger.error("Failed to close databases", error);
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
      elizaLogger.info("PayAI Client started");
    } catch (error) {
      elizaLogger.error("Error while starting PayAI Client", error);
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
      elizaLogger.info("PayAI Client stopped");
    } catch (error) {
      elizaLogger.error("Error while stopping PayAI Client", error);
      throw error;
    }
  }
};
var payAIClient = new PayAIClient();

// src/actions/browseAgents.ts
import {
  ModelClass,
  composeContext,
  elizaLogger as elizaLogger2,
  generateText,
  getEmbeddingZeroVector,
  parseJSONObjectFromText
} from "@elizaos/core";
var findMatchingServicesTemplate = `
Analyze the following conversation to extract a list of services that the user is looking for.
There could be multiple services, so make sure you extract all of them.

The Seller is identified by their solana wallet address.
The Service Ad CID is identified by the hash of the entry.

Conversation:

{{recentMessages}}


All possible services:

{{services}}


Return a JSON object containing all of the services that match what the user is looking for.
For example:
{
    "success": true,
    "result": "Here are the services that match your query:

First Service Name
First Service Description
First Service Price
Seller: B2imQsisfrTLoXxzgQfxtVJ3vQR9bGbpmyocVu3nWGJ6
Service Ad CID: zdpuAuhwXA4NGv5Qqc6nFHPjHtFxcqnYRSGyW1FBCkrfm2tgF

Second Service Name
Second Service Description
Second Service Price
Seller: updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM
Service Ad CID: zdpuAn5qVvoT1h2KfwNxZehFnNotCdBeEgVFGYTBuSEyKPtDB"
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
      const services = await payAIClient.serviceAdsDB.all();
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
        modelClass: ModelClass.SMALL
      });
      elizaLogger2.debug("found these matching services from the conversation:", findMatchingServicesContent);
      const matchingServices = parseJSONObjectFromText(findMatchingServicesContent);
      if (matchingServices.success === false) {
        elizaLogger2.info("Couldn't find any services matching the user's request.");
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
  elizaLogger as elizaLogger3,
  generateText as generateText2,
  parseJSONObjectFromText as parseJSONObjectFromText2,
  getEmbeddingZeroVector as getEmbeddingZeroVector2
} from "@elizaos/core";
var extractOfferDetailsTemplate = `
Analyze the following conversation to extract Offer Details from a buyer to a seller.

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
      elizaLogger3.debug("extracted the following Buy Offer details from the conversation:", extractedDetailsText);
      const extractedDetails = parseJSONObjectFromText2(extractedDetailsText);
      if (extractedDetails.success === false) {
        elizaLogger3.info("Need more information from the user to make an offer.");
        if (callback) {
          callback({
            text: extractedDetails.result,
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
      elizaLogger3.debug("Publishing buy offer to IPFS:", buyOffer);
      const result = await payAIClient.buyOffersDB.put(buyOffer);
      const CID2 = getCIDFromOrbitDbHash(result);
      elizaLogger3.info("Published Buy Offer to IPFS: ", CID2);
      let responseToUser = `Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${extractedDetails.result.wallet}.`;
      responseToUser += `
Your Buy Offer's IPFS CID is ${CID2}`;
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: responseToUser,
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
      elizaLogger3.error("Error in MAKE_OFFER handler:", error);
      console.error(error);
      if (callback) {
        callback({
          text: "Error processing MAKE_OFFER request.",
          action: "MAKE_OFFER",
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
  elizaLogger as elizaLogger4,
  generateText as generateText3,
  parseJSONObjectFromText as parseJSONObjectFromText3,
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
      elizaLogger4.debug("extracted the following Buy Offer CID from the conversation:", extractedDetailsText);
      const extractedDetails = parseJSONObjectFromText3(extractedDetailsText);
      if (extractedDetails.success === false) {
        elizaLogger4.info("Need more information from the user to accept the offer.");
        if (callback) {
          callback({
            text: extractedDetails.result,
            action: "ACCEPT_OFFER",
            source: message.content.source
          });
        }
        return false;
      }
      const { isValid, reason } = await isValidBuyOffer(extractedDetails.result.buyOfferCID, runtime);
      if (!isValid) {
        elizaLogger4.info(reason);
        if (callback) {
          callback({
            text: reason,
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
      elizaLogger4.debug("Publishing agreement to IPFS:", agreement);
      const result = await payAIClient.agreementsDB.put(agreement);
      const CID2 = getCIDFromOrbitDbHash(result);
      elizaLogger4.info("Published Agreement to IPFS: ", CID2);
      let responseToUser = `I accepted the offer and signed an agreement. The Agreement's IPFS CID is ${CID2}`;
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: responseToUser,
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
      elizaLogger4.error("Error in ACCEPT_OFFER handler:", error);
      console.error(error);
      if (callback) {
        callback({
          text: "Error processing ACCEPT_OFFER request.",
          action: "ACCEPT_OFFER",
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
    const buyOffer = await payAIClient.getEntryFromCID(buyOfferCID, payAIClient.buyOffersDB);
    const identity = buyOffer.identity;
    const signature = buyOffer.signature;
    const message = buyOffer.message;
    const isValidSignature = await verifyMessage(identity, signature, message);
    if (!isValidSignature) {
      return { isValid: false, reason: "Buy Offer signature is invalid." };
    }
    const serviceAd = await payAIClient.getEntryFromHash(message.serviceAdCID, payAIClient.serviceAdsDB);
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
  elizaLogger as elizaLogger5,
  generateText as generateText4,
  getEmbeddingZeroVector as getEmbeddingZeroVector4,
  parseJSONObjectFromText as parseJSONObjectFromText4
} from "@elizaos/core";
import fs2 from "fs";
var extractServicesTemplate = `
Analyze the following conversation to extract the services that the user wants to sell.
There could be multiple services, so make sure you extract all of them.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": [
        {
            "name": "First Service Name",
            "description": "First Service Description",
            "price": "First Service Price"
        },
        {
            "name": "Second Service Name",
            "description": "Second Service Description",
            "price": "Second Service Price"
        }
    ]
}

If the user did not provide enough information, then set the "success" field to false and set the result to a string asking the user to provide the missing information. If asking for missing information, be natural and polite.
For example, if you could not find the services, then return:
{
    "success": false,
    "result": "A natural message asking the user to provide information on the services they want to sell."
}

Only return a JSON mardown block.
`;
var confirmServicesTemplate = `
Look for confirmation from the user that the following services are the only ones they are selling at the moment.

{{services}}

User's recent messages are below.

{{recentMessages}}


Return a JSON object containing only the fields where information was clearly found.
If the user confirmed, then set the "success" field to true and set the result to "yes".
For example:
{
    "success": true,
    "result": "yes"
}

If the user did not confirm, then set the "success" field to false and set the result to a string asking the user to confirm.
For example, if you could not find the confirmation, then return:
{
    "success": false,
    "result": "Please confirm that these are the only services you are selling at the moment:

{{services}}"
}

Only return a JSON mardown block.
`;
var advertiseServicesAction = {
  name: "ADVERTISE_SERVICES",
  similes: ["SELL_SERVICES", "OFFER_SERVICES", "LIST_SERVICES"],
  description: "Ask the user for the services they want to sell, create the services file locally, and publish it to the serviceAdsDB.",
  suppressInitialMessage: true,
  validate: async (runtime, message) => {
    console.log("message.content.source: ", message.content.source);
    if (message.content.source !== "direct") {
      elizaLogger5.debug("ADVERTISE_SERVICES action is only allowed when interacting with the direct client. This message was from:", message.content.source);
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
      elizaLogger5.debug("extracted the following services from the conversation:", extractedServicesText);
      console.log("extracted the following services from the conversation:", extractedServicesText);
      const extractedServices = parseJSONObjectFromText4(extractedServicesText);
      console.log("message: ", message);
      if (extractedServices.success === false) {
        elizaLogger5.info("Need more information from the user to advertise services.");
        if (callback) {
          callback({
            text: extractedServices.result,
            action: "ADVERTISE_SERVICES",
            source: message.content.source
          });
        }
        return false;
      }
      state.services = extractedServices.result.map(
        (service) => `Name: ${service.name}
Description: ${service.description}
Price: ${service.price}`
      ).join("\n\n");
      const confirmServicesContext = composeContext4({
        state,
        template: confirmServicesTemplate
      });
      const confirmServicesText = await generateText4({
        runtime,
        context: confirmServicesContext,
        modelClass: ModelClass4.SMALL
      });
      elizaLogger5.debug("confirmation from the user:", confirmServicesText);
      console.log("confirmation from the user:", confirmServicesText);
      const confirmServices = parseJSONObjectFromText4(confirmServicesText);
      if (confirmServices.success === false) {
        elizaLogger5.info("Need confirmation from the user.");
        if (callback) {
          callback({
            text: confirmServices.result,
            action: "ADVERTISE_SERVICES",
            source: message.content.source
          });
        }
        return false;
      }
      const servicesFilePath = payAIClient.servicesConfigPath;
      console.log("writing the following services to the services file:", extractedServices.result);
      fs2.writeFileSync(servicesFilePath, JSON.stringify(extractedServices.result, null, 2));
      elizaLogger5.info("Created services file locally at:", servicesFilePath);
      const serviceAd = await prepareServiceAd(extractedServices.result, runtime);
      elizaLogger5.debug("Publishing service ad to IPFS:", serviceAd);
      const result = await payAIClient.serviceAdsDB.put(serviceAd);
      const CID2 = getCIDFromOrbitDbHash(result);
      elizaLogger5.info("Published Service Ad to IPFS: ", CID2);
      let responseToUser = `Successfully advertised your services. Your Service Ad's IPFS CID is ${CID2}`;
      if (callback) {
        const newMemory = {
          userId: message.agentId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            text: responseToUser,
            action: "ADVERTISE_SERVICES",
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
      elizaLogger5.error("Error in ADVERTISE_SERVICES handler:", error);
      console.error(error);
      if (callback) {
        callback({
          text: "Error processing ADVERTISE_SERVICES request.",
          action: "ADVERTISE_SERVICES",
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
          text: "I want to sell web development services for $50 per hour."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Successfully advertised your services. Your Service Ad's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          action: "ADVERTISE_SERVICES"
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
          action: "ADVERTISE_SERVICES"
        }
      }
    ]
  ]
};
var advertiseServicesAction_default = advertiseServicesAction;

// src/index.ts
var payaiPlugin = {
  name: "payai",
  description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
  actions: [browseAgents_default, makeOfferAction_default, acceptOfferAction_default, advertiseServicesAction_default],
  evaluators: [],
  providers: [],
  services: [],
  clients: [payAIClient]
};
var index_default = payaiPlugin;
export {
  index_default as default,
  payaiPlugin
};
