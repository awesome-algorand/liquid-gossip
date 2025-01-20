import { useQuery } from "@tanstack/react-query";
import {createBrowserNode} from "@/libp2p.ts";
import {useEffect, useState} from "react";
import type {PeerId, PeerInfo} from "@libp2p/interface";

// TODO: Use Peer connections like useDataStore in liquid
// export function usePeer(addr: MultiaddrInput){
//     const {data: node, isLoading, isError} = useNode()
//     const query = useQuery({
//         queryKey: ["peer", addr?.toString()],
//         queryFn: ()=>node.dail,
//         enabled: node.data && addr,
//     })
//     return {...query, isError: query.isError || isError, isLoading: query.isLoading || isLoading}
// }

// TODO: Create proper hooks and context
export function usePeers(){
    const node = useNode()
    const peers = useState<PeerInfo[]>([])
    useEffect(()=>{
        if(!node) return;
        function peerDiscovered(evt : CustomEvent<PeerInfo>){
            console.log('Discovered %s', evt.detail.id.toString())
            // setDate(Date.now())
        }
        node.addEventListener('peer:discovery', peerDiscovered)
        function peerConnected(evt : CustomEvent<PeerId>){
            console.log('Connected %s', evt.detail.toString())
        }
        node.addEventListener('peer:connect', peerConnected)
        return () => {
            node.removeEventListener('peer:discovery', peerDiscovered)
            node.removeEventListener('peer:connect', peerConnected)
        }
    }, [node])

    return peers
}

// TODO: Create a proper integration or find alternative
export function useNode() {
    const query = useQuery({
        queryKey: ["node"],
        queryFn: async ()=>await createBrowserNode()
    })
    return typeof query.data === "undefined" ? null : query.data
}