import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { BookSpread } from "@/components/journal/BookSpread";
import { parseTags } from "@/lib/utils";
import { resolveInitialFocusedEntryId } from "@/lib/journal-entry-url";
import { JOURNAL_ROUTE_VIEWPORT_CLASS } from "@/lib/book-spread-scroll";
import type { JournalBook, JournalEntry } from "@/types";

interface PageProps {
  params: Promise<{ bookId: string }>;
  /** `?entry=<id>` — persists the focused entry across a hard refresh (see journal-entry-url.ts) */
  searchParams: Promise<{ entry?: string | string[] }>;
}

/**
 * @file (dashboard)/journal/[bookId]/page.tsx
 * @route `/journal/[bookId]` — immersive page-flip editor for one book.
 *
 * **SSR vs client:** Server loads book + entries (ownership check via userId);
 * `BookSpread` (client) receives `initialBook` to hydrate TanStack Query cache.
 * The `?entry=` search param (if present and still valid) resolves which entry
 * `BookSpread` opens on — computed here, server-side, so there is no client-only
 * guess (`localStorage`/effect) that could cause a hydration mismatch or flash.
 */
export const dynamic = "force-dynamic";

export default async function JournalPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Next.js 15+: dynamic segment params/searchParams are async
  const { bookId } = await params;
  const { entry } = await searchParams;

  // findFirst + userId — 404 if book missing or belongs to another user
  const book = await prisma.journalBook.findFirst({
    where: { id: bookId, userId: session.user.id },
    include: {
      entries: {
        where: { isArchived: false },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!book) notFound();

  /** Hydrates TanStack Query in `BookSpread` so invalidations refetch the same shape as GET /api/books/[id]. */
  const initialBook: JournalBook & { entries: JournalEntry[] } = {
    ...book,
    entries: book.entries.map((e) => ({
      ...e,
      tags: parseTags(e.tags),
    })),
  };

  /** Validated against real entry ids — an unknown/deleted/stale `?entry=` falls back to null (newest entry). */
  const initialFocusedEntryId = resolveInitialFocusedEntryId(
    entry,
    initialBook.entries.map((e) => e.id),
  );

  return (
    // Wave 37 — full-bleed gradient + pad-top for nav; positioning in .journal-route-viewport CSS
    <div
      className={`book-viewport-80 ${JOURNAL_ROUTE_VIEWPORT_CLASS}`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #2e160a 0%, #1a0c05 55%, #0e0603 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        minHeight: 0,
        flex: 1,
        boxSizing: "border-box",
      }}
    >
      <BookSpread initialBook={initialBook} initialFocusedEntryId={initialFocusedEntryId} />
    </div>
  );
}
