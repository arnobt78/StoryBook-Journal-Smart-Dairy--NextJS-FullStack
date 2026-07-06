/**
 * @file components/journal/CommandPalette.tsx
 *
 * WALKTHROUGH — ⌘K global command palette
 * ─────────────────────────────────────
 * Features: debounced search (`/api/search`), journal navigation, theme cycle,
 * sign-out hook passthrough. Query enabled only while open to avoid idle fetches.
 * Theme cycle PATCHes active book via `updateJournalBook` + cache invalidation.
 */
"use client";

/**
 * ⌘K command palette — search entries, navigate journals, cycle theme, quick actions.
 */
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { queryKeys } from "@/lib/query-keys";
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";
import { updateJournalBook } from "@/lib/journal-api";
import { CoverIcon } from "@/components/journal/CoverIcon";
import { getNextBookThemeId, getBookThemeLabel } from "@/lib/book-theme-cycle";
import { appToast } from "@/lib/app-toast";
import { useActiveJournalBook } from "@/hooks/useActiveJournalBook";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { SearchHit } from "@/lib/search";
import type { JournalBook } from "@/types";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void | Promise<void>;
  signingOut?: boolean;
};

export function CommandPalette({
  open,
  onOpenChange,
  onSignOut,
  signingOut = false,
}: CommandPaletteProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [themeBusy, setThemeBusy] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const { bookId, book, isOnJournalPage } = useActiveJournalBook();

  const { data: books = [] } = useQuery<JournalBook[]>({
    queryKey: queryKeys.booksList(),
    queryFn: async () => {
      const res = await fetch("/api/books");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: open,
  });

  const { data: searchHits = [] } = useQuery<SearchHit[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=12`,
      );
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: open && debouncedQuery.trim().length >= 2,
  });

  const run = useCallback(
    (fn: () => void) => {
      onOpenChange(false);
      setQuery("");
      fn();
    },
    [onOpenChange],
  );

  const cycleTheme = useCallback(async () => {
    if (!bookId || !book || themeBusy) return;
    setThemeBusy(true);
    try {
      const nextId = getNextBookThemeId(book.theme ?? "warm-paper");
      await updateJournalBook(bookId, { theme: nextId });
      await notifyJournalCacheUpdated(queryClient);
      appToast.journal.themeChanged(getBookThemeLabel(nextId));
      onOpenChange(false);
      setQuery("");
    } catch {
      appToast.journal.saveFailed("update theme");
    } finally {
      setThemeBusy(false);
    }
  }, [book, bookId, onOpenChange, queryClient, themeBusy]);

  if (!open) return null;

  const themeActionLabel = isOnJournalPage && book
    ? `Cycle page theme (${getBookThemeLabel(book.theme ?? "warm-paper")})`
    : "Cycle page theme — open a journal first";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-[rgba(120,70,20,.2)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search entries, open a journal…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {searchHits.length > 0 && (
              <CommandGroup heading="Search">
                {searchHits.map((hit) => (
                  <CommandItem
                    key={hit.id}
                    value={`${hit.title} ${hit.bookTitle}`}
                    onSelect={() =>
                      run(() => router.push(`/journal/${hit.bookId}`))
                    }
                  >
                    <span>{hit.mood}</span>
                    <span className="truncate">
                      {hit.title} — {hit.bookTitle}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Journals">
              {books.map((b) => (
                <CommandItem
                  key={b.id}
                  value={b.title}
                  onSelect={() => run(() => router.push(`/journal/${b.id}`))}
                >
                  <CoverIcon id={b.coverEmoji} size={14} />
                  <span>{b.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Actions">
              <CommandItem
                disabled={!isOnJournalPage || !book || themeBusy}
                onSelect={() => void cycleTheme()}
              >
                {themeActionLabel}
              </CommandItem>
              <CommandItem onSelect={() => run(() => router.push("/dashboard"))}>
                Open shelf
              </CommandItem>
              <CommandItem
                disabled={signingOut}
                onSelect={() => run(() => void onSignOut())}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
}

/** Global ⌘K / Ctrl+K listener */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}
