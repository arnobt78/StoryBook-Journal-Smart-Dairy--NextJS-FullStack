/**
 * WALKTHROUGH — journal-cache-notify.ts
 *
 * Single invalidation entry point after any journal mutation (online CRUD,
 * offline enqueue, or sync drain). Uses `journalSubtree` query key prefix
 * so shelf + all bookDetail queries refresh together.
 *
 * Offline: mark stale only (`refetchType: "none"`) — no doomed network calls.
 * Online: refetch active queries immediately for multi-tab feel.
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function notifyJournalCacheUpdated(queryClient: QueryClient): void {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  /* journalSubtree prefix invalidates booksList + all bookDetail queries */
  void queryClient.invalidateQueries({
    queryKey: queryKeys.journalSubtree(),
    refetchType: offline ? "none" : "active",
  });
}
