import { type Client, IAgentRuntime } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import { createHelia, Helia } from 'helia';
import { createLibp2p, Libp2p } from 'libp2p';
import { CID } from 'multiformats/cid';
import { base58btc } from 'multiformats/bases/base58';
import { createOrbitDB, OrbitDB, IPFSAccessController } from '@orbitdb/core';
import { FsBlockstore } from 'blockstore-fs';
import { libp2pOptions } from './config/libp2p';
import { dataDir, sellerServicesFile } from './datadir';
import bootstrapConfig from './config/bootstrap.json'
import fs from 'fs';
import { getSolanaKeypair, hashAndSign, getCIDFromOrbitDbHash, prepareBuyOffer, queryOrbitDbReturningCompleteEntries, prepareServiceAd } from './utils';

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
        const localServiceAd = await prepareServiceAd(localServices, runtime);
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
        const serviceAd = await prepareServiceAd(this.servicesConfig, runtime);
        const result = await this.serviceAdsDB.put(serviceAd);
        elizaLogger.info('Updated serviceAdsDB with new sellerServices.json contents');
      }
    } catch (error) {
      elizaLogger.error('Error checking sellerServices.json', error);
      console.error(error);
      throw error;
    }
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
