/**
 * WALKTHROUGH — idb.ts (IndexedDB foundation)
 *
 * Single database `storybook-journal-offline` (version 1) with two stores:
 *   - entry-drafts — key/value drafts while editing (no keyPath; manual keys)
 *   - sync-queue — FIFO CRUD replay items (keyPath: id)
 *
 * openOfflineDb() opens once per operation; callers close after transaction.
 * onupgradeneeded creates stores on first visit or version bump.
 */
/** Shared IndexedDB connection for offline drafts + sync queue. */
export const DB_NAME = "storybook-journal-offline";
export const DB_VERSION = 1;
export const DRAFT_STORE = "entry-drafts";
export const QUEUE_STORE = "sync-queue";

export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    /* First open or DB_VERSION bump — create object stores */
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE);
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
    };
  });
}
