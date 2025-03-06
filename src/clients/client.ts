import { type Client, IAgentRuntime } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import { createHelia, Helia } from 'helia';
import { createLibp2p, Libp2p, Libp2pOptions } from 'libp2p';
import { CID } from 'multiformats/cid';
import { base58btc } from 'multiformats/bases/base58';
import { createOrbitDB, OrbitDB, IPFSAccessController } from '@orbitdb/core';
import { FsBlockstore } from 'blockstore-fs';
import { LevelDatastore } from 'datastore-level'
import { libp2pOptions } from '../config/libp2p.ts';
import { dataDir } from '../datadir.ts';
import bootstrapConfig from '../config/bootstrap.json' assert { type: "json" };
import fs from 'fs';
import { getCIDFromOrbitDbHash, queryOrbitDbReturningCompleteEntries, prepareServiceAd } from '../utils.ts';

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
  private servicesConfigPath: string;
  private servicesConfigInterval: NodeJS.Timeout | null = null;
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

      // write to the updates database
      await this.updatesDB.add(`Agent ${runtime.character.name} joined the payai network`);

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
        this.servicesConfig = localServices;

        // check if the service already exists in the serviceAdsDB
        const localServiceAd = await prepareServiceAd(localServices, runtime);
        const fetchedServiceAds = await queryOrbitDbReturningCompleteEntries(
            this.serviceAdsDB,
            (doc: any) => {
                return (
                    doc.message.toString() === localServiceAd.message.toString() &&
                    doc.signature === localServiceAd.signature
                );
            }
        );

        // if the service does not exist in the serviceAdsDB, add it
        if (fetchedServiceAds.length === 0) {
          elizaLogger.info('Local services does not match serviceAdsDB, adding to database');
          const result = await this.serviceAdsDB.put(localServiceAd);
          this.sellerServiceAdCID = getCIDFromOrbitDbHash(result);
          elizaLogger.info('Added new service to serviceAdsDB');
          elizaLogger.info("CID: ", CID.parse(result, base58btc).toString());
        } else {
          this.sellerServiceAdCID = getCIDFromOrbitDbHash(fetchedServiceAds[0].hash);
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

  private readAndParseServicesConfig(): any {
    try {
        const fileContents = fs.readFileSync(this.servicesConfigPath, 'utf-8');
        return JSON.parse(fileContents);
        }
    catch (error) {
        elizaLogger.error('Error reading sellerServices.json', error);
        console.error(error);
        throw error;
    }
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

      // read and parse the contents of the sellerServices.json file
      const parsedContents = this.readAndParseServicesConfig();

      // contents have changed, update the serviceAdsDB
      if (JSON.stringify(this.servicesConfig) !== JSON.stringify(parsedContents)) {
        elizaLogger.info("sellerServices.json has changed");
        this.servicesConfig = parsedContents;
        const serviceAd = await prepareServiceAd(this.servicesConfig, runtime);
        const result = await this.serviceAdsDB.put(serviceAd);
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(result);
        elizaLogger.info('Updated serviceAdsDB with new sellerServices.json contents');
      }
    } catch (error) {
      elizaLogger.error('Error checking sellerServices.json', error);
      console.error(error);
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

    // TODO this will change once PayAI content is available from publicly accessible IPFS nodes
    /* Function to get an OrbitDB entry using its ipfs CID. */
    public async getEntryFromCID(cid: string, db: any): Promise<any> {
        return this.getEntryFromHash(cid, db);
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
