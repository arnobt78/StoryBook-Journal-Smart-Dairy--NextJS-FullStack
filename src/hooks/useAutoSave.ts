"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { queryKeys } from "@/lib/query-keys";
import {
  enqueuePatchEntryOffline,
  isBrowserOffline,
  isOfflineOrNetworkError,
} from "@/lib/offline/offline-journal-actions";
import type { UpdateEntryInput } from "@/lib/validations";

interface UseAutoSaveOptions {
  entryId: string;
  bookId: string;
  data: Record<string, unknown>;
  enabled: boolean;
  delay?: number;
  onSaveSuccess?: () => void;
}

/**
 * Debounced PATCH while editing; offline path applies optimistic cache + sync queue.
 */
export function useAutoSave({
  entryId,
  bookId,
  data,
  enabled,
  delay = 2000,
  onSaveSuccess,
}: UseAutoSaveOptions) {
  const queryClient = useQueryClient();
  const { refreshCount } = useOfflineSync();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);
  const previousData = useRef<string>("");
  const wasEnabled = useRef(false);

  useEffect(() => {
    if (enabled && entryId) {
      if (!wasEnabled.current) {
        previousData.current = JSON.stringify(data);
      }
    } else {
      previousData.current = "";
    }
    wasEnabled.current = enabled;
  }, [enabled, entryId, data]);

  useEffect(() => {
    if (!enabled || !entryId || !bookId) return;

    const serialized = JSON.stringify(data);
    if (serialized === previousData.current) return;

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      if (isSaving.current) return;
      isSaving.current = true;
      previousData.current = serialized;

      const payload = JSON.parse(serialized) as UpdateEntryInput;

      if (isBrowserOffline()) {
        try {
          await enqueuePatchEntryOffline({
            queryClient,
            bookId,
            entryId,
            payload,
            refreshPendingCount: refreshCount,
          });
          toast.info("Saved offline — will sync when online", { duration: 2000 });
          onSaveSuccess?.();
        } catch {
          toast.error("Failed to save offline");
        } finally {
          isSaving.current = false;
        }
        return;
      }

      try {
        const res = await fetch(`/api/entries/${entryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: serialized,
        });

        if (!res.ok) throw new Error("Save failed");

        void queryClient.invalidateQueries({ queryKey: queryKeys.journalSubtree() });
        onSaveSuccess?.();

        toast.success("Saved", {
          duration: 1200,
          style: { fontSize: "11px" },
        });
      } catch (err) {
        if (isOfflineOrNetworkError(err)) {
          try {
            await enqueuePatchEntryOffline({
              queryClient,
              bookId,
              entryId,
              payload,
              refreshPendingCount: refreshCount,
            });
            toast.info("Saved offline — will sync when online", { duration: 2000 });
            onSaveSuccess?.();
          } catch {
            toast.error("Failed to save offline");
          }
        } else {
          toast.error("Failed to save — will retry");
        }
      } finally {
        isSaving.current = false;
      }
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [bookId, data, delay, enabled, entryId, onSaveSuccess, queryClient, refreshCount]);
}
