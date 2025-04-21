import { identify, identifyPush } from '@libp2p/identify'
import { bootstrap } from "@libp2p/bootstrap";
import { mdns } from "@libp2p/mdns";
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { Libp2pOptions } from 'libp2p'
import bootstrapConfig from './bootstrap.json'


/**
 * A basic Libp2p configuration for Node.js nodes.
 */
const libp2pOptions: Libp2pOptions = {
  peerDiscovery: [
    bootstrap({
      list: bootstrapConfig.addresses
    }),
    mdns()
  ],
  addresses: {
    listen: ['/ip4/0.0.0.0/tcp/4206', '/ip4/0.0.0.0/tcp/4207/ws']
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
}

export { libp2pOptions }
