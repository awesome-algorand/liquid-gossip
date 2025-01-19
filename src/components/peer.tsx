"use client";

import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {AddressList} from "@/components/address.tsx";
import {protocols} from "@multiformats/multiaddr";
import {$lastConnection, $queryClient} from '@/store';
import {Circuit} from "@multiformats/multiaddr-matcher";
import type {PeerId, PeerInfo} from "@libp2p/interface";
import {useNode, usePeers} from "@/hooks/use-node.ts";
import {QueryClientProvider} from "@tanstack/react-query";
import { useStore } from "@nanostores/react";

export const PeerCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) =>{
   const node = useNode()
    const peers = usePeers()
   const {addresses, relay} = useMemo(()=>{
       if(!node) return {addresses: [], relay: "loading"}
       const relayPeers = node
           .getMultiaddrs()
           .filter((ma) => Circuit.exactMatch(ma))
           .map((ma) => {
           return ma
               .stringTuples()
               .filter(([name, _]) => name === protocols('p2p').code)
               .map(([_, value]) => value)[0]
       })
       if (relayPeers.length === 0) {
           return {addresses: [], relay: undefined}
       }
       const addresses = node
           .getPeers()
           .filter((peer)=>{
               return !relayPeers.includes(peer.toString())
           })
           .map((peer) => {
               const peerConnections = node.getConnections(peer)
               console.log(peerConnections)
               return `${peerConnections[0].remoteAddr.toString()}`
           })

       return {addresses, relay: relayPeers[0]}
   }, [node])
     return (
         <Card className="w-full max-w-lg mx-auto p-4" ref={ref} {...props}>
             <CardHeader>
                 <CardTitle>Peers</CardTitle>
                 <CardDescription className="truncate">Relay: {relay}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-2">
                 <AddressList label="Set" addresses={addresses} onClick={(e, address)=>{
                     $lastConnection.set(address)
                 }}/>
             </CardContent>
         </Card>
     )
    })

export function PeerApp() {
    const queryClient = useStore($queryClient)
    return (
        <QueryClientProvider client={queryClient}>
            <PeerCard/>
        </QueryClientProvider>
    )
}