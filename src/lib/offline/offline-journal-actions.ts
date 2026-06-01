/**
 * WALKTHROUGH — offline-journal-actions.ts
 *
 * Orchestrates offline save in three steps (every enqueue* function):
 *   1) Optimistic TanStack patch (journal-cache-optimistic)
 *   2) notifyJournalCacheUpdated (stale/refetch journalSubtree)
 *   3) enqueueSyncItem → IndexedDB sync-queue
 *
 * Callers pass refreshPendingCount from OfflineSyncContext for badge update.
 * isBrowserOffline / isOfflineOrNetworkError gate useAutoSave + shelf CRUD.
 */
/**
 * Shared offline enqueue + optimistic cache for journal mutations.
 * Callers refresh pendingCount via OfflineSyncContext after enqueue.
 */
import type { QueryClient } from "@tanstack/react-query";
import type { CreateEntryInput, UpdateEntryInput } from "@/lib/validations";
import type { BookFormValues } from "@/types/book-form";
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";
import {
  applyOptimisticBookPatch,
  applyOptimisticEntryPatch,
  applyOptimisticNewBook,
  applyOptimisticNewEntry,
} from "@/lib/journal-cache-optimistic";
import {
  enqueueSyncItem,
  isOfflineOrNetworkError,
  newQueueId,
} from "@/lib/offline/sync-queue-store";

export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

export async function enqueuePatchEntryOffline(params: {
  queryClient: QueryClient;
  bookId: string;
  entryId: string;
  payload: UpdateEntryInput;
  refreshPendingCount?: () => Promise<void>;
}): Promise<void> {
  /* optimistic UI → stale mark → queue PATCH for drain on online */
  applyOptimisticEntryPatch(params.queryClient, params.bookId, params.entryId, params.payload);
  notifyJournalCacheUpdated(params.queryClient);
  await enqueueSyncItem({
    id: newQueueId(),
    type: "patchEntry",
    entryId: params.entryId,
    payload: params.payload,
    createdAt: Date.now(),
  });
  await params.refreshPendingCount?.();
}

export async function enqueuePostEntryOffline(params: {
  queryClient: QueryClient;
  bookId: string;
  payload: CreateEntryInput;
  refreshPendingCount?: () => Promise<void>;
}): Promise<string> {
  const tempId = applyOptimisticNewEntry(params.queryClient, params.bookId, params.payload);
  notifyJournalCacheUpdated(params.queryClient);
  await enqueueSyncItem({
    id: newQueueId(),
    type: "postEntry",
    payload: params.payload,
    clientTempId: tempId,
    createdAt: Date.now(),
  });
  await params.refreshPendingCount?.();
  return tempId;
}

export async function enqueuePatchBookOffline(params: {
  queryClient: QueryClient;
  bookId: string;
  payload: Partial<BookFormValues>;
  refreshPendingCount?: () => Promise<void>;
}): Promise<void> {
  applyOptimisticBookPatch(params.queryClient, params.bookId, params.payload);
  notifyJournalCacheUpdated(params.queryClient);
  await enqueueSyncItem({
    id: newQueueId(),
    type: "patchBook",
    bookId: params.bookId,
    payload: params.payload,
    createdAt: Date.now(),
  });
  await params.refreshPendingCount?.();
}

export async function enqueuePostBookOffline(params: {
  queryClient: QueryClient;
  payload: BookFormValues;
  refreshPendingCount?: () => Promise<void>;
}): Promise<string> {
  const tempId = applyOptimisticNewBook(params.queryClient, params.payload);
  notifyJournalCacheUpdated(params.queryClient);
  await enqueueSyncItem({
    id: newQueueId(),
    type: "postBook",
    payload: params.payload,
    clientTempBookId: tempId,
    createdAt: Date.now(),
  });
  await params.refreshPendingCount?.();
  return tempId;
}

export { isOfflineOrNetworkError };
