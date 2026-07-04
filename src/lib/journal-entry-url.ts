/**
 * Journal entry URL sync — mirrors the currently focused entry into the `?entry=`
 * query string via `history.replaceState` (NOT `next/navigation`'s router) so a hard
 * refresh reopens the same entry instead of always defaulting to the newest one.
 *
 * Deliberately avoids `router.replace`: the App Router re-runs `page.tsx` (a fresh
 * SSR round trip, re-querying Prisma) whenever `searchParams` changes via the Next
 * router, which would add a server round trip to every single next/prev click.
 * `history.replaceState` only updates the visible URL for the *next* hard reload to
 * read — it never touches Next's client cache or triggers a request. Guarded with
 * `typeof window` checks + try/catch (private browsing, sandboxed iframes) mirroring
 * `auth-landing-handoff.ts`.
 */
export const JOURNAL_ENTRY_QUERY_KEY = "entry";

/**
 * Validate an incoming `?entry=` search param against the book's real entry ids.
 * Server-safe (no `window` access) — used in `page.tsx` to resolve the initial
 * focused entry without ever trusting an unvalidated/stale/deleted id.
 */
export function resolveInitialFocusedEntryId(
  entryParam: string | string[] | undefined,
  entryIds: readonly string[],
): string | null {
  const candidate = Array.isArray(entryParam) ? entryParam[0] : entryParam;
  if (candidate && entryIds.includes(candidate)) return candidate;
  return null;
}

/**
 * Mirror the focused entry id into the URL's `?entry=` param without triggering
 * Next.js navigation. No-ops server-side and when the URL already matches.
 */
export function syncEntryUrlParam(entryId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (entryId) url.searchParams.set(JOURNAL_ENTRY_QUERY_KEY, entryId);
    else url.searchParams.delete(JOURNAL_ENTRY_QUERY_KEY);

    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next === current) return;

    /* Preserve Next's own history.state payload — overwriting with null can break
       its scroll-restoration / segment-cache bookkeeping for this history entry. */
    window.history.replaceState(window.history.state, "", next);
  } catch {
    /* URL/history unavailable — non-critical, refresh just falls back to newest entry */
  }
}
