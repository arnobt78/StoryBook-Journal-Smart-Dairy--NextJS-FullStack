/**
 * Marks journal queries stale / refetches when online — keeps all pages in sync after offline writes.
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function notifyJournalCacheUpdated(queryClient: QueryClient): void {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  void queryClient.invalidateQueries({
    queryKey: queryKeys.journalSubtree(),
    refetchType: offline ? "none" : "active",
  });
}
