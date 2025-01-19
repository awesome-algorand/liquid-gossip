import type {Libp2p} from "libp2p";
import type {PubSub, Stream} from "@libp2p/interface";
import type {GossipsubEvents} from "@chainsafe/libp2p-gossipsub";
import type {Identify} from "@libp2p/identify";
import {pipe} from "it-pipe";
import {$messages, addMessage} from "@/store.ts";

export async function receiveMessagesFromPeers(node :  Libp2p<{pubsub: PubSub<GossipsubEvents>, identify: Identify }>, protocol: string) {
    try {
        // Set up a handler for the specified protocol
       await node.handle(protocol, async ({ stream, connection }) => {
            const remotePeerId = connection.remotePeer.toString();
            console.log(`Received connection from: ${remotePeerId}`);

            // Read incoming data from the stream
            let string = ''
            const decoder = new TextDecoder()
            for await (const chunk of stream.source) {
                string += decoder.decode(chunk.subarray())
                console.log(`Message from ${remotePeerId}: ${chunk.toString()}`, chunk);
            }
            const messages = $messages.get()
            addMessage({
                index: messages.length - 1,
                sender: remotePeerId,
                recipient: node.peerId.toString(),
                content: string
            })
            console.log(string)
        });

        console.log(`Listening for messages on protocol: ${protocol}`);
    } catch (err) {
        console.error('Failed to set up message reception:', err);
    }
}

// Custom function to send a message to a specific peer
async function sendMessage(stream: Stream, message: string) {
    try {
        const output = await pipe(
            async function * () {
                // the stream input must be bytes
                yield new TextEncoder().encode(message)
            },
            stream,
            async (source) => {
                let string = ''
                const decoder = new TextDecoder()

                for await (const buf of source) {
                    // buf is a `Uint8ArrayList` so we must turn it into a `Uint8Array`
                    // before decoding it
                    string += decoder.decode(buf.subarray())
                }

                return string
            }
        )
    } catch (err) {
        console.error('Failed to send message:', err);
    }
}