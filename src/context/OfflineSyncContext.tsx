"use client";

/**
 * WALKTHROUGH — OfflineSyncContext
 *
 * React context bridge: useOfflineSyncQueue runs once at app root
 * (OfflineSyncProvider in providers.tsx). Exposes:
 *   - pendingCount — IndexedDB queue length for nav badge
 *   - drainQueue — manual retry (also auto on `online`)
 *   - refreshCount — re-read count after enqueue (useAutoSave, shelf CRUD)
 *
 * useOfflineSync() throws if used outside provider — catches wiring mistakes.
 */
/**
 * Exposes offline sync queue state app-wide (pendingCount badge in DashboardNav).
 * Processor drains FIFO on `online` — see useOfflineSyncQueue.
 */
import { createContext, useContext } from "react";
import { useOfflineSyncQueue } from "@/hooks/useOfflineSyncQueue";

type OfflineSyncContextValue = {
  pendingCount: number;
  drainQueue: () => Promise<void>;
  refreshCount: () => Promise<void>;
};

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  /* Single drain processor instance for entire dashboard tree */
  const value = useOfflineSyncQueue();
  return (
    <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>
  );
}

export function useOfflineSync(): OfflineSyncContextValue {
  const ctx = useContext(OfflineSyncContext);
  if (!ctx) {
    throw new Error("useOfflineSync must be used within OfflineSyncProvider");
  }
  return ctx;
}
