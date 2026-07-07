# Cycle C4 — UI Polish + Entry Tags (active)

**Status:** Stage 4 Verification — static PASS · Waves **1–48**

| Field | Value |
|-------|-------|
| Commits | `ec8ec35` (Wave 48) · `a7509b2` (Wave 47) |
| Unit tests | **123** Vitest PASS |

## Core deliverables (REQ)

- **REQ-0029:** UI polish — landing, auth, dashboard, journal spread, nav, footers
- **REQ-0030:** Leather glass tokens, glows, stagger, dialogs, tooltips
- **REQ-0031:** Tags persist/display/edit (`mergePendingTag`, TagsEditor)

## Recent waves (2026-06-29)

| Wave | Summary | Key files |
|------|---------|-----------|
| 18–18e | Landing→auth handoff, parallel stagger, crossfade | `auth-landing-handoff.ts`, `BookCover.tsx` |
| 19 | Auth CTA spinner until dashboard | `AuthFormSubmitButton`, `AuthCtaSpinner` |
| 20 | OAuth welcome toast; logout 3D book close | `OAuthReturnSync`, `LogoutBookCloseOverlay` |
| 21 | Journal ink; `BookSpreadHeader`; shelf tooltips | `journal-page-styles.ts`, `book-brand-styles.ts` |
| 22 | `JournalBottomNav`; confirm `priority`; paper action hovers | `JournalBottomNav.tsx`, `ConfirmDialog` |
| 23 | Defer delete confirm; nav flex-wrap; shelf glow outside button | `BookSpread`, `BookShelf`, `globals.css` |
| 24 | Journal book row stagger (header + left/right pages), mirrors auth-stagger | `journal-stagger.ts`, `BookSpreadHeader.tsx`, `LeftPage.tsx`, `RightPage.tsx` |
| **26** | Flip anti-flash (`visibility` gate + remount key) + `?entry=` persistence on refresh | `LeftPage.tsx`, `RightPage.tsx`, `BookSpread.tsx`, `journal-entry-url.ts` |
| **27** | Spread header Dancing Script desc + nowrap x-axis align | `book-brand-styles.ts`, `BookSpreadHeader.tsx` |
| **28** | Nav outside `.dashboard-scroll` — profile avatar shift fix | `DashboardClientShell.tsx`, `DashboardNav.tsx`, `globals.css` |
| **29** | Demo picker 3-zone trigger + chevron rotate | `LoginForm.tsx`, `auth-form-styles.ts`, `globals.css` |
| **30** | Demo picker selected avatar + `TEST_ACCOUNT_DISPLAY_NAME` | `demo-account.ts`, `constants/auth.ts`, `LoginForm.tsx` |
| **31** | Dark page theme ink — `bookThemeCssVars`, extended `BOOK_THEMES` | `book-theme-vars.ts`, `journal-page-styles.ts`, `LeftPage`, `RightPage`, `globals.css` |
| **32** | Theme-aware page flip — `PageFlipOverlay` uses theme vars | `PageFlip.tsx`, `globals.css`, `themes.ts` |
| **33** | Mobile horizontal scroll — `BookSpreadScrollPort` below 768px | `book-spread-scroll.ts`, `BookSpreadScrollPort.tsx`, `AuthBookShell`, `BookSpread`, `globals.css` |
| **33b** | Auth padding parity + scroll bounds pin | `journal-page-styles.ts`, `AuthBookShell.tsx`, `globals.css` |
| **34** | Mobile auth labels + shell pad + icon nav | `auth-responsive-labels.ts`, `LoginForm`, `JournalBottomNav`, `BookSpreadHeader` |
| **35–38** | Mobile journal chrome, glass nav, spotlight bleed, edit X-scroll lock | `globals.css`, `BookSpread`, `JournalBottomNav`, footers |
| **39** | md+ flip unclip — stable clip-margin + pinned inner width | `globals.css`, `BookSpreadScrollPort`, `book-spread-scroll.ts` |
| **40** | Fixed nav overlay on journal md+ | `globals.css`, `DashboardClientShell` pattern |
| **40b** | Journal nav+chrome padding; shelf single-viewport md+ | `globals.css`, `BookShelf` (`.dashboard-shelf-*`) |
| **41** | Auth logo → `/`; demo-picker fixed slots; nav brand spotlight + profile hover; bottom nav "New journal" | `AuthSpreadHeader`, `LoginForm`, `DashboardNav`, `JournalBottomNav`, `globals.css` |
| **42** | API status + documentation UI — `/api-status`, `/api-documentation`, GET `/api/status`, `/api/openapi` | `api-status-server.ts`, `api-route-catalog.ts`, `ApiStatusClient`, `ApiDocumentationClient`, `card/badge/tabs` |
| **43** | SEO metadata + sitemap + manifest; `@file` walkthrough comments; README rewrite; `npm run verify` | `site-metadata.ts`, `sitemap.ts`, `manifest.ts`, `README.md`, ~90 `src/**` comment headers |
| **47** | Voice hardening — Phase 3 drain, WASM worker, dead-type cleanup, banner UX | `useVoiceInput.ts`, `whisper.worker.ts`, `whisper-worker-client.ts`, `voice-*` libs |
| **48** | Entry save 401 — `auth()` wrapper, `journal-fetch`, session keepalive; voice Quick stop + editor scroll | `entries/[entryId]/route.ts`, `journal-fetch.ts`, `useWebSpeech.ts`, `JournalEditor.tsx`, `journal-editor-scroll.ts` |

## Session 2026-07-06 (EOD)

- **Wave 47** (`a7509b2`): voice Phase 3 drain, WASM worker offload, 120 Vitest
- **Wave 48** (`ec8ec35`): PATCH 401 fix + voice/editor UX bugs; 123 Vitest; pushed `main`
- **Tomorrow:** Groq deprecation email → discuss `docs/LLM_MODEL_SELECTION.md`; migrate `ai-provider.ts` (`GROQ_MODEL` still `llama-3.3-70b-versatile`)
- **Handoff:** `.agile-v/NEXT_SESSION.md`

## Wave 23 detail (historical)

- **Problem:** Remove confirm lost when editor open (Radix z-index race); nav clipped; shelf glow square.
- **Fix:** `pendingDeleteBookConfirm` / `pendingDeleteTarget` + effect after editor close; `.journal-nav-actions` wrap; `.journal-nav-shelf-slot` spotlight sibling.
- **Decision:** DEC-0048

## Session 2026-07-04

- Local `main` reset to `bb7612b` (matches GitHub + production).
- Uncommitted shelf→journal handoff / `/insights` / refresh-flash WIP preserved in `git stash` — not on branch (this is what `CLAUDE.md` calls "Wave 24–25"; superseded by the Wave 24 numbering below since that WIP never landed).
- Production: no refresh flash; localhost dev flash classified as dev-mode only (DEC-0049).
- **Wave 24 (this session):** journal book (`BookSpreadHeader` + `LeftPage` + `RightPage`) now plays the same auth-style row-by-row stagger wave on every mount (shelf click or hard refresh) — see Wave 24 detail below.

## Wave 24 detail (committed `430e51f`)

- **Problem:** Login/register book animates each row in a synchronized stagger wave on every mount, including refresh. The dashboard journal book had no equivalent — `BookSpreadHeader` never animated, `LeftPage` preview rows never animated (only the entry list, with a stale 0.68s legacy delay), and `RightPage` read content only animated after a page-turn flip (`flipDir` set) — never on initial mount/refresh.
- **Fix:** New `src/lib/journal-stagger.ts` mirrors `auth-stagger.ts` (`journalStaggerRowProps(index)` → `.journal-stagger-row` + `--journal-stagger-i`); reuses the existing `authRowIn` keyframe. Header icon/title/desc (0/1/2), `LeftPage` preview block + "All Entries" label + entry rows (0..5, then `Math.min(6+i, 16)`), and `RightPage` date row + read-mode title/body/tags/footer (0..4) each restart their own counter at 0 sharing the same 60ms step — identical "independent-counter-same-step" pattern already proven on `AuthBookShell`/`LoginForm`. Existing `.page-stagger-fwd/bwd` post-flip line-in and `.entry-list-stagger` CSS are untouched; only the entry-list markup switched to the new indexed class so its delay lines up with the rest of the wave instead of starting at 0.68s. Two opacity-conflict fixes applied (dimmed decorative "✦ ✦ ✦" ornament and non-current entry-list rows) by nesting the persistent dimming style on an inner wrapper, separate from the entrance-animation element, since CSS animation fill-mode `both` would otherwise permanently override an inline `opacity` on the same node.
- **Decision:** DEC-0050

## Wave 26 detail (committed `430e51f`)

- **Problem 1 (flip flash):** `PageFlipOverlay` only ever covered the right page; the left page had no overlay at all and both pages' real content stayed fully visible (no `visibility`/opacity gate) for the entire 650ms rotation + 80ms settle. `BookSpread` swapped `focusedEntryId` inside the flip's `onComplete` callback while `isFlipping` was still true for 80ms more — so the new entry's text became visible on the left page mid-rotation, and the old `page-stagger-fwd/bwd` line-in on the right page (post-overlay-unmount only) fought with the already-applied Wave-24 `.journal-stagger-row` (`animation-fill-mode: both`) sitting on the same nodes.
- **Fix 1:** `LeftPage`/`RightPage` now set `visibility: isFlipping ? "hidden" : "visible"` on their content-stack wrapper — exact same technique as `AuthBookShell`'s `contentReady` gate (no layout shift, since `visibility` keeps the box). `BookSpread` replaced the `lastFlipDir` state with a numeric `entryStaggerKey`, bumped alongside `focusedEntryId` in every page-turn's `triggerFlip` callback (navigate + all 3 newEntry branches — online, offline, offline-fallback), and passed as `key={entryStaggerKey}` on both `LeftPage` and `RightPage` so they remount and replay the Wave-24 `journalStaggerRowProps` entrance wave together the instant the flip reveals them. Delete-reassignment and offline-id-remap do **not** bump the key (no page-turn involved, and it would risk unmounting a live `JournalEditor` mid-write). Removed the now-fully-superseded `page-stagger-fwd/bwd` + `lineInRight/Left` + `entry-list-stagger` + `listItemIn` CSS blocks and the `flipDir`/`FlipDirection` prop plumbing on `RightPage`.
- **Problem 2 (entry lost on refresh):** `BookSpread`'s `focusedEntryId` `useState` initializer always picked `entries[length-1]` (entries ordered `createdAt asc`) with no persistence — a hard refresh remounts `BookSpread` from scratch and always re-derives the newest entry, discarding whichever entry was open.
- **Fix 2:** New `src/lib/journal-entry-url.ts` — `resolveInitialFocusedEntryId` (pure, server-safe) validates an incoming `?entry=` param against the book's real entry ids; `syncEntryUrlParam` mirrors the focused id into the URL via `window.history.replaceState` (never `router.replace`, to avoid an SSR round-trip on every next/prev click). `journal/[bookId]/page.tsx` reads `searchParams.entry`, resolves it server-side, and passes `initialFocusedEntryId` to `BookSpread`, which uses it in its `useState` initializer when present (falls back to "latest entry" identically for a fresh shelf-open with no `?entry=`) and syncs the URL via one `useEffect(() => syncEntryUrlParam(focusedEntryId), [focusedEntryId])`.
- **Decision:** DEC-0051, DEC-0052

## Key decisions (index)

DEC-0055–0060 Waves 27–32

## Verification (2026-07-06 EOD)

lint · typecheck · **123** Vitest · build — all PASS (Wave 48 `ec8ec35`) · e2e NOT in CI

## Next — suggested focus

1. **Groq / LLM** — review `docs/LLM_MODEL_SELECTION.md`; implement model fallback in `ai-provider.ts` (shutdown **2026-08-16**)
2. New feature/extension only with parent REQ-XXXX (e2e CI, shelf-handoff/`/insights` recovery from stash)
3. Do **not** chase localhost-only refresh flash unless `npm run build && npm start` reproduces it
4. Optional: recover stashed WIP via `git stash list` if re-implementing shelf handoff or insights

## Out of scope for UI waves

Cache invalidation paths · API routes · Prisma schema — unless REQ explicitly changes.
