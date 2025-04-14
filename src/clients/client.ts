import { type Client, IAgentRuntime } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import { createHelia, Helia } from 'helia';
import { createLibp2p, Libp2p, Libp2pOptions } from 'libp2p';
import { CID } from 'multiformats/cid';
import { base58btc } from 'multiformats/bases/base58';
import { createOrbitDB, OrbitDB, Database } from '@orbitdb/core';
import { FsBlockstore } from 'blockstore-fs';
import { LevelDatastore } from 'datastore-level'
import { libp2pOptions } from '../config/libp2p.ts';
import { dataDir } from '../datadir.ts';
import bootstrapConfig from '../config/bootstrap.json' assert { type: "json" };
import fs from 'fs';
import {
  getCIDFromOrbitDbHash,
  queryOrbitDbReturningCompleteEntries,
  prepareServiceAd,
  getAllDbEntriesWithCIDs,
  getBase58PublicKey,
  prepareMessageForHashing
} from '../utils.ts';
import { paymentClient } from '../payment.ts';

const {
    createHash,
  } = await import('node:crypto');

class PayAIClient implements Client {
  public libp2p: Libp2p | null = null;
  public ipfs: Helia | null = null;
  public orbitdb: OrbitDB | null = null;
  public updatesDB: Database | null = null;
  public serviceAdsDB: Database | null = null;
  public buyOffersDB: Database | null = null;
  public agreementsDB: Database | null = null;
  public fundedContractsDB: Database | null = null;
  private servicesConfigPath: string;
  public sellerServiceAdCID: string | null = null;

  constructor() {
    elizaLogger.debug('PayAI Client created');
  }

  /**
   * Initializes the PayAI Client by creating libp2p, Helia, and OrbitDB instances.
   */
  public async initialize(runtime: IAgentRuntime): Promise<void> {
    try {
      elizaLogger.info('Initializing PayAI Client');
      const agentDir = dataDir + '/' + runtime.character.name;

      // get the base58 encoded public key of the user's solana account
      const userPublicKey = await getBase58PublicKey(runtime);
      elizaLogger.info('User public key: ', userPublicKey);

      // initialize payment client
      await paymentClient.initialize(runtime);

      // create libp2p instance
      const libp2pDatastore: LevelDatastore = new LevelDatastore(agentDir + '/libp2p');
      const libp2pConfig: Libp2pOptions = Object.assign({}, libp2pOptions);
      libp2pConfig.datastore = libp2pDatastore;
      this.libp2p = await createLibp2p(libp2pConfig);

      // create ipfs instance
      const blockstore = new FsBlockstore(agentDir + '/ipfs');
      this.ipfs = await createHelia({ libp2p: this.libp2p, blockstore });

      // create orbitdb instance
      this.orbitdb = await createOrbitDB( {ipfs: this.ipfs, directory: agentDir});

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

      // open funded contracts database
      this.fundedContractsDB = await this.orbitdb.open(bootstrapConfig.databases.fundedContracts, { sync: true });
      this.fundedContractsDB.events.on('update', async (entry) => {
        elizaLogger.debug('payai funded contracts db: ', entry.payload.value);
      });

      // init seller agent checks
      this.servicesConfigPath = `${agentDir}/sellerServices.json`;
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
        this.setServicesConfig(localServices);

        // check if the service already exists in the serviceAdsDB
        const localServiceAd = await prepareServiceAd(localServices, runtime);
        const fetchedServiceAds = await queryOrbitDbReturningCompleteEntries(
            this.serviceAdsDB,
            (doc: any) => {
                return (
                    prepareMessageForHashing(doc.message) == prepareMessageForHashing(localServiceAd.message) &&
                    doc.signature === localServiceAd.signature
                );
            }
        );

        // if the service does not exist in the serviceAdsDB, add it
        if (fetchedServiceAds.length === 0) {
          elizaLogger.info('Local services does not match serviceAdsDB, adding to database');
          await this.publishPreparedServiceAd(localServiceAd);
        } else {
          this.sellerServiceAdCID = getCIDFromOrbitDbHash(fetchedServiceAds[0].hash);
          elizaLogger.info('Local services matches serviceAdsDB, no need to update the database');
        }
      }
    }

  /*
   * Sets the servicesConfig.
   * Should be called anytime the sellerServices.json file is updated.
   */
  private setServicesConfig(servicesConfig: any): void {
    this.servicesConfig = servicesConfig;
  }

  /*
   * Writes the services to the sellerServices.json file.
   * Updates the servicesConfig in memory.
   */
  public saveSellerServices(services: any): void {
    fs.writeFileSync(this.servicesConfigPath, services);
    this.setServicesConfig(services);
  }

  /*
   * Publishes a service ad to the PayAI network.
   * Updates the sellerServiceAdCID in memory.
   * @param serviceAd - The service ad to publish.
   * @returns The IPFS CID of the published service ad.
   */
  public async publishPreparedServiceAd(serviceAd: any): Promise<string> {
    try {
      // publish the ad
      const hash = await this.serviceAdsDB.put(serviceAd);
      
      // update the service ad cid in memory
      const cid = getCIDFromOrbitDbHash(hash);
      this.sellerServiceAdCID = cid;      
      
      elizaLogger.info('Published service ad to IPFS:', this.sellerServiceAdCID);
      return this.sellerServiceAdCID;
    }
    catch (error) {
      elizaLogger.error('Error publishing prepared service ad', error);
      throw error;
    }
  }

  /*
   * Function to get an OrbitDB entry using its hash.
   */
    public async getEntryFromHash(hash: string, db: any): Promise<any> {
        try {
            const entry = await db.log.get(hash);
            return entry;
        } catch (error) {
            elizaLogger.error('Error getting orbitdb entry from hash', error);
            throw error;
        }
    }

    /* Function to get an OrbitDB entry using its ipfs CID. */
    public async getEntryFromCID(cid: string, db: any): Promise<any> {
      const hash = CID.parse(cid).toString(base58btc);
      return this.getEntryFromHash(hash, db);
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
      await this.fundedContractsDB.close();
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