/**
 * WALKTHROUGH — journal-cache-notify.ts
 *
 * **Single invalidation entry point** after any journal mutation (online CRUD,
 * offline enqueue, sync drain, SSE, auth). Never call raw
 * `invalidateQueries({ queryKey: queryKeys.journalSubtree() })` elsewhere.
 *
 * Uses `journalSubtree` prefix so shelf + all bookDetail queries refresh together.
 * Offline: `refetchType: "none"` — mark stale without doomed network calls.
 * Online: `refetchType: "active"` — refetch mounted queries immediately.
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

/** Invalidate journal subtree — awaitable for flows that need refetch-after. */
export function notifyJournalCacheUpdated(queryClient: QueryClient): Promise<void> {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return queryClient.invalidateQueries({
    queryKey: queryKeys.journalSubtree(),
    refetchType: offline ? "none" : "active",
  });
}

/**
 * Invalidate then run a caller-supplied refetch (e.g. fetchQuery for bookDetail).
 * Used when UI must read fresh entry ids immediately after create/delete.
 */
export async function notifyJournalCacheUpdatedAndRefetch<T>(
  queryClient: QueryClient,
  refetch: () => Promise<T>,
): Promise<T> {
  await notifyJournalCacheUpdated(queryClient);
  return refetch();
}
