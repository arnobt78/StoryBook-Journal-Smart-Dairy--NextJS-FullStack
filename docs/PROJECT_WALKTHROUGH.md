# Storybook Journal — Project walkthrough

This document is a **persistent map** of the repository: what the product is, how requests flow, where data lives, and how that lines up with deployment (including a Hetzner-style VPS PostgreSQL setup). It is meant to be read months later without re-auditing the whole tree.

---

## 1. What this project is

**Storybook Journal** is a Next.js 16 web app that presents a **leather-bound, two-page “book spread”** journal. Users:

- Register (email + password) or use optional **Google OAuth** (when env vars are set).
- Land on a **dashboard** showing journal “books” on a shelf.
- Open a book at `/journal/[bookId]` and flip through **entries** (TipTap-style rich HTML content, moods, weather, tags).
- Create books and entries via **REST Route Handlers** under `src/app/api/**`, backed by **Prisma** and **PostgreSQL**.

Deployment target is **Vercel** for the app; `docker-compose.yml` is an optional local Postgres helper only.

---

## 2. Tech stack (authoritative)

| Area | Choice |
|------|--------|
| Framework | Next.js 16 App Router (`src/app`) |
| UI | React 19, Tailwind 3, heavy **inline styles** for the book aesthetic |
| Auth | **NextAuth v5** — JWT sessions, Credentials + optional **Google OAuth** |
| ORM / DB | **Prisma 6** + **PostgreSQL** (`DATABASE_URL` + `DIRECT_URL`) |
| Validation | **Zod** (`src/lib/validations.ts`) |
| Client data fetching | **TanStack Query** — `queryKeys.journalSubtree()` invalidation on all journal CRUD + auth flows |
| Animations | Custom page-flip hook + overlay (`usePageFlip`, `PageFlip`) |
| Toasts | **Sonner** via `appToast` (icon + title + subtitle, bottom-right) |
| AI | Groq → OpenRouter → Anthropic legacy; `/api/ai/assist` + `/stream`; Upstash Redis rate limit (in-memory fallback) |
| Realtime | Upstash Redis pub/sub + `GET /api/journal/events` SSE; `useJournalRealtime` invalidates `journalSubtree` |
| Editor | **TipTap** `JournalEditor` (dynamic `ssr:false` in RightPage) |
| Search | `GET /api/search` — Prisma scoped; wired to ⌘K `CommandPalette` |
| Themes | `BOOK_THEMES` + `useBookTheme` — page CSS vars per `JournalBook.theme` |
| UX | `RippleButton` global click effect; `DashboardCommandProvider` (palette + realtime bridge) |
| Images | `SafeImage` for remote avatars; `next.config` `remotePatterns` (Google, GitHub, Robohash) |
| Offline | IndexedDB drafts + sync queue (`patchEntry`, `postEntry`, `patchBook`, `postBook`); `OfflineSyncContext`; optimistic cache + `notifyJournalCacheUpdated`; shelf hover prefetch |
| Production guardrails | `next.config` + `vercel.json` security/cache headers; `robots.ts`; dashboard `noindex`; `force-dynamic` on dashboard/journal pages |
| SEO | `src/lib/site-metadata.ts` — OG/Twitter/keywords; author Arnob Mahmud |
| Production | **Vercel** — https://storybook-journal.vercel.app |

---

## 3. Repository layout (high signal)

```
src/app/
  page.tsx                    # Landing → redirect if logged in
  layout.tsx, providers.tsx   # SessionProvider, QueryClient, OfflineSyncProvider, Toaster
  robots.ts                   # disallow /api, /dashboard, /journal; block AI scrapers
  (auth)/login, register      # Auth pages + forms
  (dashboard)/
    layout.tsx                # auth gate; DashboardClientShell (no outer scroll wrapper)
    dashboard/page.tsx        # SSR: list books, render BookShelf
    journal/[bookId]/page.tsx # SSR: load book + entries, render BookSpread
  api/
    auth/[...nextauth]/       # NextAuth GET/POST
    auth/register/            # Email registration + seed book/entry
    books/, books/[bookId]/   # Journal CRUD (+ afterJournalMutation publish)
    entries/, entries/[entryId]/
    search/                   # Scoped entry search (GET)
    journal/events/           # SSE realtime stream (force-dynamic)

src/lib/
  db.ts                       # PrismaClient singleton (dev HMR guard)
  auth.ts                     # NextAuth + Google signIn → provisionOAuthUser
  auth/provision-oauth-user.ts # Google user + welcome journal transaction
  auth/is-google-enabled.ts   # Server-only OAuth env check
  auth/google-oauth-env.ts    # GOOGLE_CLIENT_* + legacy GOOGLE_ID/SECRET aliases
  auth/get-auth-page-config.ts # SSR flags for login/register (force-dynamic)
  query-keys.ts               # journalSubtree() — single invalidation root
  journal-slug.ts             # resolveUniqueBookSlug / resolveUniqueEntrySlug on PATCH title change
  journal-stagger.ts          # journalStaggerRowProps — row entrance wave (mirrors auth-stagger)
  journal-entry-url.ts        # ?entry= SSR resolve + history.replaceState sync (refresh persistence)
  journal-cache-optimistic.ts # optimistic shelf/reader patches for offline writes
  journal-cache-notify.ts     # notifyJournalCacheUpdated (invalidate subtree; refetchType none when offline)
  journal-pubsub.ts           # Redis publish + list buffer for SSE poll
  journal-mutation.ts         # afterJournalMutation — called post-Prisma write
  redis.ts                    # Upstash singleton (null when env missing)
  ai-provider.ts              # Groq → OpenRouter → Anthropic
  app-toast.tsx               # Unified Sonner presets
  search.ts                   # Search query Zod + SearchHit type
  offline/                    # IndexedDB drafts + sync queue + offline-journal-actions
  site-metadata.ts            # Central SEO metadata for root layout
  ai-assist.ts, ai-rate-limit.ts
  validations.ts              # Zod schemas shared by API routes
  utils.ts                    # slugify, tags JSON, word counts, dates

src/context/
  OfflineSyncContext.tsx      # pendingCount badge + sync processor

src/constants/
  offline.ts                  # temp id prefixes + sync browser events

src/hooks/
  useOfflineSyncQueue.ts      # FIFO drain, id remap, defer until postEntry/postBook syncs
  useOfflineEntryDraft.ts     # IndexedDB draft persist/restore
  useOfflineIdRemap.ts        # temp entry/book id → server cuid after sync
  useJournalPrefetch.ts       # shelf hover → prefetch route + bookDetail query
  useJournalRealtime.ts       # EventSource → notifyJournalCacheUpdated (multi-tab)
  useBookTheme.ts             # CSS vars from JournalBook.theme

src/components/ui/
  safe-image.tsx              # next/image + fallbackSrc (Robohash) + native img fallback
  ripple-button.tsx           # Global click ripple + optional cta-shine
  command.tsx                 # cmdk primitives for palette

src/components/editor/
  JournalEditor.tsx           # TipTap — StarterKit, Placeholder, Typography

src/components/journal/
  CommandPalette.tsx          # ⌘K search + navigate + actions
src/components/layout/
  DashboardCommandProvider.tsx # Mounts palette + JournalRealtimeBridge

src/components/auth/
  AuthOAuthSection.tsx        # "or" + Google below primary CTA (login + register)
  GoogleSignInButton.tsx      # OAuth redirect + localStorage anti-flicker flags
  OAuthReturnSync.tsx         # Post-OAuth journalSubtree invalidation
  AuthOrSeparator.tsx         # "or" divider
  AuthBookShell.tsx           # Book spread; prefetches /login ↔ /register

prisma/schema.prisma          # User, JournalBook, JournalEntry (+ relations)
```

There **is** a `prisma/migrations/` directory (init migration committed). Local/prod may use `db push` or `migrate deploy`.

---

## 4. Data model and integrity

Prisma models (`prisma/schema.prisma`):

- **User** — `id` (cuid), `email` unique, `passwordHash` (null if OAuth-only path were added later), profile fields, `books` / `entries` relations.
- **JournalBook** — belongs to `User`; `@@unique([userId, slug])`; cascade delete from user.
- **JournalEntry** — belongs to `User` and `JournalBook`; `@@unique([bookId, slug])`; indexes on `userId`, `bookId`, `createdAt`; `tags` stored as a **string** (JSON array serialized in app code, not a native SQL array type).

**Foreign keys:** Expressed as Prisma `@relation` with `onDelete: Cascade`. On **PostgreSQL**, Prisma generates real FK constraints. On **SQLite**, Prisma also enforces referential behavior via the schema it manages. **You do not need to hand-wire “foreign key connections”** beyond keeping this schema; switching the datasource to `postgresql` preserves the same relation semantics.

---

## 5. Authentication and authorization

- **Proxy** (`src/proxy.ts`, Next.js 16+): uses `auth()` from NextAuth at the edge boundary. Protects `/dashboard` and `/journal`; sends unauthenticated users to `/login` with `callbackUrl`. Matcher **excludes** `api`, `_next/static`, `_next/image`, `favicon.ico` so API routes handle their own auth.
- **Session strategy:** JWT (`session: { strategy: "jwt" }`). User id is copied from DB user into the token and then into `session.user.id` via callbacks.
- **Credentials login:** `authorize` loads user by email, bcrypt compare, updates `lastLoginAt`.
- **Google OAuth:** When `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (or legacy `GOOGLE_ID` / `GOOGLE_SECRET`) are set, **login and register** show Gmail **below** the primary button (`Open My Journal` / `Begin My Story`) via `AuthOAuthSection`. `signIn` callback → `provisionOAuthUser()` (Prisma user + welcome book on first login). Redirect `/dashboard`; `OAuthReturnSync` invalidates `journalSubtree()`.
- **Auth CTA loading (Wave 19):** Credential submit keeps `loading` true (spinner + pending label) until the form unmounts on dashboard navigation — `setLoading(false)` only on API/sign-in errors. Google OAuth shows `AuthCtaSpinner` beside "Redirecting…".
- **OAuth welcome toast (Wave 20):** `OAuthReturnSync` on dashboard mount reads `OAUTH_PENDING_KEY` + `OAUTH_VARIANT_KEY`; shows `welcomeBack` or `registered` then `notifyJournalCacheUpdated`.
- **Logout animation (Wave 20):** `useSignOutWithBookClose` drives `LogoutBookCloseOverlay` (spread fold → hinge close → 360° orbit) for nav dropdown and ⌘K sign-out.
- **Journal readability (Wave 21, 31):** `journal-page-styles.ts` + `bookThemeCssVars()` — spread ink/lines/buttons read `--theme-*` per `BOOK_THEMES` (Dark Academia + Midnight Journal light ink).
- **Golden book header (Wave 21, 27):** `BookSpreadHeader` — icon + Dancing Script title + truncated description (same font, nowrap row); tooltip for full meta.
- **Login demo picker (Wave 29–30):** `.auth-demo-trigger` 3-zone layout + chevron rotate; selected state shows Robohash + `TEST_ACCOUNT_DISPLAY_NAME` via `isDemoAccountSelected()`.
- **Dashboard shell (Wave 28):** `.dashboard-shell` nav outside `.dashboard-scroll`; `scrollbar-gutter: stable`.
- **Shelf tooltips (Wave 21):** `BookShelf` spine hover shows title + description via `ui/tooltip.tsx`; `TooltipProvider` in `DashboardClientShell`.
- **Journal nav polish (Wave 22):** `JournalBottomNav` — shelf spotlight, per-button hover + tooltips; `.journal-paper-action-btn` darker hover on read footer.
- **Wave 41 (2026-07-06):** Auth `StoryBook` → `/`; demo-picker fixed avatar slots; dashboard nav brand spotlight + profile hover glow; bottom nav **New journal** (`BookPlus`, still `onNewEntry`); create modal title **Create Journal**.
- **Confirm stacking (Wave 22):** `ConfirmDialog` `priority` prop; close `BookEditorModal` before delete confirm; paper dialog footer band removed.
- **Nav defer confirm (Wave 23):** `pendingDeleteBookConfirm` / `pendingDeleteTarget` — confirm opens after editor unmounts (fixes Radix z-index race).
- **Nav layout (Wave 23):** `.journal-bottom-nav` flex-wrap + `max-width`; `.journal-nav-actions` groups New/Edit/Remove; tooltips on shelf + arrows only.
- **Shelf glow (Wave 23):** Spotlight moved outside `RippleButton` (`.journal-nav-shelf-slot`); `overflow: visible` on nav pill.
- **Auth layout:** `(auth)/layout.tsx` uses `.auth-book-viewport` — book spread ≈ **85vw × 85vh** (scoped `--page-w` / `--page-h`; dashboard journal keeps `:root` defaults). Both auth pages use `export const dynamic = "force-dynamic"` + `getAuthPageConfig()`.

API routes consistently call `await auth()` and check `session?.user?.id` before Prisma calls, and use `userId` / `findFirst({ where: { id, userId }})` patterns to avoid cross-user access.

---

## 6. Request and UI workflow

### 6.1 Registration

1. `POST /api/auth/register` validates body with `registerSchema`.
2. If email exists → 409.
3. Creates `User`, default `JournalBook` (“My Journal”), and a welcome `JournalEntry` in one flow.

### 6.2 Dashboard

1. `dashboard/page.tsx` is a **Server Component**: `auth()` then `prisma.journalBook.findMany` for the session user.
2. `BookShelf` (client) uses TanStack Query with SSR `initialData`; hover prefetches `/journal/[bookId]` + `bookDetail` cache via `useJournalPrefetch`.
3. Offline book CREATE enqueues `postBook`, optimistic shelf seed, navigates to temp book id until sync remaps URL.

### 6.3 Journal reader

1. `journal/[bookId]/page.tsx` is a **Server Component**: loads book + non-archived entries ordered by `createdAt` asc; maps `tags` from stored string via `parseTags`; resolves optional `?entry=` via `resolveInitialFocusedEntryId` (SSR-safe).
2. `BookSpread` (client) holds **entries**, current index, write mode, draft, save state. It:
   - **Patches** the current entry via `PATCH /api/entries/[entryId]` on explicit save.
   - **Posts** new entries via `POST /api/entries` with client-supplied `entryDate` / `weekday` (API overwrites with `formatEntryDate()` anyway — minor redundancy).
   - **Page flip (Wave 26):** `visibility` gate on left/right content during flip; `entryStaggerKey` on `<Fragment>` remounts both pages for stagger replay; `syncEntryUrlParam` mirrors focus to `?entry=` (no router round-trip per turn).
   - **Row stagger (Wave 24):** `journalStaggerRowProps` on header + left/right rows (60ms step, reuses `authRowIn`).
3. `useAutoSave` debounces PATCH; offline path uses optimistic cache + sync queue + `notifyJournalCacheUpdated`. `useOfflineEntryDraft` persists/restores drafts.
4. Offline entry CREATE/PATCH/BOOK PATCH/BOOK CREATE all enqueue to IndexedDB; `DashboardNav` shows `{n} offline` badge; drain on `online` invalidates `journalSubtree`.
5. Temp ids (`offline-entry-*`, `offline-book-*`) remap to server cuids via `useOfflineIdRemap` + sync events — reader focus preserved after sync.
6. **DELETE UI** — `ConfirmDialog` + `journalSubtree` invalidation.
7. **PATCH book UI** — `BookEditorModal` on shelf + reader; slug sync on title change (`journal-slug.ts`).
8. **AI assist** — Groq primary; SSE stream + sync fallback; `assistSessionId` dedupes; Redis rate limit (10/min) with in-memory dev fallback.
9. **TipTap** — write mode uses `JournalEditor`; read mode `.journal-prose` HTML.
10. **Realtime** — other tabs receive SSE events → `notifyJournalCacheUpdated` (debounced toast).
11. **Themes** — `BookEditorModal` theme picker; `useBookTheme` on spread wrapper.
12. **⌘K** — `CommandPalette` search + journal navigation.

### 6.4 API summary

| Method | Path | Role |
|--------|------|------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth |
| POST | `/api/auth/register` | Register + seed data |
| GET, POST | `/api/books` | List / create books |
| GET, PATCH, DELETE | `/api/books/[bookId]` | Book + entries payload, update, delete |
| POST | `/api/entries` | Create entry (checks book ownership) |
| POST | `/api/ai/assist` | Sync AI assist (rate limited) |
| POST | `/api/ai/assist/stream` | SSE AI assist stream |
| GET | `/api/search` | Entry search (title/content, scoped) |
| GET | `/api/journal/events` | SSE journal mutation stream |
| GET | `/api/health` | Public liveness probe |
| GET | `/api/status` | Auth — DB/Redis/AI deps + platform/personal aggregate counts |
| GET | `/api/openapi` | Auth — OpenAPI-shaped route catalog JSON |
| GET | `/api-documentation` | Auth UI — Swagger-style docs (Overview / Endpoints / Schemas) |
| GET | `/api-status` | Auth UI — live status dashboard |

---

## 7. Cache & invalidation (verified)

| Event | Mechanism |
|-------|-----------|
| Online CRUD | `invalidateQueries({ queryKey: queryKeys.journalSubtree() })` |
| Offline write | Optimistic `setQueryData` + `notifyJournalCacheUpdated` (`refetchType: "none"` offline) |
| Sync drain | `useOfflineSyncQueue` → API → id remap events → `notifyJournalCacheUpdated` |
| Auth login/register/OAuth | `journalSubtree` invalidation |
| Sign-out | `queryClient.clear()` before `signOut()` |
| Shelf hover | `useJournalPrefetch` — route + `bookDetail` prefetch |
| Other-tab mutation | SSE → `useJournalRealtime` → `notifyJournalCacheUpdated` |
| Server write | `afterJournalMutation` → Redis publish (fire-and-forget) |
| All client CRUD | **Only** `notifyJournalCacheUpdated` in `journal-cache-notify.ts` |
| API status page | Same helper invalidates `queryKeys.apiStatus()` — personal counts refresh on CRUD |

SSR: dashboard/journal pages fetch server-side; client `useQuery` uses SSR `initialData` with `staleTime: 60_000`.

---

## 8. Deployment shape (conceptual)

```mermaid
flowchart LR
  Browser[Browser]
  Next[Next.js app]
  Prisma[Prisma Client]
  DB[(PostgreSQL)]

  Browser --> Next
  Next --> Prisma
  Prisma --> DB
```

- **Local:** PostgreSQL via `.env` (`DATABASE_URL` + `DIRECT_URL`). Optional: `docker compose up -d db` for a throwaway local instance (see `docker-compose.yml`).
- **Production:** Next.js on **Vercel**; database on hosted/self-managed Postgres (not Docker in this repo).

---

## 9. Audit notes (2026-06-01 — C2)

### Verified passing

- `npm run lint` / `typecheck` / `test` / `build` — pass (stop `dev` before build, or `rm -rf .next`)
- `npm run test:e2e` — pass with `dev` on :3000 + `test:e2e:install` (2 pass, 1 skip w/o seed)
- C2 waves 1–8: Redis, AI provider, toasts, ripple, TipTap, SSE realtime, search, ⌘K palette, themes
- Server `afterJournalMutation` on all books/entries routes
- Client `journalSubtree` invalidation on CRUD + auth + offline + SSE
- `force-dynamic` on dashboard/auth/journal pages + search/events APIs
- `.agile-v/` CR-0003; REQ-0013–0018 → implemented

### C3 hardening (2026-06-01)

1. **Invalidation** — all client paths use `notifyJournalCacheUpdated` / `AndRefetch` (no raw `journalSubtree` elsewhere).
2. **⌘K theme** — `Cycle page theme` in CommandPalette when on `/journal/[bookId]`.
3. **SSE** — adaptive 500ms poll, `?since=` reconnect, stream `cancel()` cleanup, hidden-tab pause.
4. **Tests** — Vitest 12 unit; Playwright 3 e2e smoke (`npm run test:e2e:install` once, dev on :3000); theme-cycle skips if shelf empty; CI has no e2e.
5. **Demo login** — on by default; `SHOW_DEMO_LOGIN=false` for prod.

### UI polish (2026-06-01)

1. **Landing** — `--cover-w/h` 80% viewport; scaled cover typography; `TypewriterText` CTA; Lucide icons on CTAs; fixed `RippleButton` shine wrap.
2. **Auth** — `.book-viewport-80`; unified `auth-form-styles`; demo robohash avatar; Clear Section disabled when fields empty; Google button matches primary shape.
3. **Journal** — `JournalWriteFooter` / `JournalReadFooter`; readable AI Assist; nav icons; welcome toast `HandMetal` + Sonner gap.

### Leather glass polish — wave 2 (2026-06-01)

1. **Tokens** — `leather-glass-styles.ts` + `.leather-glass-*` utilities in `globals.css` (amber/leather glassmorphism from `UI_STYLING_GUIDE`).
2. **Landing** — closed cover **70%** viewport with vertical padding; CTA icons inline with labels (no `display:inline-block` override); glass primary/outline buttons.
3. **Auth** — `AvatarRing` + `DemoAccountMenuRow` (inline name · email, equal row heights); glass panel/inputs on login/register/Google.
4. **Nav + toast** — `DashboardNav` circular `AvatarRing`; `RippleButton` skips default radius unless shine; `.journal-toast` centers Sonner icon vertically.
5. **Journal chrome** — `.leather-glass-nav-pill` on spread nav; `.leather-glass-action-btn` on footers; paper pages stay flat (no blur).
6. **Dev** — `next.config.ts` immutable `Cache-Control` on `/_next/static` production-only (fixes lucide HMR stale chunk in dev).

**Contrast pass (2026-06-07):** Landing CTA gold text/icons (`f746a53`). Auth inputs: outer amber glow (no inset), dim leather placeholders; Google OAuth uses `leather-glass-btn-outline-paper` (dark text + border on cream).

**Tags:** `mergePendingTag()` on blur/save; `JournalEntryTagsEditor` (× remove in edit); read `JournalEntryTags`; `minHeight:0` scroll.

**Audit:** W1–W6 + contrast fixes complete. No invalidation/SSR/query regressions. `lint` · `typecheck` · 12 vitest · `build` pass (`rm -rf .next` if dev running).

---

## 10. SQLite vs PostgreSQL on the VPS (recommendation)

| Concern | SQLite on VPS | PostgreSQL on VPS |
|--------|----------------|-------------------|
| Multiple Next.js instances / horizontal scale | Poor fit (single writer, file locking) | Good |
| App and DB on different machines (e.g. Vercel → DB) | Awkward (network file or sync pain) | **Natural fit** (your guide’s pattern) |
| Concurrent writes (autosave, many users) | Weaker | **Stronger** |
| Prisma FKs / relations | Supported | **Supported** with mature tooling |
| Ops / backups | File copy | **pg_dump**, volume snapshots, Coolify backups as in guide |

**Recommendation for this project:** Use **PostgreSQL everywhere** (local `.env` and production). The app deploys on **Vercel**; optional `docker-compose.yml` runs **only Postgres** for devs who do not use a remote database.

**Foreign keys:** Keep defining relationships in `schema.prisma` as today. After switching `provider = "postgresql"`, run `prisma generate` and apply schema with **`prisma db push`** (as your guide stresses for permission/shadow-DB issues) or `migrate deploy` once you have a clean migration story.

Optional: add `directUrl` in `schema.prisma` if you use connection poolers (PgBouncer); your migration guide mentions `DATABASE_URL` and `DIRECT_URL` for Prisma.

---

## 11. Short answer: creating the database on the VPS (terminal)

Aligned with **`docs/HETZNER_VPS_MIGRATION_GUIDE.md`** (generic project names — substitute your container name if yours differs):

1. **SSH** to the server (`ssh deploy@YOUR_VPS_IP`).
2. **Open psql inside the Postgres container:**  
   `sudo docker exec -it YOUR_POSTGRES_CONTAINER_NAME psql -U postgres`
3. **Run SQL** (naming convention from the guide, e.g. `storybook_journal_db` / `storybook_journal_user`):
   - `CREATE DATABASE storybook_journal_db;`
   - `CREATE USER storybook_journal_user WITH PASSWORD 'strong_password';`
   - `GRANT ALL PRIVILEGES ON DATABASE storybook_journal_db TO storybook_journal_user;`
   - `\c storybook_journal_db`
   - Grant **schema** privileges on `public` (critical for Prisma):  
     `GRANT ALL ON SCHEMA public TO storybook_journal_user;`  
     plus the `ALL TABLES` / `ALL SEQUENCES` / `ALTER DEFAULT PRIVILEGES` statements as in the guide’s Step 2 block.
4. **Point the app** at `postgresql://storybook_journal_user:...@HOST:PORT/storybook_journal_db` (internal `5432` vs exposed `25432` per your setup).
5. **Locally or in CI:** set `provider = "postgresql"` in `schema.prisma`, set `DATABASE_URL`, then `npx prisma generate` and **`npx prisma db push`** (per guide preference over `migrate dev` on restricted users).

That is the full loop: **terminal → Postgres in Docker → DB + user + schema grants → connection string → Prisma generate + db push.**

---

## 12. C4 UI Polish Wave 3 (2026-06-28)

### What changed
| Area | Files | Details |
|------|-------|---------|
| Self-hosted fonts | `public/fonts/` (15 WOFF2), `src/app/globals.css` | Replaced Google Fonts `@import` with `@font-face`; fonts: Playfair Display, Lora, IM Fell English, Dancing Script; `font-display:swap`; no external dependency |
| Landing cover | `BookCover.tsx`, `TypewriterText.tsx` | Dancing Script "Journal" title, open-book emoji ornament, subtitle; `.text-shine` gold shimmer on typewriter hint (coexists with `.breathe` opacity pulse); radial amber spotlight orb behind hint; `.cta-splash-glow` on CTA row |
| Auth spotlight | `AuthBookShell.tsx` | Radial leather glow `div` (`zIndex:0`) behind open spread; `.auth-book-glow` box-shadow class; `zIndex:1` on spread preserves preserve-3d context |
| Dashboard glow | `BookShelf.tsx` | `.header-fade-up` stagger on greeting+h1; `.shelf-stagger` (12 slots) cascading on book grid; cover-color reactive `box-shadow` on `BookSpine` (`${book.coverColor}55` 8-digit hex); brighter edit/delete buttons |
| Nav pill | `BookSpread.tsx` | `.cta-splash-glow` on journal nav pill; brightened action button colors + `text-shadow` |

### New CSS classes (all in `globals.css`)
| Class | Purpose |
|-------|---------|
| `.text-shine` | Gold shimmer via `background-clip:text` on TypewriterText |
| `.cta-splash-glow` | Amber `drop-shadow` on CTA group and nav pill |
| `.auth-book-glow` | Leather ambient `box-shadow` on auth spread |
| `.header-fade-up` | 2-step staggered fade-in (`nth-child(1,2)`) for dashboard header |
| `.shelf-stagger > *` | 12-slot staggered `shelfItemIn` (translateY+scale, no rotateY) |

### Audit fixes applied
- Added `marginTop: "40px"` on spotlight wrapper div in `BookCover.tsx` — typewriter hint gap was lost when `TypewriterText`'s own `marginTop` was overridden to 0.
- Changed `shelfItemIn` from `rotateY(-10deg)` to `translateY(28px) scale(0.93)` — no `perspective` context on shelf grid; rotateY would render as flat tilt.

---

## 13. C4 UI Wave 8 — Auth stagger + flip flash fix (2026-06-28)

| Area | Files | Details |
|------|-------|---------|
| Row stagger CSS | `globals.css` | `authRowIn`; `.auth-stagger` containers; `.landing-enter-stagger`; `prefers-reduced-motion` |
| Auth flip nav | `AuthBookShell.tsx` | `router.push` at flip start; `navTarget` + `.auth-page-hold-cover` until pathname matches; `contentReady` hides content then remounts stagger via `key={pathname}` |
| Landing entrance | `BookCover.tsx` | `.landing-enter-stagger` wraps typewriter hint + CTA row (2-step stair) |

**Out of scope (unchanged):** TanStack invalidation, `force-dynamic`, login/register `page.tsx` — visual-only wave.

---

## 14. C4 UI Wave 9 — Auth stagger consistency (2026-06-28)

| Area | Files | Details |
|------|-------|---------|
| Nav hook | `useAuthBookNavigation.ts` | Extracted flip nav; browser-back reset; `authStaggerRemountKey` + `authBrandStaggerKey` |
| Stagger prep | `LoginForm.tsx`, `RegisterForm.tsx` | Attempted unified nth-child timeline (superseded Wave 10) |
| Tests | `hooks/__tests__/useAuthBookNavigation.test.ts` | 6 Vitest cases for remount key helpers |
| Tooling | `.gitignore` | Ignore auto-generated `next-env.d.ts` |

---

## 15. C4 UI Wave 10 — Full-row auth stagger (2026-06-28)

| Area | Files | Details |
|------|-------|---------|
| Index helper | `auth-stagger.ts` | `authStaggerRowProps(index, extras?)` — merges styles without dropping `--auth-stagger-i` |
| Form rows | `AuthFormField.tsx`, `LoginForm.tsx`, `RegisterForm.tsx` | Label + input separate indices; demo/OR/Google/CTA staggered |
| Left footer | `AuthBookShell.tsx` | Footer link index 5 inside stagger container |
| CSS | `globals.css` | `.auth-stagger-row`; removed `display:contents` approach |

---

## 16. C4 UI Wave 11 — Footer pin + gutter flip polish (2026-06-28)

| Area | Files | Details |
|------|-------|---------|
| Footer layout | `AuthBookShell.tsx`, `auth-form-styles.ts` | Marketing flex-1; footer `marginTop: auto`; darker prompt; `.auth-footer-link` glow hover |
| Gutter crease | `AuthBookShell.tsx`, `globals.css` | `.auth-spread-gutter` between leaves; `.auth-spread-flipping` during flip/hold |
| Hold cover | `globals.css` | `authHoldFadeIn` 220ms fade instead of pop |
| Page flip | `PageFlip.tsx` | Mid-flip spine box-shadow + ease-in-out easing (shared with journal) |

---

## 17. C4 UI Wave 12 — Spiral coil seam (2026-06-28)

| Area | Files | Details |
|------|-------|---------|
| Coil overlay | `SpreadCoilBinding.tsx` | Bronze spring loops on seam; absolute — no flex gap |
| Auth + journal | `AuthBookShell.tsx`, `BookSpread.tsx` | Flush `left \| right`; coil always mounted |
| Seam blend | `globals.css`, `LeftPage`, `RightPage` | `.spread-seam-curl-*` gradients into coil |
| Flip smooth | `PageFlip.tsx`, `usePageFlip.ts` | Left-edge seam strip; 80ms settle before unmount |

---

## 18. C4 UI Wave 13 — Even flip + subtle depth (2026-06-28)

| Area | Files | Details |
|------|-------|---------|
| Dual flip | `PageFlip.tsx` | Linear rotate + separate shadow keyframes (no mid-turn kick) |
| Coil glow | `globals.css` | Stronger idle shadow; soft transition on flip (no pulse) |

---

## 19. C4 UI Wave 14 — reverted (2026-06-28)

Coil z35 / overlay experiments **reverted** to Wave 13 — double seam lines + blank spread. Mid-flip coil partial hide accepted.

---

## 20. C4 UI Wave 15 — Dashboard polish (2026-06-29)

| Area | Files | Details |
|------|-------|---------|
| Footer color | `auth-form-styles.ts` | `AUTH_LEFT_BODY_COLOR` on prompt text |
| Nav glow + font | `DashboardNav.tsx`, `dashboard-styles.ts` | Dancing Script; brand + avatar spotlight |
| Shelf scale | `globals.css`, `BookShelf.tsx` | `--shelf-spine-w/h`; per-spine color halo |
| Greeting | `BookShelf.tsx` | `TypewriterText` + `.dashboard-title-ease` |
| Stats | `BookShelf.tsx` | `.dashboard-stat-glow` (supersedes `.dashboard-stat-card`) |

---

## 21. C4 UI Wave 16 — Shelf hover + stat glow (2026-06-29)

| Area | Files | Details |
|------|-------|---------|
| New journal plus | `globals.css`, `BookShelf.tsx` | Dash-color `+`; hover glow on slot |
| Shelf hover | `globals.css`, `BookShelf.tsx` | `.dashboard-shelf-item`; spotlight 0→1 |
| Spine glow tune | `globals.css`, `dashboard-styles.ts` | `bookCoverGlowVars()` hex-alpha; `.dashboard-spine-slot` + `drop-shadow`; tight 28/56px range |
| Stats | `globals.css`, `BookShelf.tsx` | `.dashboard-stat-glow` — no card box |

---

## 22. C4 UI Wave 17 — Journal dialog + shelf spine (2026-06-29)

| Area | Files | Details |
|------|-------|---------|
| Dialog primitive | `ui/dialog.tsx`, `globals.css` | Radix Dialog; `.journal-paper-dialog` 90vw/90vh |
| Book editor | `BookEditorModal.tsx` | Titles, color tick, theme preview, Lucide icons, mini spine |
| Cover icons | `cover-icons.ts`, `CoverIcon.tsx` | Slug in `coverEmoji`; legacy emoji mapped |
| Confirm | `ConfirmDialog.tsx` | Shared Dialog shell + button hover glow |
| Shelf spine | `BookShelf.tsx`, `globals.css` | Rotated icon + Dancing Script title |
| Tests | `cover-icon.test.ts`, `validations.test.ts` | 31 Vitest PASS |

---

## 23. C4 UI Wave 17b — Dialog + spine polish (2026-06-29)

| Area | Files | Details |
|------|-------|---------|
| Dialog 90% | `globals.css` | `90vw` × `90vh`; subtitle `margin: 0` |
| BookSpineMark | `BookSpineMark.tsx`, `BookShelf.tsx` | Icon `-90deg` beside title, centered |
| Glow unclip | `globals.css`, `BookEditorModal.tsx` | `.journal-picker-pad`; auth-style inputs |
| Preview scale | `globals.css` | Responsive mini-spine + theme preview |
| Icons | `cover-icons.ts` | 27 Lucide icons |

---

## 25. C4 UI Waves 18–18e — Landing → auth choreography (2026-06-29)

| Wave | Files | Details |
|------|-------|---------|
| 18 | `auth-landing-handoff.ts`, `globals.css`, `AuthBookShell.tsx` | sessionStorage + `data-auth-from-landing`; `authBookShellEnter` 0.9s |
| 18c | `auth-stagger.ts`, `globals.css` | Revert phased tiers; parallel row stagger (same index = same delay) |
| 18d | `BookCover.tsx` | Greeting 900ms → hold 350ms → fade starts 1250ms; handoff at push |
| 18e | `BookCover.tsx`, `globals.css` | Nav overlap 220ms (`router.push` 1430ms); shell `-80ms` preroll |

**Timing constants (BookCover):** `COVER_EXIT_START_MS` 1250 · `COVER_OPEN_MS` 1430 · `COVER_NAV_OVERLAP_MS` 220.

**Out of scope:** invalidation, PageFlip, direct `/login` stagger (60ms default).

---

## 26. C4 UI Waves 24–26 — Journal stagger + flip + entry URL (2026-07-04)

| Wave | Files | Details |
|------|-------|---------|
| 24 | `journal-stagger.ts`, `BookSpreadHeader`, `LeftPage`, `RightPage`, `globals.css` | Auth-style row stagger on mount; nested opacity wrappers |
| 26 | `BookSpread`, `LeftPage`, `RightPage`, `journal-entry-url.ts`, `page.tsx` | Flip anti-flash (`visibility`); Fragment remount key; `?entry=` SSR + `replaceState` |
| 26b | `BookSpread.tsx` | Fragment key fix — duplicate sibling keys caused triple-page glitch |

**Out of scope:** invalidation paths unchanged; delete/offline remap does not bump remount key.

---

## 27. C4 UI Waves 27–28 — Header parity + nav scroll isolation (2026-07-05)

| Wave | Files | Details |
|------|-------|---------|
| 27 | `book-brand-styles.ts`, `BookSpreadHeader.tsx`, `globals.css`, `book-brand.test.ts` | Desc uses `BOOK_BRAND_DESC_INLINE_STYLE` (Dancing Script); x-axis nowrap align |
| 28 | `DashboardClientShell.tsx`, `DashboardNav.tsx`, `(dashboard)/layout.tsx`, `globals.css` | Nav outside `.dashboard-scroll`; `scrollbar-gutter: stable`; profile avatar shift fix |

**Out of scope:** SSR, TanStack invalidation, SSE — presentation/layout only.

---

## 28. C4 UI Waves 29–30 — Login demo picker (2026-07-05)

| Wave | Files | Details |
|------|-------|---------|
| 29 | `LoginForm.tsx`, `auth-form-styles.ts`, `globals.css` | 3-zone trigger; chevron 180° rotate; `authDemoTriggerStyle` |
| 30 | `demo-account.ts`, `constants/auth.ts`, `LoginForm.tsx`, `demo-account.test.ts` | Selected avatar + name; robohash prefetch; strict cred match |

---

## 30. C4 UI Wave 31 — Dark page theme ink parity (2026-07-05)

| Area | Files | Details |
|------|-------|---------|
| Tokens | `constants/themes.ts` | Full surface ink/lines/buttons per theme |
| Bridge | `book-theme-vars.ts`, `useBookTheme.ts` | `--theme-*` on spread; `--ink-primary` for ProseMirror |
| Pages | `LeftPage`, `RightPage`, tags, footers, `globals.css` | Ruled lines, actions, editor inherit theme vars |
| Preview | `BookThemePreview.tsx` | Same `bookThemeCssVars` as live reader |
| Tests | `book-theme-vars.test.ts` (6) | **77** Vitest total |

**Out of scope:** cache/API — theme PATCH already invalidates via `notifyJournalCacheUpdated`.

---

## 31. C4 UI Wave 32 — Theme-aware page flip (2026-07-05)

| Area | Files | Details |
|------|-------|---------|
| Flip | `PageFlip.tsx`, `globals.css` | `--theme-page-left/right` on flip faces; shadow keyframes via vars |
| Tokens | `constants/themes.ts`, `book-theme-vars.ts` | `flipSeamEdge`, `flipShadowRest/Mid` per theme |
| DRY | `journal-page-styles.ts`, `LeftPage`, `RightPage` | Shared `journalRuledLinesLayerStyle` |
| Tests | `book-theme-vars.test.ts` (7) | **78** Vitest total |

---

## 32. C4 UI Wave 33 — Mobile horizontal scroll (2026-07-05)

| Area | Files | Details |
|------|-------|---------|
| Scroll port | `BookSpreadScrollPort.tsx`, `globals.css` | `.book-spread-scroll-port` — `overflow-x: auto` below 768px; `overscroll-behavior-x: contain` |
| Auth + journal | `AuthBookShell.tsx`, `BookSpread.tsx` | Spotlight + 3D spread inside port; branding/nav outside (viewport-centered) |
| Lib | `book-spread-scroll.ts` | Breakpoint 767px + spread width helper |
| Shell | `.auth-book-enter-shell`, `.book-spread-shell` | Full width on mobile so absolute headers center on viewport |
| Tests | `book-spread-scroll.test.ts` (4) | **82** Vitest total |

**Out of scope:** flip animation, cache/API, SSR — UI-only.

---

## 33. C4 UI Wave 33b — Auth padding + scroll bounds (2026-07-05)

| Area | Files | Details |
|------|-------|---------|
| Auth pad | `journal-page-styles.ts`, `AuthBookShell.tsx` | `AUTH_LEFT_PAGE_CONTENT_PADDING` 22px sides; DRY ruled/margin layers |
| Scroll | `globals.css`, `book-spread-scroll.ts` | Mobile inner width = spread; overflow hidden; spotlight/3D contained |
| 3D | `BookSpread.tsx`, `globals.css` | `.book-spread-3d-row` / `--tilted`; no rotate on phone |
| Tests | `book-spread-scroll.test.ts` (5) | **83** Vitest total |

---

## 35. C4 UI Wave 34 — Mobile auth labels + shell pad (2026-07-05)

| Area | Files | Details |
|------|-------|---------|
| Labels | `auth-responsive-labels.ts`, `LoginForm`, `GoogleSignInButton` | Demo "Demo account" / Gmail short on mobile |
| Nav pad | `dashboard-styles.ts`, `DashboardNav.tsx`, `globals.css` | `.dashboard-shell-pad` px-2/md/lg |
| Header | `BookSpreadHeader.tsx`, `globals.css` | Mobile stack + viewport pad |
| Bottom nav | `JournalBottomNav.tsx`, `globals.css` | Icon-only CRUD row on phone |
| Tests | `auth-responsive-labels.test.ts` (2) | **85** Vitest total |

---

## 36. C4 UI Waves 35–38 — Mobile journal chrome + nav (2026-07-05)

| Area | Details |
|------|---------|
| 35 | Inline mobile header; 44px touch nav; read/write footer meta + icons |
| 36 | Journal viewport below nav + chrome bands; scroll `:has` lock |
| 37 | Glass nav on journal; scroll-port pan-x; header center |
| 38 | Transparent nav (no backdrop-filter); spotlight bleed; edit single X-scroll |
| Tests | **88** Vitest total |

---

## 37. C4 UI Wave 39–40b — md+ flip unclip + viewport fit (2026-07-05)

| Area | Files | Details |
|------|-------|---------|
| Flip unclip | `globals.css`, `BookSpreadScrollPort.tsx` | Stable `overflow: clip` + clip-margin; pinned inner width; flip z-index |
| Fixed nav | `globals.css` | Journal md+ nav `position: fixed`; scroll 100vh |
| Journal layout | `globals.css`, `BookSpread.tsx` | `padding-top: nav + chrome`; header no longer overlaps book |
| Shelf viewport | `globals.css`, `BookShelf.tsx` | md+ single viewport; `--shelf-spine-h` from vh; `.dashboard-shelf-*` |
| Tests | `book-spread-scroll.test.ts` (5), responsive label tests | **90** Vitest total |

---

## 38. Related docs

- `README.md` — setup, env vars, API, learning walkthrough, stack badges.
- `CLAUDE.md` — compact agent instructions (gitignored locally).
- `docs/AUTH_UI_IMPLEMENTATION_GUIDE.md` — OAuth flicker, avatar, session patterns.
- `docs/DROPDOWN_TEST_CREDENTIALS_DOCS.md` — demo account + NextAuth reference.
- `docker-compose.yml` — optional local Postgres only (not used for Vercel deploy).
- `.agile-v/` — Agile V traceability **C4** (REQ-0001–0031, ART-0078, `.cursor/rules/agile-v.mdc` alwaysApply).

---

*Last reviewed: 2026-07-06 — C4 Wave 41; lint/typecheck/90 Vitest/build PASS.*
