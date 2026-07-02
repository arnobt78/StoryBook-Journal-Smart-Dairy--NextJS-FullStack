# Cycle C4 — UI Polish + Entry Tags (active)

**Status:** Stage 4 Verification — static PASS · **Wave 23 shipped** · resume UI Wave 24+

| Field | Value |
|-------|-------|
| CR | CR-0005 |
| REQs | REQ-0029, REQ-0030, REQ-0031 |
| Commits | `91bea2a` … `7de8fc6` |
| ARTs | ART-0068–0098 |
| Unit tests | **55** Vitest PASS |

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
| **23** | Defer delete confirm; nav flex-wrap; shelf glow outside button | `BookSpread`, `BookShelf`, `globals.css` |

## Wave 23 detail (latest)

- **Problem:** Remove confirm lost when editor open (Radix z-index race); nav clipped; shelf glow square.
- **Fix:** `pendingDeleteBookConfirm` / `pendingDeleteTarget` + effect after editor close; `.journal-nav-actions` wrap; `.journal-nav-shelf-slot` spotlight sibling.
- **Decision:** DEC-0048

## Key decisions (index)

DEC-0021–0024 tags · DEC-0032–0037 dialog/spine (17–17c) · DEC-0041–0043 landing handoff · DEC-0044–0045 auth/OAuth · DEC-0046–0047 journal header/nav · **DEC-0048 Wave 23**

## Verification (2026-06-29)

lint · typecheck · **55** Vitest · build PASS · e2e NOT in CI

## Tomorrow — suggested UI focus

1. Visual QA Wave 23 flows (manual).
2. New screenshot issues → Wave 24 plan (ux-spec-author).
3. Optional: Playwright case for edit→remove confirm defer.

## Out of scope for UI waves

Cache invalidation paths · API routes · Prisma schema — unless REQ explicitly changes.
