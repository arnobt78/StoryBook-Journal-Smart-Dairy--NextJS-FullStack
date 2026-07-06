/**
 * @file hooks/useOfflineIdRemap.ts
 *
 * WALKTHROUGH — useOfflineIdRemap
 *
 * Listens for browser CustomEvents dispatched after sync queue drain
 * replaces temp ids with server cuids. Keeps reader focus + URL correct:
 *   - entrySynced → if focused entry was temp, call onEntryIdRemap(realId)
 *   - bookSynced → router.replace to `/journal/{realBookId}`
 *
 * Effect subscribes on mount, unsubscribes on bookId/focus change/unmount.
 */
"use client";

/**
 * Remaps focused entry/book ids when offline temp rows sync to server cuids.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  OFFLINE_SYNC_EVENTS,
  type OfflineBookSyncedDetail,
  type OfflineEntrySyncedDetail,
} from "@/constants/offline";

export function useOfflineIdRemap(params: {
  bookId: string;
  focusedEntryId: string | null;
  onEntryIdRemap: (realEntryId: string) => void;
}): void {
  const router = useRouter();
  const { bookId, focusedEntryId, onEntryIdRemap } = params;

  /* CustomEvents from sync drain — keep editor focus on remapped entry id */
  useEffect(() => {
    const onEntry = (event: Event) => {
      const detail = (event as CustomEvent<OfflineEntrySyncedDetail>).detail;
      if (detail.bookId !== bookId) return;
      if (focusedEntryId === detail.tempEntryId) {
        onEntryIdRemap(detail.realEntryId);
      }
    };

    const onBook = (event: Event) => {
      const detail = (event as CustomEvent<OfflineBookSyncedDetail>).detail;
      if (bookId !== detail.tempBookId) return;
      router.replace(`/journal/${detail.realBookId}`);
    };

    window.addEventListener(OFFLINE_SYNC_EVENTS.entrySynced, onEntry);
    window.addEventListener(OFFLINE_SYNC_EVENTS.bookSynced, onBook);
    return () => {
      window.removeEventListener(OFFLINE_SYNC_EVENTS.entrySynced, onEntry);
      window.removeEventListener(OFFLINE_SYNC_EVENTS.bookSynced, onBook);
    };
  }, [bookId, focusedEntryId, onEntryIdRemap, router]);
}
