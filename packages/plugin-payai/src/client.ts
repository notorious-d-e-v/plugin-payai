import type { Client, IAgentRuntime } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import { createHelia, Helia } from 'helia';
import { createLibp2p, Libp2p } from 'libp2p';
import { createOrbitDB, OrbitDB, IPFSAccessController } from '@orbitdb/core';
import { FsBlockstore } from 'blockstore-fs';
import { libp2pOptions } from './config/libp2p';
import { dataDir } from './datadir';
import bootstrapConfig from './config/bootstrap.json'


class PayAIClient implements Client {
  public libp2p: Libp2p | null = null;
  public ipfs: Helia | null = null;
  public orbitdb: OrbitDB | null = null;
  public updatesDB: any = null;
  public serviceAdsDB: any = null;
  public buyOffersDB: any = null;
  public agreementsDB: any = null;
  
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

      elizaLogger.info('PayAI Client initialized');
    } catch (error) {
      elizaLogger.error('Failed to initialize PayAI Client', error);
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
