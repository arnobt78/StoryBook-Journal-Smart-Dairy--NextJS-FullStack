/**
 * IndexedDB FIFO queue for offline CRUD replay when connectivity returns.
 */
import type { CreateEntryInput, UpdateEntryInput } from "@/lib/validations";
import type { BookFormValues } from "@/types/book-form";
import { openOfflineDb, QUEUE_STORE } from "@/lib/offline/idb";

export type SyncQueueItem =
  | {
      id: string;
      type: "patchEntry";
      entryId: string;
      payload: UpdateEntryInput;
      createdAt: number;
    }
  | {
      id: string;
      type: "postEntry";
      payload: CreateEntryInput;
      /** Client temp entry id — remapped to server id after sync */
      clientTempId?: string;
      createdAt: number;
    }
  | {
      id: string;
      type: "postBook";
      payload: BookFormValues;
      clientTempBookId?: string;
      createdAt: number;
    }
  | {
      id: string;
      type: "patchBook";
      bookId: string;
      payload: Partial<BookFormValues>;
      createdAt: number;
    };

export async function enqueueSyncItem(item: SyncQueueItem): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    tx.objectStore(QUEUE_STORE).put(item);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error("enqueueSyncItem failed"));
  });
}

export async function listSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const req = tx.objectStore(QUEUE_STORE).getAll();
    req.onsuccess = () => {
      const items = (req.result as SyncQueueItem[]).sort(
        (a, b) => a.createdAt - b.createdAt,
      );
      resolve(items);
    };
    req.onerror = () => reject(req.error ?? new Error("listSyncQueue failed"));
    tx.oncomplete = () => db.close();
  });
}

export async function removeSyncItem(id: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    tx.objectStore(QUEUE_STORE).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error("removeSyncItem failed"));
  });
}

export async function syncQueueCount(): Promise<number> {
  const items = await listSyncQueue();
  return items.length;
}

export function newQueueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** True when browser reports offline or fetch failed with a network error. */
export function isOfflineOrNetworkError(err: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (err instanceof TypeError) return true;
  return false;
}
