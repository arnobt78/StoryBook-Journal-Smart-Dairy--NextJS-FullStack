/**
 * @file hooks/useOfflineEntryDraft.ts
 *
 * WALKTHROUGH — useOfflineEntryDraft
 *
 * IndexedDB draft persistence while editing (survives refresh/tab close).
 * Three-effect lifecycle:
 *   1) Debounced put — writes draft to IDB every 500ms while `enabled`.
 *   2) Restore — on write-mode open, compares local `updatedAt` vs server
 *      `entryUpdatedAt`; newer local wins → `onRestore` + toast.
 *   3) Guard reset — clears `restoredRef` when leaving write mode so the
 *      next open can restore again.
 *
 * Key format: `${bookId}:${entryId}` via `draftKey()`.
 */
"use client";

import { useEffect, useRef } from "react";
import { appToast } from "@/lib/app-toast";
import {
  clearEntryDraft,
  draftKey,
  getEntryDraft,
  putEntryDraft,
} from "@/lib/offline/entry-draft-store";
import type { EntryDraft } from "@/types";

interface UseOfflineEntryDraftOptions {
  bookId: string;
  entryId: string;
  draft: EntryDraft;
  enabled: boolean;
  entryUpdatedAt?: string;
  onRestore: (draft: EntryDraft) => void;
  onClear?: () => void;
}

/**
 * Persists entry drafts to IndexedDB while editing; restores newer local drafts on write-mode open.
 */
export function useOfflineEntryDraft({
  bookId,
  entryId,
  draft,
  enabled,
  entryUpdatedAt,
  onRestore,
  onClear,
}: UseOfflineEntryDraftOptions) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef<string | null>(null);
  const userEditedRef = useRef(false);
  const enableSnapshotRef = useRef<string>("");

  /* Snapshot draft at write-mode open — skip IDB restore if user edits before async restore completes */
  useEffect(() => {
    if (enabled && bookId && entryId) {
      enableSnapshotRef.current = JSON.stringify(draft);
      userEditedRef.current = false;
    }
  }, [enabled, bookId, entryId]); // eslint-disable-line react-hooks/exhaustive-deps -- snapshot once per open

  useEffect(() => {
    if (!enabled || !bookId || !entryId) return;
    if (JSON.stringify(draft) !== enableSnapshotRef.current) {
      userEditedRef.current = true;
    }
  }, [draft, enabled, bookId, entryId]);

  /* Debounced write while editing */
  useEffect(() => {
    if (!enabled || !bookId || !entryId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void putEntryDraft(draftKey(bookId, entryId), {
        draft,
        updatedAt: Date.now(),
        entryUpdatedAt,
      });
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [bookId, draft, enabled, entryId, entryUpdatedAt]);

  /* Restore local draft when entering write mode */
  useEffect(() => {
    if (!enabled || !bookId || !entryId) return;
    const key = `${bookId}:${entryId}`;
    if (restoredRef.current === key) return;

    void (async () => {
      try {
        const stored = await getEntryDraft(draftKey(bookId, entryId));
        if (!stored) return;

        const serverTime = entryUpdatedAt
          ? new Date(entryUpdatedAt).getTime()
          : 0;
        if (stored.updatedAt > serverTime) {
          if (userEditedRef.current) {
            restoredRef.current = key;
            return;
          }
          onRestore(stored.draft);
          appToast.journal.draftRestored();
        }
        restoredRef.current = key;
      } catch {
        /* IDB unavailable — skip silently */
      }
    })();
  }, [bookId, enabled, entryId, entryUpdatedAt, onRestore]);

  /* Reset restore guard when leaving write mode */
  useEffect(() => {
    if (!enabled) restoredRef.current = null;
  }, [enabled]);

  return {
    clearLocalDraft: async () => {
      if (!bookId || !entryId) return;
      try {
        await clearEntryDraft(draftKey(bookId, entryId));
        onClear?.();
      } catch {
        /* ignore */
      }
    },
  };
}
