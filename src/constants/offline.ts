/**
 * Browser events + id prefixes for offline sync remapping.
 * BookSpread / BookShelf listen to swap temp ids after queue drain.
 */
export const OFFLINE_ID_PREFIX = {
  entry: "offline-entry-",
  book: "offline-book-",
} as const;

export const OFFLINE_SYNC_EVENTS = {
  entrySynced: "storybook:offline-entry-synced",
  bookSynced: "storybook:offline-book-synced",
} as const;

export type OfflineEntrySyncedDetail = {
  bookId: string;
  tempEntryId: string;
  realEntryId: string;
};

export type OfflineBookSyncedDetail = {
  tempBookId: string;
  realBookId: string;
};

export function isOfflineTempEntryId(id: string): boolean {
  return id.startsWith(OFFLINE_ID_PREFIX.entry);
}

export function isOfflineTempBookId(id: string): boolean {
  return id.startsWith(OFFLINE_ID_PREFIX.book);
}

export function dispatchOfflineEntrySynced(detail: OfflineEntrySyncedDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OFFLINE_SYNC_EVENTS.entrySynced, { detail }));
}

export function dispatchOfflineBookSynced(detail: OfflineBookSyncedDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OFFLINE_SYNC_EVENTS.bookSynced, { detail }));
}
