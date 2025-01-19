import {createLibp2p, type Libp2p} from "libp2p";
import {webSockets} from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import {webRTC} from "@libp2p/webrtc";
import {pubsubPeerDiscovery} from "@libp2p/pubsub-peer-discovery";
import {circuitRelayTransport} from "@libp2p/circuit-relay-v2";
import {noise} from "@chainsafe/libp2p-noise";
import {yamux} from "@chainsafe/libp2p-yamux";
import {bootstrap} from "@libp2p/bootstrap";
import {gossipsub, type GossipsubEvents} from "@chainsafe/libp2p-gossipsub";
import {identify, type Identify} from "@libp2p/identify";
import {DISCOVERY_PROTOCOL, MESSAGE_PROTOCOL} from "./constants.js";
import {Liquid, liquid} from "../service.js";
import {randomBytes} from "@libp2p/crypto"
import {generateKeyPair, generateKeyPairFromSeed} from "@libp2p/crypto/keys";
import {peerIdFromKeys} from "@libp2p/peer-id";
import type {PubSub} from "@libp2p/interface";
import { $seedBytes } from "./store.js";
import {receiveMessagesFromPeers} from "@/lib/liquid.ts";


 let libp2p: Libp2p<{ liquid: Liquid; pubsub: PubSub<GossipsubEvents>; identify: Identify; }>
export async function createBrowserNode(){
    if (libp2p) return libp2p

    // Load deterministicly
    const seedBytes = $seedBytes.get()
    if (seedBytes.length === 0) {
        $seedBytes.set(Array.from(randomBytes(32)))
    }
    const key = await generateKeyPairFromSeed("Ed25519", new Uint8Array(seedBytes))
    const peerId = await peerIdFromKeys(key.public.bytes, key.bytes)


    libp2p = await createLibp2p({
        peerId,
        addresses: {
            listen: [
                // 👇 Listen for webRTC connection
                '/webrtc',
            ],
        },
        transports: [
            webSockets({
                // Allow all WebSocket connections inclusing without TLS
                filter: filters.all,
            }),
            webRTC(),
            // // 👇 Required to create circuit relay reservations in order to hole punch browser-to-browser WebRTC connections
            circuitRelayTransport({
                discoverRelays: 1,
            }),
        ],
        connectionEncryption: [noise()],
        streamMuxers: [yamux()],
        connectionGater: {
            // Allow private addresses for local testing
            denyDialMultiaddr: async () => false,
        },
        peerDiscovery: [
            bootstrap({
                list: [
                    '/ip4/184.169.220.207/tcp/9001/ws/p2p/12D3KooWPmavaJXhPsi9JsWegWsPucNmJWNuxMmgRHjoHTAYQ4zG',
                    '/ip4/184.169.220.207/tcp/9003/wss/p2p/12D3KooWPmavaJXhPsi9JsWegWsPucNmJWNuxMmgRHjoHTAYQ4zG',
                    '/ip4/184.169.220.207/tcp/9002/p2p/12D3KooWPmavaJXhPsi9JsWegWsPucNmJWNuxMmgRHjoHTAYQ4zG'
                ],
            }),
            pubsubPeerDiscovery({
                interval: 2000,
                topics: [DISCOVERY_PROTOCOL],
            }),
        ],
        services: {
            liquid: liquid(),
            pubsub: gossipsub(),
            identify: identify(),
        },
    })

    receiveMessagesFromPeers(libp2p, MESSAGE_PROTOCOL)
    return libp2p
}
