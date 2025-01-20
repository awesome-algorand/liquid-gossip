import {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {$messages, $lastConnection, $queryClient, addMessage, type Message} from "@/store.ts";
import {useStore} from "@nanostores/react";
import {MESSAGE_PROTOCOL} from "@/constants";
import {multiaddr} from "@multiformats/multiaddr";
import {QueryClientProvider} from "@tanstack/react-query";
import {useNode} from "@/hooks/use-node.ts";

export const ChatSkeleton = () => {

    return (
        //rounded-xl border bg-card text-card-foreground shadow w-full max-w-lg mx-auto p-4
        <div className="w-full max-w-xl mx-auto h-full relative">
            <Skeleton className="h-[438px] rounded-xl bg-primary/5" />
            <div className="absolute top-0 h-64 p-4 w-full p-6">
                <div className="flex flex-col space-y-1.5 p-6">
                    <Skeleton className="h-4 w-[25px]" />
                </div>
                <div className="p-6 pt-0 mt-0">
                <Skeleton className="h-64 rounded-xl p-6" />
                </div>
                <div className="p-6 pt-0 flex items-center gap-2">
                    <Skeleton className="h-9 w-full" />
                </div>
            </div>
        </div>
    )
}

export const Chat = () => {
    const node = useNode()
    const recipientString = useStore($lastConnection)
    const messages = useStore($messages)
    const recipientAddress = multiaddr(recipientString)
    const peerId = node ? node.peerId.toString() : "invalid"
    const recipient = useMemo(()=>{
        return recipientAddress.getPeerId()
    }, [recipientAddress])
    const filteredChat = messages
        .filter((message) => {
            return (message.recipient === recipient && message.sender === peerId) ||
                (message.recipient === peerId && message.sender === recipient)
        })
    const [input, setInput] = useState("");

    const handleSendMessage = async () => {
        if(!node) return;
        if (!input.trim()) return;
        if (!recipient) return;
        const newMessage: Message = {
            index: messages.length + 1,
            sender: peerId,
            recipient,
            content: input,
        };
        const stream = await node.dialProtocol(recipientAddress, MESSAGE_PROTOCOL)
        node.services.liquid.send(stream, input)
        addMessage(newMessage);
        setInput("");
    };

    if(!node) {
        return <ChatSkeleton/>
    }
    return (
        <Card className="w-full max-w-xl mx-auto p-4">
            <CardHeader>
                <CardTitle className="truncate">{recipientString}</CardTitle>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-64 space-y-4 p-4 border rounded">
                    {filteredChat.map((message) => (
                        <div
                            key={message.index}
                            className={`flex ${
                                message.sender === peerId ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-lg ${
                                    message.sender === peerId
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-black"
                                }`}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </CardContent>

            <CardFooter className="flex items-center gap-2">
                <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={handleSendMessage}>Send</Button>
            </CardFooter>
        </Card>
    );
};

export function ChatApp() {
    const queryClient = useStore($queryClient)
    return (
        <QueryClientProvider client={queryClient}>
            <Chat/>
        </QueryClientProvider>
    )
}