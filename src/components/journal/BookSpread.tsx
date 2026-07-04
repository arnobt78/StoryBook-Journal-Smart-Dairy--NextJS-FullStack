"use client";

/**
 * BookSpread — the main reader/editor component.
 *
 * Architecture:
 *  • TanStack Query (`useQuery`) hydrates from SSR `initialBook` and keeps the
 *    cache fresh after mutations via notifyJournalCacheUpdated.
 *  • DELETE entry/book via shared ConfirmDialog + journal-api helpers;
 *    journalSubtree invalidation keeps shelf + reader in sync without reload.
 *  • PATCH book metadata via BookEditorModal (shelf ✎ or reader “Edit journal”).
 *  • Books created via POST /api/books include a starter entry so `current` is never
 *    missing on first paint. Legacy books with zero entries show a one-tap seed UI.
 *  • `entryStaggerKey` remounts LeftPage/RightPage once per page-turn so their
 *    `journalStaggerRowProps` rows replay the entrance wave in sync on both pages
 *    (see PAGE FLIP walkthrough below) — mirrors AuthBookShell's flip technique.
 *  • Shelf shortcut in the bottom nav uses `/book-stack-1.svg` (fixed pixel size, no CLS).
 *  • `focusedEntryId` mirrors into the `?entry=` URL param (`journal-entry-url.ts`) via
 *    `history.replaceState` so a hard refresh reopens on the same entry instead of
 *    always defaulting to the newest one.
 *
 * Book sizing: all page/spine widths driven by CSS vars (--page-w, --page-h)
 * defined in globals.css :root so the entire spread scales responsively.
 *
 * ── WALKTHROUGH: subsystems wired in this orchestrator ──
 *  PAGE FLIP — `usePageFlip()` owns `isFlipping` + `flipDir`. `navigate()` calls
 *    `triggerFlip(dir, onComplete)`; only after the animation callback runs do we
 *    swap `focusedEntryId` AND bump `entryStaggerKey` (used as `key` on LeftPage/
 *    RightPage so they remount and replay their stagger wave). `isFlipping` is also
 *    passed down so both pages hide real content via `visibility` for the flip
 *    duration (anti-flash — see LeftPage/RightPage file header comments).
 *    `PageFlipOverlay` mounts as a sibling inside the 3-D row.
 *  AUTOSAVE — `useAutoSave` debounces PATCH to `/api/entries/:id` while `isWriting`.
 *    Paused during explicit Save (`isSaving`) or read mode. Clears IndexedDB draft on success.
 *  OFFLINE — `useOfflineEntryDraft` mirrors draft to IndexedDB; saves call
 *    `enqueuePatchEntryOffline` / `enqueuePostEntryOffline` when offline or on network error.
 *    `useOfflineIdRemap` swaps temp cuid ids after sync drain.
 *  3D BOOK — flex row uses `transformStyle: preserve-3d` + mild perspective tilt;
 *    page shells set `pointerEvents: none` with inner stacks at `auto` (see Left/RightPage).
 */
import { Fragment, useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appToast } from "@/lib/app-toast";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { BookEditorModal } from "@/components/journal/BookEditorModal";
import { BookSpreadHeader } from "@/components/journal/BookSpreadHeader";
import { JournalBottomNav } from "@/components/journal/JournalBottomNav";
import { LeftPage } from "./LeftPage";
import { RightPage } from "./RightPage";
import { PageFlipOverlay } from "./PageFlip";
import { SpreadCoilBinding } from "./SpreadCoilBinding";
import { usePageFlip } from "@/hooks/usePageFlip";
import { useBookTheme } from "@/hooks/useBookTheme";
import { RippleButton } from "@/components/ui/ripple-button";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useOfflineEntryDraft } from "@/hooks/useOfflineEntryDraft";
import { useOfflineIdRemap } from "@/hooks/useOfflineIdRemap";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { createAiAssistSessionId } from "@/lib/ai-assist";
import { applyOptimisticEntryPatch } from "@/lib/journal-cache-optimistic";
import { syncEntryUrlParam } from "@/lib/journal-entry-url";
import { formatEntryDate, normalizeTags } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";
import {
  notifyJournalCacheUpdated,
  notifyJournalCacheUpdatedAndRefetch,
} from "@/lib/journal-cache-notify";
import { fetchJournalBook, deleteJournalBook, deleteJournalEntry, updateJournalBook } from "@/lib/journal-api";
import {
  enqueuePatchBookOffline,
  enqueuePatchEntryOffline,
  enqueuePostEntryOffline,
  isBrowserOffline,
  isOfflineOrNetworkError,
} from "@/lib/offline/offline-journal-actions";
import type { JournalBook, JournalEntry, EntryDraft } from "@/types";
import { bookToFormValues, type BookFormValues } from "@/types/book-form";
import type { FlipDirection } from "@/types";

export interface BookSpreadProps {
  initialBook: JournalBook & { entries: JournalEntry[] };
  /** Server-validated `?entry=` id (see `journal-entry-url.ts`) — null falls back to the newest entry. */
  initialFocusedEntryId?: string | null;
}

export function BookSpread({ initialBook, initialFocusedEntryId = null }: BookSpreadProps) {
  const bookId = initialBook.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshCount } = useOfflineSync();

  const { data: book } = useQuery({
    queryKey: queryKeys.bookDetail(bookId),
    queryFn: () => fetchJournalBook(bookId),
    initialData: initialBook,
  });

  /** Ensure tags are always string[] — cache refetch must not leave JSON strings */
  const entries = useMemo(
    () => book.entries.map((e) => ({ ...e, tags: normalizeTags(e.tags) })),
    [book.entries],
  );
  const bookTitle = book.title;
  const bookColor = book.coverColor;
  const bookThemeProps = useBookTheme(book.theme ?? "warm-paper");

  /* ── ENTRY PERSISTENCE: prefer the server-resolved `?entry=` id; fall back to newest ── */
  const [focusedEntryId, setFocusedEntryId] = useState<string | null>(() => {
    if (initialFocusedEntryId) return initialFocusedEntryId;
    const last =
      initialBook.entries[Math.max(0, initialBook.entries.length - 1)];
    return last?.id ?? null;
  });

  /* Single call site mirrors every focus change (navigate/newEntry/delete-reassignment/
     offline-remap) into `?entry=` — a hard refresh then reopens on the same entry via
     the server-side resolution in page.tsx. `history.replaceState`, not the Next
     router, so this never triggers a re-fetch (see journal-entry-url.ts). */
  useEffect(() => {
    syncEntryUrlParam(focusedEntryId);
  }, [focusedEntryId]);
  const [isWriting, setIsWriting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState(false);
  const [confirmDeleteBook, setConfirmDeleteBook] = useState(false);
  const [pendingDeleteBookConfirm, setPendingDeleteBookConfirm] = useState(false);
  const [showEditBook, setShowEditBook] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [draft, setDraft] = useState<EntryDraft>({
    title: "",
    content: "",
    mood: "✨",
    weather: "☀️",
    tags: [],
    location: "",
  });

  const closeEditBook = useCallback(() => {
    if (isSavingBook) return;
    setShowEditBook(false);
    setPendingDeleteBookConfirm(false);
  }, [isSavingBook]);

  /** Defer confirm until editor unmounts so Radix dialog does not compete at z-index */
  const openDeleteBookConfirm = useCallback(() => {
    if (showEditBook) {
      setPendingDeleteBookConfirm(true);
      setShowEditBook(false);
      return;
    }
    setConfirmDeleteBook(true);
  }, [showEditBook]);

  useEffect(() => {
    if (!showEditBook && pendingDeleteBookConfirm) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- wait for editor exit before confirm
      setPendingDeleteBookConfirm(false);
      setConfirmDeleteBook(true);
    }
  }, [showEditBook, pendingDeleteBookConfirm]);

  /* Bumped on every page-turn (navigate/newEntry) — used as `key` on a Fragment wrapping
     LeftPage+RightPage so both remount and replay their stagger wave in sync.
     NOT bumped on delete-reassignment or offline id remap (see file header comment). */
  const [entryStaggerKey, setEntryStaggerKey] = useState(0);
  const { isFlipping, flipDir, triggerFlip } = usePageFlip();

  const remapFocusedEntry = useCallback((realEntryId: string) => {
    setFocusedEntryId(realEntryId);
  }, []);

  /* ── OFFLINE: temp entry ids from queue remap to server ids after sync ── */
  useOfflineIdRemap({
    bookId,
    focusedEntryId,
    onEntryIdRemap: remapFocusedEntry,
  });

  const currentIdx = useMemo(() => {
    if (!entries.length) return 0;
    if (focusedEntryId) {
      const i = entries.findIndex((e) => e.id === focusedEntryId);
      if (i >= 0) return i;
    }
    return Math.max(0, entries.length - 1);
  }, [entries, focusedEntryId]);

  const current = entries[currentIdx];
  const prev = currentIdx > 0 ? entries[currentIdx - 1] : null;

  const autoSavePayload = useMemo(
    () => ({ ...draft, tags: draft.tags }),
    [draft],
  );

  /* ── OFFLINE + AUTOSAVE: IndexedDB draft backup while editing (survives refresh/tab crash) ── */
  const { clearLocalDraft } = useOfflineEntryDraft({
    bookId,
    entryId: current?.id ?? "",
    draft,
    enabled: isWriting && Boolean(current?.id),
    entryUpdatedAt: current?.updatedAt
      ? new Date(current.updatedAt).toISOString()
      : undefined,
    onRestore: (restored) => setDraft(restored),
  });

  /* Debounced PATCH while editing — pauses during explicit save or when not in write mode */
  /* ── AUTOSAVE: see useAutoSave hook — debounced PATCH while isWriting ── */
  useAutoSave({
    entryId: current?.id ?? "",
    bookId,
    data: autoSavePayload,
    enabled: isWriting && !isSaving && Boolean(current?.id),
    onSaveSuccess: () => {
      void clearLocalDraft();
    },
  });

  /* ── PAGE FLIP: flip animation first, then swap focused entry in onComplete ── */
  const navigate = useCallback(
    (targetIdx: number) => {
      if (targetIdx === currentIdx || isFlipping || isWriting) return;
      const nextId = entries[targetIdx]?.id;
      if (!nextId) return;
      const dir: FlipDirection = targetIdx > currentIdx ? "fwd" : "bwd";
      triggerFlip(dir, () => {
        setFocusedEntryId(nextId);
        setEntryStaggerKey((k) => k + 1);
      });
    },
    [currentIdx, entries, isFlipping, isWriting, triggerFlip],
  );

  const goNext = () => navigate(currentIdx + 1);
  const goPrev = () => navigate(currentIdx - 1);

  const startWriting = () => {
    if (!current) return;
    setDraft({
      title: current.title,
      content: current.content,
      mood: current.mood,
      weather: current.weather,
      tags: [...current.tags],
      location: current.location ?? "",
    });
    setIsWriting(true);
  };

  const handleDraftChange = (
    field: keyof EntryDraft,
    value: string | string[],
  ) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };

  const saveEntry = async (override?: Partial<EntryDraft>) => {
    if (!current || isSaving) return;
    setIsSaving(true);
    const effective = { ...draft, ...override };
    const payload = {
      title: effective.title,
      content: effective.content,
      mood: effective.mood,
      weather: effective.weather,
      tags: normalizeTags(effective.tags),
      ...(effective.location ? { location: effective.location } : {}),
    };
    if (override) {
      setDraft((d) => ({ ...d, ...override, tags: normalizeTags(effective.tags) }));
    }

    if (isBrowserOffline()) {
      try {
        /* ── OFFLINE: queue PATCH + optimistic cache; toast instead of API ── */
        await enqueuePatchEntryOffline({
          queryClient,
          bookId,
          entryId: current.id,
          payload,
          refreshPendingCount: refreshCount,
        });
        setIsWriting(false);
        appToast.offline.queued("Entry");
      } catch {
        appToast.journal.saveFailed("save offline");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    try {
      const res = await fetch(`/api/entries/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      /* Optimistic patch before read mode — tags/mood visible instantly without waiting for refetch */
      applyOptimisticEntryPatch(queryClient, bookId, current.id, payload);
      setIsWriting(false);
      await clearLocalDraft();
      await notifyJournalCacheUpdated(queryClient);
      appToast.journal.entrySaved();
    } catch (err) {
      if (isOfflineOrNetworkError(err)) {
        try {
          await enqueuePatchEntryOffline({
            queryClient,
            bookId,
            entryId: current.id,
            payload,
            refreshPendingCount: refreshCount,
          });
          setIsWriting(false);
          appToast.offline.queued("Entry");
        } catch {
          appToast.journal.saveFailed("save offline");
        }
      } else {
        appToast.journal.saveFailed("save entry");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const newEntry = async () => {
    if (isFlipping || isWriting) return;
    const { entryDate, weekday } = formatEntryDate();
    const createPayload = {
      bookId,
      title: "New Entry",
      content: "",
      mood: "✨",
      weather: "☀️",
      tags: [] as string[],
    };

    if (isBrowserOffline()) {
      try {
        const tempId = await enqueuePostEntryOffline({
          queryClient,
          bookId,
          payload: createPayload,
          refreshPendingCount: refreshCount,
        });
        triggerFlip("fwd", () => {
          setFocusedEntryId(tempId);
          setEntryStaggerKey((k) => k + 1);
          setDraft({
            title: "New Entry",
            content: "",
            mood: "✨",
            weather: "☀️",
            tags: [],
            location: "",
          });
          setIsWriting(true);
        });
        appToast.offline.queued("New page");
      } catch {
        appToast.journal.saveFailed("queue new page offline");
      }
      return;
    }

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createPayload,
          entryDate,
          weekday,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error();
      const fresh = await notifyJournalCacheUpdatedAndRefetch(queryClient, () =>
        queryClient.fetchQuery({
          queryKey: queryKeys.bookDetail(bookId),
          queryFn: () => fetchJournalBook(bookId),
        }),
      );
      const last = fresh.entries[fresh.entries.length - 1];
      const newId = last?.id;
      if (!newId) throw new Error();
      triggerFlip("fwd", () => {
        setFocusedEntryId(newId);
        setEntryStaggerKey((k) => k + 1);
        setDraft({
          title: "New Entry",
          content: "",
          mood: "✨",
          weather: "☀️",
          tags: [],
          location: "",
        });
        setIsWriting(true);
      });
    } catch (err) {
      if (isOfflineOrNetworkError(err)) {
        try {
          const tempId = await enqueuePostEntryOffline({
            queryClient,
            bookId,
            payload: createPayload,
            refreshPendingCount: refreshCount,
          });
          triggerFlip("fwd", () => {
            setFocusedEntryId(tempId);
            setEntryStaggerKey((k) => k + 1);
            setDraft({
              title: "New Entry",
              content: "",
              mood: "✨",
              weather: "☀️",
              tags: [],
              location: "",
            });
            setIsWriting(true);
          });
          appToast.offline.queued("New page");
        } catch {
          appToast.journal.saveFailed("queue new page offline");
        }
      } else {
        appToast.journal.saveFailed("create entry");
      }
    }
  };

  /**
   * AI Assist — prefers SSE stream; falls back to sync POST on failure.
   */
  const aiAssist = async () => {
    if (isAiThinking || !draft.content.trim()) return;
    setIsAiThinking(true);
    const assistSessionId = createAiAssistSessionId();

    const body = JSON.stringify({
      title: draft.title,
      content: draft.content,
      mood: draft.mood,
      assistSessionId,
    });

    try {
      const streamRes = await fetch("/api/ai/assist/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (streamRes.status === 429) {
        const errJson = (await streamRes.json()) as { error?: string };
        appToast.ai.rateLimited(60);
        return;
      }

      if (streamRes.ok && streamRes.body) {
        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let prefixAdded = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data: ")) continue;
            const json = JSON.parse(line.slice(6)) as {
              text?: string;
              error?: string;
              done?: string;
              usedFallback?: boolean;
            };
            if (json.usedFallback) appToast.ai.fallbackOpenRouter();
            if (json.error) throw new Error(json.error);
            if (json.text) {
              setDraft((d) => {
                const sep =
                  !prefixAdded && d.content && !d.content.endsWith("\n")
                    ? "\n\n"
                    : "";
                prefixAdded = true;
                return { ...d, content: d.content + sep + json.text };
              });
            }
          }
        }
        return;
      }

      /* Fallback to sync route */
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const json = (await res.json()) as { text?: string; error?: string };
      if (json.error) throw new Error(json.error);
      if (json.text) {
        setDraft((d) => ({
          ...d,
          content:
            d.content +
            (d.content.endsWith("\n") ? "" : "\n\n") +
            json.text!.trim(),
        }));
      }
    } catch {
      appToast.ai.unavailable();
    } finally {
      setIsAiThinking(false);
    }
  };

  /** DELETE current entry — refetch book cache and focus an adjacent page */
  const handleDeleteEntry = async () => {
    if (!current || isDeleting || isWriting || isFlipping) return;
    setIsDeleting(true);
    try {
      await deleteJournalEntry(current.id);
      const fresh = await notifyJournalCacheUpdatedAndRefetch(queryClient, () =>
        queryClient.fetchQuery({
          queryKey: queryKeys.bookDetail(bookId),
          queryFn: () => fetchJournalBook(bookId),
        }),
      );
      setIsWriting(false);
      if (fresh.entries.length === 0) {
        setFocusedEntryId(null);
      } else {
        const nextIdx = Math.min(currentIdx, fresh.entries.length - 1);
        setFocusedEntryId(fresh.entries[nextIdx]?.id ?? null);
      }
      appToast.journal.entryRemoved();
    } catch {
      appToast.journal.saveFailed("remove page");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteEntry(false);
    }
  };

  /** DELETE entire journal — redirect to shelf after subtree invalidation */
  const handleDeleteBook = async () => {
    if (isDeleting || isFlipping) return;
    setIsDeleting(true);
    try {
      await deleteJournalBook(bookId);
      await notifyJournalCacheUpdated(queryClient);
      appToast.journal.bookRemoved();
      router.push("/dashboard");
      router.refresh();
    } catch {
      appToast.journal.saveFailed("remove journal");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteBook(false);
    }
  };

  /** PATCH journal metadata — optimistic + offline queue when network unavailable */
  const handleUpdateBook = async (values: BookFormValues) => {
    if (isSavingBook || isFlipping) return;
    setIsSavingBook(true);
    try {
      if (isBrowserOffline()) {
        await enqueuePatchBookOffline({
          queryClient,
          bookId,
          payload: values,
          refreshPendingCount: refreshCount,
        });
        setShowEditBook(false);
        appToast.offline.queued("Journal");
        return;
      }

      await updateJournalBook(bookId, values);
      await notifyJournalCacheUpdated(queryClient);
      setShowEditBook(false);
      appToast.journal.bookUpdated();
    } catch (err) {
      if (isOfflineOrNetworkError(err)) {
        try {
          await enqueuePatchBookOffline({
            queryClient,
            bookId,
            payload: values,
            refreshPendingCount: refreshCount,
          });
          setShowEditBook(false);
          appToast.offline.queued("Journal");
        } catch {
          appToast.journal.saveFailed("save journal offline");
        }
      } else {
        appToast.journal.saveFailed("update journal");
      }
    } finally {
      setIsSavingBook(false);
    }
  };

  if (!entries.length) {
    return (
      <>
        {/* Legacy or migrated books with no rows: `BookSpread` needs a `current` entry. */}
        <div
          style={{
            position: "relative",
            maxWidth: "min(380px, 92vw)",
            padding: "36px 28px",
            textAlign: "center",
            borderRadius: "12px",
            border: "1px solid rgba(255,160,60,.12)",
            background: "rgba(16,6,1,.35)",
            boxShadow: "0 24px 48px rgba(0,0,0,.4)",
          }}
        >
          <p
            style={{
              fontFamily: "'Lora',serif",
              fontSize: "14px",
              lineHeight: 1.65,
              color: "rgba(255,200,140,.62)",
              margin: "0 0 22px",
            }}
          >
            This journal has no pages yet. Create the first entry to open the
            book.
          </p>
          <RippleButton
            type="button"
            onClick={() => void newEntry()}
            disabled={isFlipping || isWriting}
            shine
            style={{
              fontFamily: "'Lora',serif",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              background: "rgba(160,85,30,.28)",
              color: "rgba(255,205,130,.88)",
              border: "1px solid rgba(160,85,30,.35)",
              padding: "10px 22px",
              borderRadius: "24px",
              cursor: isFlipping || isWriting ? "default" : "pointer",
              opacity: isFlipping || isWriting ? 0.45 : 1,
            }}
          >
            + First page
          </RippleButton>
          <RippleButton
            type="button"
            onClick={() => setShowEditBook(true)}
            disabled={isFlipping || isWriting || isSavingBook}
            style={{
              display: "block",
              margin: "12px auto 0",
              fontFamily: "'Lora',serif",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              background: "rgba(160,85,30,.22)",
              color: "rgba(255,185,100,.65)",
              border: "1px solid rgba(160,85,30,.28)",
              padding: "8px 16px",
              borderRadius: "20px",
              cursor: "pointer",
              opacity: isFlipping || isWriting || isSavingBook ? 0.45 : 1,
            }}
          >
            Edit journal
          </RippleButton>
          <RippleButton
            type="button"
            onClick={openDeleteBookConfirm}
            disabled={isFlipping || isWriting || isDeleting}
            style={{
              display: "block",
              margin: "16px auto 0",
              fontFamily: "'Lora',serif",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              background: "transparent",
              color: "rgba(255,160,100,.4)",
              border: "1px solid rgba(255,160,60,.15)",
              padding: "8px 16px",
              borderRadius: "20px",
              cursor: "pointer",
              opacity: isFlipping || isWriting || isDeleting ? 0.45 : 1,
            }}
          >
            Remove journal
          </RippleButton>
        </div>
        <BookEditorModal
          key={`edit-${bookId}-${showEditBook}`}
          open={showEditBook}
          mode="edit"
          initialValues={bookToFormValues(book)}
          loading={isSavingBook}
          onClose={closeEditBook}
          onSubmit={(values) => void handleUpdateBook(values)}
        />
        <ConfirmDialog
          open={confirmDeleteBook}
          variant="dark"
          priority
          title="Remove this journal?"
          description={<>Every page in &ldquo;{bookTitle}&rdquo; will be permanently deleted.</>}
          confirmLabel="Remove journal"
          loading={isDeleting}
          onConfirm={() => void handleDeleteBook()}
          onCancel={() => setConfirmDeleteBook(false)}
        />
      </>
    );
  }

  if (!current) return null;

  return (
    <>
      {/* Book shadow on the 3-D row — avoids parent `filter` + preserve-3d shimmer (same rationale as `AuthBookShell`). */}
      <div
        style={{ position: "relative", ...bookThemeProps.style }}
        data-book-theme={bookThemeProps["data-book-theme"]}
      >
        {/* Leather ambient spotlight — absolute-positioned BEFORE the 3D book so it paints
            behind it (DOM order, same stacking context). Extends +280px h / +200px v beyond
            the book footprint so the halo is visible around the outer edges of the spread.
            filter:blur is on THIS sibling div, not on the preserve-3d ancestor — safe. */}
        <div aria-hidden className="journal-spread-spotlight" />

        {/* Book spread — `pointer-events: none` on the 3-D flex row avoids an oversized
          axis-aligned hit box (full spread) stealing clicks; `LeftPage` / `RightPage`
          re-enable `auto` only on their inner content stacks. */}
        {/* ── 3D BOOK: preserve-3d spread — shadow on wrapper, not filter (avoids shimmer) ── */}
        <div
          className={isFlipping ? "spread-coil-flipping" : undefined}
          style={{
            display: "flex",
            alignItems: "stretch",
            transformStyle: "preserve-3d",
            transform: "perspective(2000px) rotateX(3deg) rotateY(-2deg)",
            position: "relative",
            pointerEvents: "none",
            /* Add leather outer ambient ring on top of the drop-shadow */
            boxShadow:
              "0 48px 96px rgba(0,0,0,.72), 0 16px 40px rgba(0,0,0,.38), 0 0 90px rgba(139,69,19,.22), 0 0 200px rgba(90,40,10,.12)",
          }}
        >
          {/* Spine */}
          <div
            style={{
              width: "var(--spine-w, 22px)",
              flexShrink: 0,
              zIndex: 10,
              background: `linear-gradient(180deg,
            color-mix(in srgb,${bookColor} 30%,#000) 0%,
            ${bookColor} 50%,
            color-mix(in srgb,${bookColor} 30%,#000) 100%)`,
              boxShadow: "inset -2px 0 5px rgba(0,0,0,.4)",
            }}
          />

          {/* Single keyed Fragment remounts both pages together for stagger replay.
              Do NOT put the same numeric key on LeftPage + RightPage as siblings — React
              warns "two children with the same key" and reconciliation breaks (triple-page glitch). */}
          <Fragment key={entryStaggerKey}>
            <LeftPage
              currentEntry={current}
              prevEntry={prev}
              entries={entries}
              currentIdx={currentIdx}
              pageNumber={currentIdx * 2 + 1}
              onNavigate={navigate}
              isFlipping={isFlipping}
            />

            <RightPage
              entry={current}
              pageNumber={currentIdx * 2 + 2}
              isWriting={isWriting}
              draft={draft}
              isSaving={isSaving}
              isFlipping={isFlipping}
              onStartWriting={startWriting}
              onDraftChange={handleDraftChange}
              onSave={saveEntry}
              onCancel={() => setIsWriting(false)}
              onAiAssist={aiAssist}
              isAiThinking={isAiThinking}
              onDeleteEntry={() => setConfirmDeleteEntry(true)}
              canDeleteEntry={!isFlipping && !isWriting && !isDeleting}
            />
          </Fragment>

          <SpreadCoilBinding />

          {/* ── PAGE FLIP: overlay mounts only during animation ── */}
          {isFlipping && flipDir && <PageFlipOverlay direction={flipDir} />}
        </div>

        <JournalBottomNav
          currentIdx={currentIdx}
          entryCount={entries.length}
          isFlipping={isFlipping}
          isWriting={isWriting}
          isSavingBook={isSavingBook}
          isDeleting={isDeleting}
          onBackToShelf={() => router.push("/dashboard")}
          onPrev={goPrev}
          onNext={goNext}
          onNewEntry={newEntry}
          onEditJournal={() => setShowEditBook(true)}
          onRemoveJournal={openDeleteBookConfirm}
        />

        <BookEditorModal
          key={`edit-${bookId}-${showEditBook}`}
          open={showEditBook}
          mode="edit"
          initialValues={bookToFormValues(book)}
          loading={isSavingBook}
          onClose={closeEditBook}
          onSubmit={(values) => void handleUpdateBook(values)}
        />
        <ConfirmDialog
          open={confirmDeleteEntry}
          variant="dark"
          priority
          title="Remove this page?"
          description={
            <>
              &ldquo;{current.title}&rdquo; will be permanently deleted from this journal.
            </>
          }
          confirmLabel="Remove page"
          loading={isDeleting}
          onConfirm={() => void handleDeleteEntry()}
          onCancel={() => setConfirmDeleteEntry(false)}
        />
        <ConfirmDialog
          open={confirmDeleteBook}
          variant="dark"
          priority
          title="Remove this journal?"
          description={
            <>
              Every page in &ldquo;{bookTitle}&rdquo; will be permanently deleted.
            </>
          }
          confirmLabel="Remove journal"
          loading={isDeleting}
          onConfirm={() => void handleDeleteBook()}
          onCancel={() => setConfirmDeleteBook(false)}
        />

        {/* Golden branding above spread — icon, title, truncated description */}
        <BookSpreadHeader
          coverEmoji={book.coverEmoji}
          title={book.title}
          description={book.description}
        />
      </div>
    </>
  );
}
