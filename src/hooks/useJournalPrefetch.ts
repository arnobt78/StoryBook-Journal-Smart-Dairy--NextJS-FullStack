"use client";

/**
 * WALKTHROUGH — useJournalPrefetch
 *
 * Shelf hover optimization: prefetches Next.js route chunk + TanStack
 * `bookDetail` query so opening a journal feels instant.
 * Skips offline temp book ids (not yet on server).
 *
 * Lifecycle: stateless callback returned once; no effects — safe to call
 * from onMouseEnter without stale closures.
 */
/**
 * Prefetch journal route + TanStack bookDetail on shelf hover for instant open.
 */
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { isOfflineTempBookId } from "@/constants/offline";
import { fetchJournalBook } from "@/lib/journal-api";
import { queryKeys } from "@/lib/query-keys";

export function useJournalPrefetch() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const prefetchBook = useCallback(
    (bookId: string) => {
      if (!bookId || isOfflineTempBookId(bookId)) return;
      router.prefetch(`/journal/${bookId}`);
      void queryClient.prefetchQuery({
        queryKey: queryKeys.bookDetail(bookId),
        queryFn: () => fetchJournalBook(bookId),
        staleTime: 60_000,
      });
    },
    [queryClient, router],
  );

  return { prefetchBook };
}
