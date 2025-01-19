import { atom } from "nanostores";
import { persistentAtom } from '@nanostores/persistent'
import { QueryClient } from '@tanstack/react-query';

export const $queryClient = atom(new QueryClient())
export const $lastConnection = persistentAtom<string>('liquid-chat-peer-id', "/ip4/127.0.0.1/tcp/9001/ws/p2p/12D3KooWPmavaJXhPsi9JsWegWsPucNmJWNuxMmgRHjoHTAYQ4zG", {
    encode: JSON.stringify,
    decode: JSON.parse,
})
export const $seedBytes = persistentAtom<number[]>('liquid-chat-seed', [], {
    encode: JSON.stringify,
    decode: (encoded)=>JSON.parse(encoded),
})
export type Message = {
    index: number,
    sender: string,
    recipient: string,
    content: string,
}
export const $messages = atom<Message[]>([])
export function addMessage(message: Message) {
    $messages.set([...$messages.get(), message]);
}