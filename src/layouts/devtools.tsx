import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {QueryClientProvider} from "@tanstack/react-query";
import { useStore } from "@nanostores/react";
import {$queryClient} from "@/store.ts";

export function DevTools() {
    const queryClient = useStore($queryClient)
    return (
        <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}