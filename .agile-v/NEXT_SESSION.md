# Next session resume — 2026-07-07+

<!-- Agent: read after STATE.md when resuming work -->

## Shipped (2026-07-07)

| Wave | Theme |
|------|-------|
| **49** | Groq model migration — `ai-provider.ts` shuffle chains, dynamic toasts, `docs/LLM_MODEL_SELECTION.md` |
| **50** | AI reasoning hidden (`reasoning_format: hidden`) + write-footer button box-model parity |
| **51** | Book-clip parity (`overflow:clip` 220px) + direction-aware flip seam + AI writing status anim + edit no-flash (preload/stagger) |
| **51c** | Footer button height parity (read=write) + voice banner glow un-clip + phone bottom nav slimmer + write-panel hover-glow parity (`overflowX:clip`/`overflowY:visible`) |
| **52** | API status instant shell — page.tsx auth+header SSR only; `ApiStatusClient` client-fetch + inline skeleton (no blocking `getApiStatus`) |
| **53** | API status polish — error+retry card, `useApiPagesPrefetch` on profile dropdown, doc comment fix |
| **54** | API status value-only skeleton — unified tree; static chrome + badge/number chips only |

**Verify:** `npm run verify` · **132** Vitest · build PASS

## Wave 54 summary

- Deleted `ApiStatusDataSkeleton`; single unified tree with `loading = !status`.
- Static chrome (icons, titles, labels, descriptions) always visible; only badges, stat numbers, last-checked line pulse.
- `StatusStatGrid` + `StatusDependencyCard` accept `loading`; `.api-status-value/badge/line-skeleton` chips.
- DEC-0089

## Wave 53 summary

- Stale doc comments in `api-status-server.ts` + `api/status/route.ts` aligned with Wave 52.
- `ApiStatusClient` — `isError` → `ApiStatusErrorCard` + Try again (`refetch`); `.api-status-retry-btn` in globals.css.
- `useApiPagesPrefetch` — profile menu `onOpenChange` warms `/api-status` + `/api-documentation` routes + TanStack cache.
- DEC-0088

## Wave 52 summary

- `/api-status` — removed blocking `await getApiStatus()` from page.tsx (0.5–2s RSC hang); static shell+header SSR instantly; `ApiStatusClient` fetches `/api/status` with inline `.skeleton` (no `initialData`).
- Invalidation unchanged — `queryKeys.apiStatus()` via `notifyJournalCacheUpdated`.
- `/api-documentation` unchanged (sync catalog, already instant).
- DEC-0087

## Wave 51 summary

- Journal book tilted row projected ~16px past pinned width → `overflow:hidden` cut right corner at rest, `visible` on flip revealed it. Fix: md+ `.journal-route-viewport .book-spread-scroll-port { overflow: clip; overflow-clip-margin: 220px }`. Auth (no tilt) untouched. Runtime-log verified.
- `.spread-coil-flipping--fwd` pins forward-turn coil shadow (no reveal flash).
- `JournalWriteFooter` `VoiceAnimatedStatus` (Sparkles) while thinking; empty-stream → sync fallback.
- Edit no-flash: `immediatelyRender:true` + `JournalEditor` preload + write-panel stagger + `entryStaggerKey` bump.
- CR-0008 / DEC-0084, DEC-0085

## Wave 50 summary

- Groq requests: `reasoning_format: "hidden"`, `max_tokens: 700`
- OpenRouter requests: `reasoning: { exclude: true }`
- `stripReasoning()` sync safety net for ``/`<reasoning>` tags
- Write footer: shared `box-sizing`/`min-height:30px`; Save `border:1px solid transparent`; mobile 36×36 `box-sizing`
- TC-0046 extended: `ai-provider.test.ts` (9 Vitest)
- CR-0007 / DEC-0083

## Backlog (unchanged)

- REQ-0021 e2e in CI
- Roll `auth()` wrapper to books/entries POST (optional)
- DRY `journal-api` through `journalFetch` for all mutations

## Do not redo

- Groq migration — done Wave 49
- AI reasoning leak — fixed Wave 50
- Book right-corner clip / flip width pop — fixed Wave 51 (don't reintroduce blanket `overflow:visible` at rest — use `clip`+margin)
- Footer button height / voice banner + hover glow clip — fixed Wave 51c (write-panel root `overflowX:clip`+`overflowY:visible`; don't set root `overflow:hidden`)
- Voice stop / Quick transcript — fixed Wave 48
- Entry save 401 pilot — entries route only; working in dev
