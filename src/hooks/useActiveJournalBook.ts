/**
 * @file hooks/useActiveJournalBook.ts
 *
 * WALKTHROUGH — Resolve open book from URL + TanStack cache
 * ─────────────────────────────────────────────────────────
 * Parses `/journal/[bookId]`; fetches bookDetail only when cache cold.
 * Powers CommandPalette theme cycle and journal-scoped actions.
 */
"use client";

/**
 * Resolves the open journal book from the URL + TanStack cache (no extra fetch).
 * Used by CommandPalette for theme-cycle and journal-scoped actions.
 */
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJournalBook } from "@/lib/journal-api";
import type { JournalBook, JournalEntry } from "@/types";

const JOURNAL_PATH = /^\/journal\/([^/]+)/;

export function useActiveJournalBook() {
  const pathname = usePathname() ?? "";
  const match = pathname.match(JOURNAL_PATH);
  const bookId = match?.[1] ?? null;
  const isOnJournalPage = Boolean(bookId);

  const { data: book } = useQuery({
    queryKey: bookId ? queryKeys.bookDetail(bookId) : ["journal", "book", "none"],
    queryFn: () => fetchJournalBook(bookId!),
    enabled: Boolean(bookId),
  });

  return {
    bookId,
    book: book as (JournalBook & { entries: JournalEntry[] }) | undefined,
    isOnJournalPage,
  };
}
