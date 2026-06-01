/**
 * WALKTHROUGH — entry-draft-store.ts (IndexedDB drafts)
 *
 * Persists in-progress entry text while editing — separate from sync queue.
 * Drafts survive refresh; restored by useOfflineEntryDraft when local
 * updatedAt beats server entryUpdatedAt.
 *
 * CRUD: getEntryDraft / putEntryDraft / clearEntryDraft — each opens IDB,
 * runs one transaction, closes connection.
 */
/**
 * IndexedDB store for offline entry drafts (REQ-0015 MVP).
 * Key: `${bookId}:${entryId}` — survives refresh while editing.
 */
import type { EntryDraft } from "@/types";
import { DRAFT_STORE, openOfflineDb } from "@/lib/offline/idb";

export type StoredEntryDraft = {
  draft: EntryDraft;
  updatedAt: number;
  entryUpdatedAt?: string;
};

export function draftKey(bookId: string, entryId: string): string {
  return `${bookId}:${entryId}`;
}

export async function getEntryDraft(key: string): Promise<StoredEntryDraft | null> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE, "readonly");
    const req = tx.objectStore(DRAFT_STORE).get(key);
    req.onsuccess = () => resolve((req.result as StoredEntryDraft | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("getEntryDraft failed"));
    tx.oncomplete = () => db.close();
  });
}

export async function putEntryDraft(key: string, value: StoredEntryDraft): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE, "readwrite");
    tx.objectStore(DRAFT_STORE).put(value, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error("putEntryDraft failed"));
  });
}

export async function clearEntryDraft(key: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE, "readwrite");
    tx.objectStore(DRAFT_STORE).delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error("clearEntryDraft failed"));
  });
}
