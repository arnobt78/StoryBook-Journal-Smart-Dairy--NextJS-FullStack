"use client";

/**
 * Client-side providers tree.
 * OfflineSyncProvider drains IndexedDB queue on `online` and exposes pendingCount globally.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { useState } from "react";
import { OfflineSyncProvider } from "@/context/OfflineSyncContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <OfflineSyncProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "rgba(35,14,3,.96)",
                border: "1px solid rgba(255,160,60,.15)",
                color: "rgba(255,200,140,.9)",
                fontFamily: "'Lora', serif",
                fontSize: "13px",
              },
            }}
          />
        </OfflineSyncProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
