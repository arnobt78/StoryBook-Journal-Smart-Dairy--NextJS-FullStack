/**
 * @file lib/query-keys.ts
 *
 * WALKTHROUGH — TanStack Query cache key registry
 * ─────────────────────────────────────────────
 * Every `useQuery` and `invalidateQueries` MUST use these factories so cache hits
 * and invalidations target the same entries across shelf, reader, API status, etc.
 *
 * Invalidation entry point: `notifyJournalCacheUpdated` in journal-cache-notify.ts
 * (never call `invalidateQueries({ queryKey: journalSubtree() })` elsewhere).
 */
/**
 * Central TanStack Query keys for journal data.
 * Keeping keys in one module avoids typos and ensures invalidateQueries
 * targets the same cache entries that useQuery uses across pages.
 */
export const queryKeys = {
  /**
   * Prefix key: TanStack Query treats this as a subtree, so invalidating
   * `["journal"]` refetches every shelf list and open-book payload without
   * listing individual `bookId`s — used after auth changes and broad CRUD.
   */
  journalSubtree: () => ["journal"] as const,

  /** GET /api/books — shelf list + entry counts */
  booksList: () => ["journal", "books"] as const,
  /** GET /api/books/[bookId] — single book with entries (tags parsed) */
  bookDetail: (bookId: string) => ["journal", "book", bookId] as const,

  /** GET /api/status — dependency health + aggregate stats */
  apiStatus: () => ["api", "status"] as const,
  /** GET /api/openapi — route catalog for documentation UI */
  apiOpenApi: () => ["api", "openapi"] as const,
};
