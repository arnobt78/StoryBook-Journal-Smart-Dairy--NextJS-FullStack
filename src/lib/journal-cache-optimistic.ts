/**
 * WALKTHROUGH — journal-cache-optimistic.ts
 *
 * Optimistic TanStack Query cache patches for offline saves.
 * Keeps shelf + reader UI in sync immediately without waiting for network sync.
 *
 * Flow when user saves offline:
 *   1) setQueryData on bookDetail / booksList (instant UI)
 *   2) enqueueSyncItem in sync-queue-store
 *   3) After drain: replaceOptimistic*Id swaps temp → real cuid
 *
 * Temp ids use OFFLINE_ID_PREFIX so PATCH can defer until CREATE syncs.
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { CreateEntryInput, UpdateEntryInput } from "@/lib/validations";
import { formatEntryDate, readingTime, wordCount } from "@/lib/utils";
import type { JournalBook, JournalEntry } from "@/types";
import type { BookFormValues } from "@/types/book-form";
import { OFFLINE_ID_PREFIX } from "@/constants/offline";

type BookWithEntries = JournalBook & { entries: JournalEntry[] };
type ShelfBook = JournalBook & { _count?: { entries: number } };

/** Patch one entry in bookDetail cache — mirrors PATCH payload fields */
export function applyOptimisticEntryPatch(
  queryClient: QueryClient,
  bookId: string,
  entryId: string,
  payload: UpdateEntryInput,
): void {
  queryClient.setQueryData<BookWithEntries>(queryKeys.bookDetail(bookId), (old) => {
    if (!old) return old;
    return {
      ...old,
      entries: old.entries.map((entry) => {
        if (entry.id !== entryId) return entry;
        const content = payload.content ?? entry.content;
        const wc = payload.content !== undefined ? wordCount(content) : entry.wordCount;
        return {
          ...entry,
          title: payload.title ?? entry.title,
          content,
          mood: payload.mood ?? entry.mood,
          weather: payload.weather ?? entry.weather,
          location: payload.location ?? entry.location,
          tags: payload.tags ?? entry.tags,
          wordCount: wc,
          readingTime: payload.content !== undefined ? readingTime(wc) : entry.readingTime,
          excerpt: payload.content !== undefined ? content.slice(0, 200) : entry.excerpt,
          updatedAt: new Date(),
        };
      }),
    };
  });
}

/** Patch book metadata in both bookDetail and shelf list caches */
export function applyOptimisticBookPatch(
  queryClient: QueryClient,
  bookId: string,
  payload: Partial<BookFormValues>,
): void {
  queryClient.setQueryData<BookWithEntries>(queryKeys.bookDetail(bookId), (old) =>
    old ? { ...old, ...payload } : old,
  );

  queryClient.setQueryData<ShelfBook[]>(queryKeys.booksList(), (old) => {
    if (!old) return old;
    return old.map((book) => (book.id === bookId ? { ...book, ...payload } : book));
  });
}

/** Returns a temporary client id for offline-created entries until sync replaces cache via invalidation. */
export function applyOptimisticNewEntry(
  queryClient: QueryClient,
  bookId: string,
  payload: CreateEntryInput,
): string {
  const tempId = `${OFFLINE_ID_PREFIX.entry}${Date.now()}`;
  const { entryDate, weekday } = formatEntryDate();
  const content = payload.content ?? "";
  const wc = wordCount(content);

  const entry: JournalEntry = {
    id: tempId,
    userId: "",
    bookId,
    title: payload.title ?? "New Entry",
    slug: "offline-entry",
    content,
    excerpt: content.slice(0, 200),
    mood: payload.mood ?? "✨",
    weather: payload.weather ?? "☀️",
    location: payload.location ?? null,
    tags: payload.tags ?? [],
    wordCount: wc,
    readingTime: readingTime(wc),
    isFavorite: false,
    isArchived: false,
    entryDate,
    weekday,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  queryClient.setQueryData<BookWithEntries>(queryKeys.bookDetail(bookId), (old) => {
    if (!old) return old;
    return { ...old, entries: [...old.entries, entry] };
  });

  queryClient.setQueryData<ShelfBook[]>(queryKeys.booksList(), (old) => {
    if (!old) return old;
    return old.map((book) =>
      book.id === bookId
        ? {
            ...book,
            _count: { entries: (book._count?.entries ?? 0) + 1 },
          }
        : book,
    );
  });

  return tempId;
}

/** Optimistic shelf + reader seed for offline book CREATE (starter entry included). */
export function applyOptimisticNewBook(
  queryClient: QueryClient,
  payload: BookFormValues,
): string {
  const tempId = `${OFFLINE_ID_PREFIX.book}${Date.now()}`;
  const now = new Date();
  const { entryDate, weekday } = formatEntryDate();
  const starterEntryId = `${OFFLINE_ID_PREFIX.entry}${Date.now()}-starter`;

  const book: ShelfBook = {
    id: tempId,
    userId: "",
    title: payload.title,
    slug: "offline-book",
    coverColor: payload.coverColor,
    coverEmoji: payload.coverEmoji,
    theme: "warm-paper",
    description: payload.description || null,
    visibility: "private",
    createdAt: now,
    updatedAt: now,
    _count: { entries: 1 },
  };

  const starterEntry: JournalEntry = {
    id: starterEntryId,
    userId: "",
    bookId: tempId,
    title: "New Entry",
    slug: "offline-entry",
    content: "",
    excerpt: "",
    mood: "✨",
    weather: "☀️",
    location: null,
    tags: [],
    wordCount: 0,
    readingTime: 1,
    isFavorite: false,
    isArchived: false,
    entryDate,
    weekday,
    createdAt: now,
    updatedAt: now,
  };

  queryClient.setQueryData<ShelfBook[]>(queryKeys.booksList(), (old) =>
    old ? [book, ...old] : [book],
  );

  queryClient.setQueryData<BookWithEntries>(queryKeys.bookDetail(tempId), {
    ...book,
    entries: [starterEntry],
  });

  return tempId;
}

/** Swap temp entry id in bookDetail cache after postEntry sync — preserves reader focus. */
export function replaceOptimisticEntryId(
  queryClient: QueryClient,
  bookId: string,
  tempEntryId: string,
  realEntryId: string,
): void {
  queryClient.setQueryData<BookWithEntries>(queryKeys.bookDetail(bookId), (old) => {
    if (!old) return old;
    return {
      ...old,
      entries: old.entries.map((entry) =>
        entry.id === tempEntryId ? { ...entry, id: realEntryId } : entry,
      ),
    };
  });
}

/** Swap temp book id in shelf + bookDetail cache after postBook sync. */
export function replaceOptimisticBookId(
  queryClient: QueryClient,
  tempBookId: string,
  realBookId: string,
): void {
  const detail = queryClient.getQueryData<BookWithEntries>(queryKeys.bookDetail(tempBookId));

  queryClient.setQueryData<ShelfBook[]>(queryKeys.booksList(), (old) => {
    if (!old) return old;
    return old.map((book) => (book.id === tempBookId ? { ...book, id: realBookId } : book));
  });

  if (detail) {
    queryClient.setQueryData<BookWithEntries>(queryKeys.bookDetail(realBookId), {
      ...detail,
      id: realBookId,
      entries: detail.entries.map((e) => ({ ...e, bookId: realBookId })),
    });
    queryClient.removeQueries({ queryKey: queryKeys.bookDetail(tempBookId) });
  }
}
