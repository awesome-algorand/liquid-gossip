"use client";

import React from "react";
import {Card, CardHeader, CardTitle, CardContent, CardDescription} from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Info} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {AddressList} from "@/components/address.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {useNode} from "@/hooks/use-node.ts";
import {QueryClientProvider} from "@tanstack/react-query";
import { useStore } from "@nanostores/react";
import {$queryClient} from "@/store.ts";

export const NodeCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
    const node = useNode()
    // TODO: Optimize Loading
    // if (!node) return <div ref={ref}> <Skeleton className="h-[438px] rounded-xl bg-primary/5"/></div>
    return (
        <Card className="w-full max-w-sm  mx-auto p-4" {...props} ref={ref}>
            <CardHeader>
                <CardTitle>Browser Node Information</CardTitle>
                <CardDescription className="truncate">{node?.peerId.toString() || "Loading"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="text-green-600">Online</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Connections:</span>
                    <span>{node?.getConnections().length}</span>
                </div>
                <Accordion type="single" collapsible data-state="open">
                    <AccordionItem value="item-1">
                        <AccordionTrigger><div className="flex justify-between">
                            <span className="font-medium">Proxy:</span>
                            <span>{node?.getMultiaddrs().length}</span>
                        </div></AccordionTrigger>
                        <AccordionContent className="space-y-2">
                            <ScrollArea className="h-64 p-4 border rounded">
                            <AddressList
                                label="Copy"
                                addresses={node?.getMultiaddrs().map((ma)=>ma.toString()) || []}
                                onClick={async (e, address)=>{
                                    await navigator.clipboard.writeText(address)
                                }}
                            />
                            </ScrollArea>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
})

export function NodeMenu() {
    const queryClient = useStore($queryClient)
    return (
        <QueryClientProvider client={queryClient}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><Info/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" asChild>
                    <NodeCard/>
            </DropdownMenuContent>
        </DropdownMenu>
        </QueryClientProvider>
    )
}