# Agile V State

<!-- Living document — write-through on every stage transition -->

| Field | Value |
|-------|-------|
| **Project** | storybook-journal (StoryBook Journal SaaS) |
| **Repository** | https://github.com/arnobt78/StoryBook-Journal-Smart-Dairy--NextJS-FullStack |
| **Cycle** | **C4** |
| **Revision** | C4-ui-wave28-2026-07-05 |
| **Last commit** | `0544490` (Wave 27–28: header brand + nav scroll isolation) |
| **Current Stage** | 4 — Verification (static PASS; e2e partial) |
| **Stage Status** | `IN_PROGRESS` |
| **Last Gate** | Gate 1 — **Approved** (GATE-0001, GATE-0003, CR-0005) |
| **Next Gate** | Human Gate 2 — REQ-0021 full e2e in CI |
| **eval_gate_status** | `CONDITIONAL` |
| **resume_token** | — |
| **Active Phase Dir** | `phases/04-verification/` |
| **Last Updated** | 2026-07-05T09:20:00Z |
| **Updated By** | build-agent-js (Wave 27–28 + doc sync) |

## Resume (2026-07-05)

1. Read this file → `cycles/C4/README.md` → `PLAYBOOK.md` → latest `DEC-0056`.
2. **Code baseline:** `430e51f` + uncommitted Wave 27 (header brand) + Wave 28 (nav scroll isolation).
3. **Production:** Vercel deploy pending sync to `430e51f`; prior `bb7612b` had no refresh flash in prod browser.
4. **Localhost dev flash:** dev-mode artifact (Turbopack, cold session fetch, incognito no-cache) — **do not refactor** unless reproduced with `npm run build && npm start`.
5. **Wave 26 fix:** page-turn flash was caused by `RightPage`/`LeftPage` content always being painted (no `visibility` gate) while the previous entry's text was still on screen during the 650ms flip — now hidden via `visibility` like `AuthBookShell`, and both pages remount on `entryStaggerKey` post-flip to replay the Wave-24 stagger together. Entry-selection-lost-on-refresh fixed via server-resolved `?entry=` param (`journal-entry-url.ts`) + `history.replaceState` mirror (no extra SSR round trip per flip).
6. **Next backlog (REQ-gated):** REQ-0021 e2e CI · optional shelf-handoff/`/insights` recovery from stash (separate REQ scope) if requested.
7. **Constraints unchanged:** `notifyJournalCacheUpdated` only; `force-dynamic`; SSR in `page.tsx`.
8. Verify before commit: `npm run lint && npm run typecheck && npm run test` (67 Vitest PASS) + `npm run build`. Wave 26b Fragment key fix user-verified (DEC-0053).

## Stage checklist

| Stage | Status | Evidence |
|-------|--------|----------|
| 1 Requirements | **COMPLETE** | REQ-0001–0031; CR-0001–0005 |
| 2 Validation | **COMPLETE** | `phases/02-validation/SUMMARY.md` |
| 3 Synthesis | **COMPLETE** | ART-0001–0098; commits through `bb7612b` |
| 4 Verification | **IN_PROGRESS** | **68** Vitest PASS (2026-07-05); lint/typecheck/build PASS |
| 5 Acceptance | NOT_STARTED | — |

## Cycle rollup

| Cycle | Theme | Key commits | REQs |
|-------|-------|-------------|------|
| C1 | Foundation + offline + guardrails | 22fa6ef, 72bb670 | REQ-0001–0012, 0015, 0023–0028 |
| C2 | Platform upgrade (Redis, TipTap, SSE, search) | 2b82b39 | REQ-0013–0014, 0016–0018 |
| C3 | Consistency hardening | 7d3c3ed | REQ-0007, 0014, 0017–0018, 0021 |
| C4 | UI polish + leather glass + entry tags | 91bea2a→`bb7612b` | REQ-0029–0031 |

## C4 UI waves (shipped on main)

| Wave | Theme | REQ | Commit hint |
|------|-------|-----|-------------|
| 1–2 | UI polish + leather glass + tags | 0029–0031 | early C4 |
| 3 | Self-hosted fonts, landing/auth/dashboard glows | 0029–0030 | — |
| 8–13 | Auth stagger, coil, flip polish | 0029–0030 | — |
| 15–17c | Dashboard shelf, journal dialog, spine mark | 0029–0030 | fe8f261 |
| 18–18e | Landing→auth handoff + crossfade | 0005, 0029 | — |
| 19 | Auth CTA loading until dashboard | 0004–0005 | — |
| 20 | OAuth toast + logout 3D close | 0004–0005, 0029 | — |
| 21 | Journal ink, golden header, shelf tooltips | 0029–0030 | — |
| 22 | JournalBottomNav, confirm priority, paper actions | 0029–0030 | — |
| **23** | **Defer delete confirm, nav wrap, shelf glow unclip** | **0029–0030** | **fe6abd9→bb7612b** |
| **24** | **Journal book row stagger (header + left/right pages) — mirrors auth-stagger** | **0029–0030** | `430e51f` |
| **26** | **Flip anti-flash + `?entry=` persistence** | **0002–0003, 0029–0030** | `430e51f` |
| **27** | **Spread header desc Dancing Script parity + x-axis align** | **0029–0030** | uncommitted |
| **28** | **Nav outside `.dashboard-scroll` — profile avatar shift fix** | **0029–0030** | uncommitted |

## C4 non-UI (stable — do not regress)

| Area | REQ | Status |
|------|-----|--------|
| Invalidation single entry | REQ-0007 | ✅ `journal-cache-notify.ts` |
| SSR + force-dynamic | REQ-0003 | ✅ page.tsx pattern |
| Offline + optimistic | REQ-0015 | ✅ unchanged |
| Vitest unit | REQ-0021 | ✅ 67 tests |

## Backlog (not on main)

Shelf→journal handoff · `/insights` page · localhost refresh-flash experiments (all stashed, referenced as "Wave 24–25" in `CLAUDE.md` — distinct from the Wave 24 journal-stagger work above) · REQ-0021 full e2e in CI · REQ-0019 Pino/Sentry · REQ-0009 prod demo gate · REQ-0022 axe audit

## Resume protocol

1. Read this file + **`PLAYBOOK.md`** + `.cursor/rules/agile-v.mdc`.
2. Load `agile-v-core` skill; domain per `skills/SKILLS_INDEX.md`.
3. If `CHECKPOINTS.md` has `PENDING`, match `resume_token` in `APPROVALS.md`.
4. Load only current `phases/XX-*/` files.

## Infinity Loop

```
Specify → Constrain → Orchestrate → Prove → Evolve → Verify
     ↑___________________________________|
```
