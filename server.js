import fs from 'fs'
import https from 'https'

import {createLibp2p} from 'libp2p'

import {autoNAT} from '@libp2p/autonat'

import { loadOrCreateSelfKey } from '@libp2p/config'
import {identify, identifyPush} from '@libp2p/identify'
import { WebSocketsSecure } from '@multiformats/multiaddr-matcher'
import {generateKeyPairFromSeed} from "@libp2p/crypto/keys";
import {peerIdFromPrivateKey} from "@libp2p/peer-id";


import {noise} from '@chainsafe/libp2p-noise'
import {yamux} from '@chainsafe/libp2p-yamux'
import {gossipsub} from '@chainsafe/libp2p-gossipsub'

import { autoTLS } from '@libp2p/auto-tls'
import {keychain} from "@libp2p/keychain";
import {uPnPNAT} from "@libp2p/upnp-nat";


import {tcp} from '@libp2p/tcp'
import {webSockets} from '@libp2p/websockets'
import {circuitRelayServer} from '@libp2p/circuit-relay-v2'

import { LevelDatastore } from 'datastore-level'

const datastore = new LevelDatastore('./db')
await datastore.open()
const privateKey = await loadOrCreateSelfKey(datastore)

import {DISCOVERY_PROTOCOL, MESSAGE_PROTOCOL} from './src/constants.js'
import {liquid} from "./service.js";

// TODO: Import seed
const kp = [32, 131, 177, 47, 115, 213, 166, 145, 111, 140, 36, 73, 144, 83, 221, 248, 183, 157, 57, 90, 240, 221, 74, 59, 216, 239, 246, 36, 162, 254, 163, 41]
const key = await generateKeyPairFromSeed("Ed25519", new Uint8Array(kp))
const peerId = peerIdFromPrivateKey(key)

const publicIp = process.env.PUBLIC_IP || '184.169.220.207'
const port = typeof process.env.PORT != "undefined" ? parseInt(process.env.PORT) : 9001
const hostname = process.env.RENDER_EXTERNAL_HOSTNAME || 'liquid-gossip.onrender.com'

// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/p2p.skeller.io/fullchain.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/p2p.skeller.io/fullchain.pem')
// };

const libp2p = await createLibp2p({
    datastore,
    privateKey,
    // peerId,
    addresses: {
        listen: [
            `/ip4/0.0.0.0/tcp/9001/ws`,
            `/ip4/0.0.0.0/tcp/9002`,
        ],
        appendAnnounce: [
            `/ip4/${publicIp}/tcp/9001/ws`,
            `/ip4/${publicIp}/tcp/9002`,
        ]
        // announce: [
        //     `/ip4/${publicIp}/tcp/${port}/ws`,
        //     // TODO: `/dnsaddr/${hostname}/tcp/443/ws`,
        // ],
    },
    transports: [
        webSockets(),
        tcp(),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
        denyDialMultiaddr: async () => false,
    },
    services: {
        liquid: liquid(),
        autoTLS: autoTLS(),
        identify: identify(),
        identifyPush: identifyPush(),
        keychain: keychain(),
        uPnPNAT: uPnPNAT(),
        autoNat: autoNAT(),
        relay: circuitRelayServer(),
        pubsub: gossipsub(),

    },
})
libp2p.services.pubsub.subscribe(DISCOVERY_PROTOCOL)
libp2p.handle(MESSAGE_PROTOCOL, async (data)=>{
    const { stream, connection } = data
    const remotePeerId = connection.remotePeer.toString();
    console.log(`Received connection from: ${remotePeerId}`);

    // Read incoming data from the stream
    let string = ''
    const decoder = new TextDecoder()
    for await (const chunk of stream.source) {
        string += decoder.decode(chunk.subarray())
        console.log(`Message from ${remotePeerId}`);
    }
    // addMessage(string)
    console.log(string)
})

console.log('ID: ', libp2p.peerId.toString())
console.log('Announced: ', libp2p.getMultiaddrs().map(ma => ma.toString()))