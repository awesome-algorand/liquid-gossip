import {pipe} from "it-pipe";

/**
 * Handle the Stream Data for the protocol
 * @param {import('@libp2p/interface').IncomingStreamData} data
 * @returns {Promise<void>}
 */
export async function messageHandler(data){
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

    // pipe(async function * () {
    //     // the stream input must be bytes
    //     yield new TextEncoder().encode('Get rekd, this is a bot')
    // }, stream)
}


/**
 *
 * @param {import('@libp2p/interface').Stream} stream the connection stream
 * @param {string} message
 * @returns {Promise<void>}
 */
async function send(stream, message) {
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


export class Liquid {
    // TODO: Event Emitter/Observables?
    constructor(components){
        // TODO: properly use components
        this.components = components;
    }
    send(stream, message){
        return send(stream, message)
    }
}
export function liquid (){
    return (components)=>new Liquid(components)
}