// src/clients/client.ts
import { elizaLogger } from "@elizaos/core";
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
      await this.updatesDB.add(`Agent ${runtime.character.name} joined the payai network`);
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
      this.setServicesConfig(localServices);
      const localServiceAd = await prepareServiceAd(localServices, runtime);
      const fetchedServiceAds = await queryOrbitDbReturningCompleteEntries(
        this.serviceAdsDB,
        (doc) => {
          return doc.message.toString() === localServiceAd.message.toString() && doc.signature === localServiceAd.signature;
        }
      );
      if (fetchedServiceAds.length === 0) {
        elizaLogger.info("Local services does not match serviceAdsDB, adding to database");
        await this.publishPreparedServiceAd(localServiceAd);
      } else {
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(fetchedServiceAds[0].hash);
        elizaLogger.info("Local services marches serviceAdsDB, no need to update the database");
      }
    }
    await this.checkServicesConfig(runtime);
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
      elizaLogger.info("Published service ad to IPFS:", this.sellerServiceAdCID);
      return this.sellerServiceAdCID;
    } catch (error) {
      elizaLogger.error("Error publishing prepared service ad", error);
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
      elizaLogger.error("Error getting orbitdb entry from hash", error);
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
      elizaLogger2.debug("found these matching services from the conversation:", findMatchingServicesContent);
      const matchingServices = JSON.parse(cleanJsonResponse(findMatchingServicesContent));
      if (matchingServices.success === false || matchingServices.success === "false") {
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
      elizaLogger3.debug("extractedDetailsText:", extractedDetailsText);
      const extractedDetails = JSON.parse(cleanJsonResponse2(extractedDetailsText));
      elizaLogger3.debug("extractedDetails:", extractedDetails);
      if (extractedDetails.success === false || extractedDetails.success === "false") {
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
      const CID3 = getCIDFromOrbitDbHash(result);
      elizaLogger3.info("Published Buy Offer to IPFS: ", CID3);
      let responseToUser = `Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${extractedDetails.result.wallet}.`;
      responseToUser += `
Your Buy Offer's IPFS CID is ${CID3}`;
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
      elizaLogger4.debug("extracted the following Buy Offer CID from the conversation:", extractedDetailsText);
      const extractedDetails = JSON.parse(cleanJsonResponse3(extractedDetailsText));
      if (extractedDetails.success === false || extractedDetails.success === "false") {
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
      const CID3 = getCIDFromOrbitDbHash(result);
      elizaLogger4.info("Published Agreement to IPFS: ", CID3);
      let responseToUser = `I accepted the offer and signed an agreement. The Agreement's IPFS CID is ${CID3}`;
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
  elizaLogger as elizaLogger5,
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
      elizaLogger5.debug("SELL_SERVICES action is only allowed when interacting with the direct client. This message was from:", message.content.source);
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
      elizaLogger5.debug("extracted services from generateText:", extractedServicesText);
      const extractedServices = JSON.parse(cleanJsonResponse4(extractedServicesText));
      elizaLogger5.debug("extracted the following services from the conversation:", extractedServicesText);
      if (extractedServices.success === false || extractedServices.success === "false") {
        elizaLogger5.info("Need more information from the user to advertise services.");
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
      elizaLogger5.debug("Updating the local services file with the seller's services");
      payAIClient.saveSellerServices(JSON.stringify(extractedServices.result, null, 2));
      elizaLogger5.info("Updated services file locally at:", servicesFilePath);
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
      elizaLogger5.error("Error in SELL_SERVICES handler:", error);
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
