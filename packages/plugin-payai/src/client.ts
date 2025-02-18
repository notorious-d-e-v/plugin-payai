import { type Client, IAgentRuntime } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import { createHelia, Helia } from 'helia';
import { createLibp2p, Libp2p } from 'libp2p';
import { CID } from 'multiformats/cid';
import { base58btc } from 'multiformats/bases/base58';
import { createOrbitDB, OrbitDB, IPFSAccessController } from '@orbitdb/core';
import { FsBlockstore } from 'blockstore-fs';
import { libp2pOptions } from './config/libp2p';
import { signBytes, KeyPairSigner, createKeyPairFromPrivateKeyBytes, generateKeyPair } from '@solana/web3.js';
import bs58 from 'bs58';
import { dataDir, sellerServicesFile } from './datadir';
import bootstrapConfig from './config/bootstrap.json'
import fs from 'fs';
const {
    createHash,
  } = await import('node:crypto');


class PayAIClient implements Client {
  public libp2p: Libp2p | null = null;
  public ipfs: Helia | null = null;
  public orbitdb: OrbitDB | null = null;
  public updatesDB: any = null;
  public serviceAdsDB: any = null;
  public buyOffersDB: any = null;
  public agreementsDB: any = null;
  private servicesConfig: any = null;
  private servicesConfigPath: string = sellerServicesFile;
  private servicesConfigInterval: NodeJS.Timeout | null = null;

  constructor() {
    elizaLogger.debug('PayAI Client created');
  }

  /**
   * Initializes the PayAI Client by creating libp2p, Helia, and OrbitDB instances.
   */
  public async initialize(runtime: IAgentRuntime): Promise<void> {
    try {
      elizaLogger.info('Initializing PayAI Client');

      // create libp2p instance
      this.libp2p = await createLibp2p(libp2pOptions);

      // create ipfs instance
      const blockstore = new FsBlockstore(dataDir + '/ipfs');
      this.ipfs = await createHelia({ libp2p: this.libp2p, blockstore });

      // create orbitdb instance
      this.orbitdb = await createOrbitDB( {ipfs: this.ipfs, directory: dataDir});

      // open updates database
      this.updatesDB = await this.orbitdb.open(bootstrapConfig.databases.updates, { sync: true });
      this.updatesDB.events.on('update', async (entry) => {
        // what has been updated.
        elizaLogger.debug('payai updates db: ', entry.payload.value);
      });

      // open service ads database
      this.serviceAdsDB = await this.orbitdb.open(bootstrapConfig.databases.serviceAds, { sync: true });
      this.serviceAdsDB.events.on('update', async (entry) => {
        elizaLogger.debug('payai service ads db: ', entry.payload.value);
      });

      // open buy offers database
      this.buyOffersDB = await this.orbitdb.open(bootstrapConfig.databases.buyOffers, { sync: true });
      this.buyOffersDB.events.on('update', async (entry) => {
        elizaLogger.debug('payai buy offers db: ', entry.payload.value);
      });

      // open agreements database
      this.agreementsDB = await this.orbitdb.open(bootstrapConfig.databases.agreements, { sync: true });
      this.agreementsDB.events.on('update', async (entry) => {
        elizaLogger.debug('payai agreements db: ', entry.payload.value);
      });

      // write to the updates database
      await this.updatesDB.add(`Agent ${runtime.character.name} joined the payai network`);

      // init seller agent checks
      await this.initSellerAgentFunctionality(runtime);

      elizaLogger.info('PayAI Client initialized');
    } catch (error) {
      elizaLogger.error('Failed to initialize PayAI Client', error);
      throw error;
    }
  }

    /**
     * Initializes the seller agent functionality.
     * This includes loading the sellerServices.json file, updating the serviceAds database
     * if necessary, and periodically checking for updates to the sellerServices.json file.
     * @param runtime - The runtime context for the client.
     */
    private async initSellerAgentFunctionality(runtime: IAgentRuntime): Promise<void> {
      // load the services from the sellerServices.json if the file exists
      if (fs.existsSync(this.servicesConfigPath)) {
        const localServices = JSON.parse(fs.readFileSync(this.servicesConfigPath, 'utf-8'));
        this.servicesConfig = localServices;

        // check if the service already exists in the serviceAdsDB
        const localServiceAd = await this.prepareServiceAd(localServices, runtime);
        const fetchedServiceAds = await this.serviceAdsDB.query((doc: any) => {
          return (
            doc.message.identity === localServiceAd.message.identity &&
            doc.signature === localServiceAd.signature
          );
        });

        // if the service does not exist in the serviceAdsDB, add it
        if (fetchedServiceAds.length === 0) {
          elizaLogger.info('Local services does not match serviceAdsDB, adding to database');
          const result = await this.serviceAdsDB.put(localServiceAd);
          elizaLogger.info('Added new service to serviceAdsDB');
          elizaLogger.info("CID: ", CID.parse(result, base58btc).toString());
        } else {
          elizaLogger.info('Local services marches serviceAdsDB, no need to update the database');
        }
      }

      // start a periodic check for updates to the sellerServices.json file
      // in case the seller agent changes their local services
      await this.checkServicesConfig(runtime);
      this.servicesConfigInterval = setInterval(() => {
        this.checkServicesConfig(runtime).catch(error => {
          elizaLogger.error('Error in servicesConfigInterval', error);
        });
      }, 10000);
    }

  /**
   * Checks the sellerServices.json file for updates and updates the serviceAdsDB if necessary.
   */
  private async checkServicesConfig(runtime: IAgentRuntime): Promise<void> {
    try {
      // return early if the file does not exist
      if (!fs.existsSync(this.servicesConfigPath)) {
        return;
      }

      const fileContents = fs.readFileSync(this.servicesConfigPath, 'utf-8');
      const parsedContents = JSON.parse(fileContents);

      // contents have changed, update the serviceAdsDB
      if (JSON.stringify(this.servicesConfig) !== JSON.stringify(parsedContents)) {
        elizaLogger.info("sellerServices.json has changed");
        this.servicesConfig = parsedContents;
        const serviceAd = await this.prepareServiceAd(this.servicesConfig, runtime);
        const result = await this.serviceAdsDB.put(serviceAd);
        elizaLogger.info('Updated serviceAdsDB with new sellerServices.json contents');
      }
    } catch (error) {
      elizaLogger.error('Error checking sellerServices.json', error);
      console.error(error);
      throw error;
    }
  }

    /**
     * Prepares the sellerServices.json file to be published as a service ad on the PayAI network.
     * @param services - The sellerServices.json file contents.
     * @returns The service ad that will be published to IPFS.
     */
    private async prepareServiceAd(services: any, runtime: IAgentRuntime): Promise<any> {
      try {
        // get the user's solana private key from the runtime settings
        const userDefinedPrivateKey = runtime.getSetting('SOLANA_PRIVATE_KEY')
        const solanaKeypair = await this.getSolanaKeypair(userDefinedPrivateKey);
        const uint8ArrayPubkey = new Uint8Array(
            await crypto.subtle.exportKey('raw', solanaKeypair.publicKey)
        );

        // prepare message using the sellerServices.json file
        const message = {
            services: services.map((service: any, index: number) => {
                return {
                    id: index,
                    ...service
                };
            }),
            identity: bs58.encode(uint8ArrayPubkey)
        };

        const signature = await this.hashAndSign(message, solanaKeypair.privateKey);
        const formattedServices = {
            message,
            signature,
            _id: signature  // TODO make this more resilient in the future
        };

        return formattedServices;

    } catch (error) {
        elizaLogger.error('Error formatting sellerServices.json', error);
        console.error(error);
        throw error;
      }
    }

    /*
     * Prepares a buy offer to be published to the PayAI network.
     * @param offerDetails - The details of the offer.
     * @param runtime - The runtime context for the client.
     * @returns The buy offer that will be published to IPFS.
     */
    public async prepareBuyOffer(offerDetails: any, runtime: IAgentRuntime): Promise<any> {
        try {
            // get the user's solana private key from the runtime settings
            const userDefinedPrivateKey = runtime.getSetting('SOLANA_PRIVATE_KEY')
            const solanaKeypair = await this.getSolanaKeypair(userDefinedPrivateKey);

            // Sign the offer message
            const signature = await this.hashAndSign(offerDetails, solanaKeypair.privateKey);

            const buyOffer = {
                message: offerDetails,
                identity: bs58.encode(new Uint8Array(await crypto.subtle.exportKey('raw', solanaKeypair.publicKey))),
                signature: signature,
                _id: signature  // TODO make this more resilient in the future
            }

            return buyOffer;

        } catch (error) {
            elizaLogger.error('Error preparing buy offer', error);
            console.error(error);
            throw error;
        }
    }

    /**
     * Function to call the given orbitdb database's iterator and query using the find function.
     * Returns the results of the query.
     * This is different from the orbitdb query function in that it returns the entire entry, not just the entry's value.
     * @param db - The orbitdb database to query.
     * @param findFunction - The function to use to query the database.
     * @returns The results of the query.
     */
    public async queryOrbitDbReturningCompleteEntries(db: any, findFunction: any): Promise<any> {
        const results = []

        for await (const doc of db.iterator()) {
          if (findFunction(doc.value)) {
            results.push(doc)
          }
        }
        return results
    }


    /**
     * Derives the Solana Keypair from a private key.
     * @param base58PrivateKey - The Base58 encoded private key.
     * @returns The Solana Keypair.
     */
    public async getSolanaKeypair(base58PrivateKey: string): Promise<CryptoKeyPair> {
        // decode the base58 private key
        let secretKeyBytes = bs58.decode(base58PrivateKey);

        // if the length of the secret key bytes is 64, then take the first 32 bytes
        if (secretKeyBytes.length === 64) {
            secretKeyBytes = secretKeyBytes.slice(0, 32);
        }

        // create a Keypair from the secret key
        const { privateKey, publicKey } = await createKeyPairFromPrivateKeyBytes(secretKeyBytes);

        return { privateKey, publicKey };
    }

    /**
     * Hashes and signs a message using a Solana Keypair.
     * The message is serialized to a string before hashing.
     * The message is stripped of any whitespace before hashing.
     * The hashing algorithm used is SHA-256.
     * @param message - The message to hash and sign.
     * @param keypair - The Solana Keypair to use for signing.
     * @returns The Base58 encoded signature.
     */
    public async hashAndSign(message: any, privateKey: CryptoKey): Promise<string> {
        // serialize the message
        const serializedMessage = JSON.stringify(message);

        // hash the message
        const hash = createHash('sha256').update(serializedMessage.replace(/\s/g, '')).digest();

        // sign the hash
        const signedBytes = await signBytes(privateKey, hash);

        // encode the signature to base58
        const encodedSignature = bs58.encode(signedBytes);

        return encodedSignature;
    }

    /*
     * Get the CID of an OrbitDB hash.
     * @param hash - The OrbitDB entry's hash.
     * @returns The IPFS CID of the OrbitDB entry.
    */
    public getCIDFromOrbitDbHash(hash: string): string {
        // TODO return the CID once the PayAI entries are available from publicly accessible IPFS nodes
        // return CID.parse(hash, base58btc).toString();
        return hash;
    }

  /*
   * Close the OrbitDB databases.
   */
  public async closeDatabases(): Promise<void> {
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
      elizaLogger.error('Failed to close databases', error);
      throw error;
    }
  }

  /**
   * Starts the PayAI Client.
   * @param runtime - The runtime context for the client.
   */
  public async start(runtime: IAgentRuntime): Promise<void> {
    try {
      await this.initialize(runtime);
      elizaLogger.info('PayAI Client started');
    } catch (error) {
      elizaLogger.error('Error while starting PayAI Client', error);
      console.error(error);
      throw error;
    }
  }

  /**
   * Stops the PayAI Client.
   * @param runtime - The runtime context for the client.
   */
  public async stop(runtime: IAgentRuntime): Promise<void> {
    try {
      await this.closeDatabases();
      await this.orbitdb.stop();
      await this.ipfs.stop();
      elizaLogger.info('PayAI Client stopped');
    } catch (error) {
      elizaLogger.error('Error while stopping PayAI Client', error);
      throw error;
    }
  }
}

const payAIClient: Client = new PayAIClient();

export { payAIClient };
