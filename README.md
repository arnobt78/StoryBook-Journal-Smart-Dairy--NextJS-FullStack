# Smart Story Book Journal - Next.js, TypeScript, PostgreSQL, Tailwind CSS (Animated Book UI) FullStack Project (Online-Offline Draft, Sync Capability, Voice Transcription, AI Assist Daily Diary)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple)](https://authjs.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154)](https://tanstack.com/query)
[![TipTap](https://img.shields.io/badge/TipTap-2.27-6841FF)](https://tiptap.dev/)

A premium, immersive digital diary that feels like opening a real leather notebook. It combines **3D book-cover animations**, **CSS page-flip transitions**, ruled paper, mood and weather pickers, tags, autosave, **IndexedDB offline drafts**, multi-tab **SSE realtime sync**, and optional **AI writing assistance** — all backed by **PostgreSQL**, **Prisma**, and **NextAuth** secure authentication. This repository is built for **learning**: you can study how a modern full-stack Next.js app splits Server Components (data) from Client Components (animation), how REST APIs validate with Zod, how TanStack Query keeps the UI fresh without full page reloads, and how offline-first patterns survive flaky networks.

- **Live Demo:** [https://storybook-journal.vercel.app](https://storybook-journal.vercel.app)

![Image 1](https://github.com/user-attachments/assets/38bbf068-b81e-4594-b89a-4e934a814f5a)
![Image 2](https://github.com/user-attachments/assets/266ac8b6-7bcf-4185-923f-17dc885b62ab)
![Image 3](https://github.com/user-attachments/assets/11b93830-8a66-4f61-8560-2aeed5213f48)
![Image 4](https://github.com/user-attachments/assets/f444580d-8671-4da5-90d4-a69ca16c8990)
![Image 5](https://github.com/user-attachments/assets/02fdf0a6-7ab8-4736-a021-147b00a3b5d5)
![Image 6](https://github.com/user-attachments/assets/0d7d006e-6aaa-405f-9c46-e9b8956e73f0)
![Image 7](https://github.com/user-attachments/assets/e192f459-c1d0-4ca2-a112-9d5833691509)
![Image 8](https://github.com/user-attachments/assets/315edaef-7746-414f-a877-b1830e866947)
![Image 9](https://github.com/user-attachments/assets/138e244c-e65a-4712-bac2-fa98a8c8f9b9)
![Image 10](https://github.com/user-attachments/assets/6c1daa04-7cbd-43f3-8a69-3ddaa0eccaae)

## Table of Contents

1. [What Is This Project?](#what-is-this-project)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [How It Works (Architecture)](#how-it-works-architecture)
5. [Project Structure](#project-structure)
6. [Routes & Pages](#routes--pages)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Environment Variables](#environment-variables)
10. [Getting Started](#getting-started)
11. [Available Scripts](#available-scripts)
12. [Learning Walkthrough](#learning-walkthrough)
13. [In-Source Code Comments](#in-source-code-comments)
14. [Reusable Components & Patterns](#reusable-components--patterns)
15. [Code Examples](#code-examples)
16. [Keywords & SEO](#keywords--seo)
17. [Related Documentation](#related-documentation)
18. [Conclusion](#conclusion)
19. [License](#license)

---

## What Is This Project?

StoryBook Journal is a **full-stack journaling web application** — not a minimal CRUD tutorial. The product goal is emotional and tactile:

- Open a **leather book cover** with a 3D hinge animation on the landing page
- **Flip pages** between login and register inside an open-book auth spread
- Browse **multiple journals** on a bookshelf dashboard
- **Read and write** daily entries on a two-page spread (left = entry list, right = read/write)
- **Autosave** while typing; survive refreshes with **offline IndexedDB drafts**
- **Sync** queued creates/updates when the network returns
- **Search** entries from a ⌘K command palette
- **Cycle page themes** (warm paper, dark academia, midnight journal, and more)
- Get **AI writing suggestions** through a secure server proxy (optional)
- Inspect **API health** and **live API documentation** inside the authenticated dashboard

---

## Key Features

| Feature                  | Description                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **3D book cover**        | Leather texture, gold shine, hover tilt, animated cover open on landing              |
| **Page-flip navigation** | CSS `preserve-3d` flip overlay; auth and journal routes animate before content swap  |
| **Book spread UI**       | Left page = previous entry preview + TOC; right page = read or write mode            |
| **Multiple journals**    | Create books with cover color, Lucide icon slug, and page theme                      |
| **Rich entry metadata**  | Mood, weather, location, tags, word count, reading time                              |
| **TipTap editor**        | Rich HTML content with placeholder, typography, character count                      |
| **Autosave**             | Debounced PATCH while editing (2 s default via `useAutoSave`)                        |
| **Offline-first**        | IndexedDB entry drafts + sync queue for PATCH/POST when offline                      |
| **Optimistic UI**        | TanStack Query cache updates instantly; server reconciles on sync                    |
| **Realtime SSE**         | `GET /api/journal/events` — multi-tab invalidation via Redis pub/sub                 |
| **Authentication**       | Email/password (bcrypt) + optional Google OAuth (NextAuth v5)                        |
| **Demo login**           | Pre-filled test account dropdown on `/login` for quick exploration                   |
| **AI writing assist**    | Groq → OpenRouter → Anthropic fallback; keys never exposed to browser                |
| **Voice dictation**      | Mic button in write mode — Web Speech (free) → browser Whisper (private) → cloud STT |
| **API Status UI**        | `/api-status` — dependency health (DB, Redis, AI) + aggregate stats                  |
| **API Docs UI**          | `/api-documentation` — OpenAPI-style catalog from `api-route-catalog.ts`             |
| **Security**             | `proxy.ts` auth gate, security headers, dashboard `noindex`, Zod validation          |
| **Responsive book**      | CSS `clamp()` tokens (`--page-w`, `--page-h`); mobile horizontal scroll              |

---

## Technology Stack

Each library plays a specific role. Understanding _why_ it is here helps you reuse patterns in other projects.

### Core framework

| Library        | Version | Role                                                        |
| -------------- | ------- | ----------------------------------------------------------- |
| **Next.js**    | 16      | App Router, Server Components, Route Handlers, metadata API |
| **React**      | 19      | UI rendering, hooks, client/server component split          |
| **TypeScript** | 5.7     | Strict typing across API, DB, and UI                        |

**Next.js App Router** means files under `src/app/` map to URLs. `page.tsx` renders routes; `layout.tsx` wraps nested routes; `route.ts` inside `api/` becomes REST endpoints.

### Data & backend

| Library        | Role                                                   |
| -------------- | ------------------------------------------------------ |
| **Prisma**     | ORM — type-safe PostgreSQL queries, migrations, schema |
| **PostgreSQL** | Relational database for users, books, entries          |
| **Zod**        | Runtime validation shared between API routes and forms |
| **bcryptjs**   | Password hashing before storing in `User.passwordHash` |

### Auth & session

| Library         | Role                                                          |
| --------------- | ------------------------------------------------------------- |
| **NextAuth v5** | JWT sessions, Credentials + Google providers, `auth()` helper |

Sessions use **HttpOnly cookies**. The Prisma user id is copied into the JWT so API routes scope every query with `session.user.id`.

### Client state & UX

| Library             | Role                                                    |
| ------------------- | ------------------------------------------------------- |
| **TanStack Query**  | Server-state cache, prefetch, invalidation after CRUD   |
| **React Hook Form** | Login/register form state                               |
| **Sonner**          | Toast notifications (save, offline queue, errors)       |
| **TipTap**          | Rich text editor (StarterKit, Placeholder, Typography)  |
| **cmdk**            | ⌘K command palette keyboard navigation                  |
| **Radix UI**        | Dialog, dropdown, tabs, tooltip — accessible primitives |
| **date-fns**        | Format entry dates (`MMMM d, yyyy`, weekday names)      |
| **lucide-react**    | Icon set for nav, shelf spines, and UI chrome           |
| **Framer Motion**   | Available for motion (book UI uses mostly custom CSS)   |

### Infrastructure (optional)

| Library           | Role                                                |
| ----------------- | --------------------------------------------------- |
| **Upstash Redis** | AI rate limiting + journal pub/sub for SSE realtime |
| **Vitest**        | Unit tests (96+ tests)                              |
| **Playwright**    | E2E tests (optional; requires seed data)            |

### Styling

| Library               | Role                                                          |
| --------------------- | ------------------------------------------------------------- |
| **Tailwind CSS**      | Utility classes for forms, nav, modals                        |
| **globals.css**       | Book aesthetic: leather, paper, flip keyframes, design tokens |
| **Self-hosted fonts** | 15 WOFF2 files in `public/fonts/` — no Google Fonts CDN       |

---

## How It Works (Architecture)

```bash
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌──────────────┐
│   Browser   │────▶│  Next.js (App)   │────▶│   Prisma    │────▶│  PostgreSQL  │
│  React UI   │◀────│  Server + API    │◀────│   Client    │◀────│              │
└─────────────┘     └──────────────────┘     └─────────────┘     └──────────────┘
       │                      │                        │
       │ IndexedDB            │ NextAuth JWT           │ Upstash Redis (optional)
       ▼                      ▼                        ▼
  Offline drafts         Session cookies          SSE + rate limits
  Sync queue
```

### Request flow (typical journal read)

1. User opens `/journal/[bookId]`.
2. **`src/proxy.ts`** (Next.js 16 edge boundary) checks session; redirects to `/login` if missing.
3. **`journal/[bookId]/page.tsx`** (Server Component) calls `auth()` + Prisma with ownership check.
4. Data passes as `initialBook` to **`BookSpread`** (Client Component).
5. User flips pages → `usePageFlip` animates → focused entry index changes locally.
6. URL updates via `history.replaceState` (`?entry=` persists focus on refresh — no App Router round-trip per flip).
7. User edits → `useAutoSave` debounces → `PATCH /api/entries/[entryId]`.
8. On success → **`notifyJournalCacheUpdated(queryClient)`** refreshes shelf + open book everywhere (no manual page refresh).

### Rendering strategy

| Layer                  | Pattern                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| **Server Components**  | Data fetch in `page.tsx` — Prisma never ships to the client bundle          |
| **Client Components**  | `"use client"` for flip, write mode, forms, offline hooks                   |
| **API Route Handlers** | `src/app/api/**/route.ts` — JSON REST, Zod validation, `auth()` guard       |
| **force-dynamic**      | Auth, dashboard, journal pages, and SSE/search APIs skip stale static cache |

### Cache invalidation (important)

**Never** call raw `invalidateQueries({ queryKey: queryKeys.journalSubtree() })` outside `src/lib/journal-cache-notify.ts`. Always use:

```typescript
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";

await notifyJournalCacheUpdated(queryClient);
// or when UI needs fresh bookDetail ids immediately:
await notifyJournalCacheUpdatedAndRefetch(queryClient, refetch);
```

This single entry point invalidates shelf, book detail, search, API status counts, and SSE-driven updates consistently.

### Offline subsystem

When the browser is offline (or fetch fails):

1. **`useOfflineEntryDraft`** saves draft text to IndexedDB.
2. **`offline-journal-actions`** enqueues PATCH/POST with temp ids (`offline-entry-*`, `offline-book-*`).
3. **`useOfflineSyncQueue`** drains the queue on `window.online`.
4. **`useOfflineIdRemap`** swaps temp ids to server cuids so the reader stays on the correct page.
5. **`DashboardNav`** shows an `{n} offline` badge via `OfflineSyncContext`.

### Realtime (optional — requires Upstash Redis)

1. Server writes call **`afterJournalMutation()`** → Redis publish.
2. Client mounts **`JournalRealtimeBridge`** → `useJournalRealtime` opens `EventSource` to `/api/journal/events`.
3. On event → `notifyJournalCacheUpdated` — other tabs/devices see fresh data.

---

## Project Structure

```bash
storybook-journal/
├── prisma/
│   ├── schema.prisma          # User, JournalBook, JournalEntry models
│   ├── seed.ts                # Optional demo data script
│   └── migrations/            # SQL migration history
├── public/
│   ├── fonts/                 # Self-hosted WOFF2 (Playfair, Lora, Dancing Script, …)
│   └── diary-1.svg            # App icon / brand mark
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout + SEO metadata
│   │   ├── page.tsx           # Landing (3D cover) → redirect if logged in
│   │   ├── providers.tsx      # SessionProvider, QueryClient, OfflineSync
│   │   ├── sitemap.ts         # Public routes for SEO
│   │   ├── manifest.ts        # PWA manifest
│   │   ├── robots.ts          # Crawler rules
│   │   ├── (auth)/            # Login & register (book-spread auth UI)
│   │   ├── (dashboard)/       # Protected shelf, journal, API status/docs
│   │   └── api/               # REST Route Handlers
│   ├── components/
│   │   ├── auth/              # AuthBookShell, OAuth, demo picker
│   │   ├── journal/           # BookSpread, BookShelf, PageFlip, nav
│   │   ├── api-status/        # Live API health dashboard
│   │   ├── api-documentation/ # In-app API docs UI
│   │   ├── editor/            # TipTap JournalEditor
│   │   ├── forms/             # LoginForm, RegisterForm
│   │   ├── layout/            # DashboardNav, CommandProvider
│   │   ├── feedback/          # ConfirmDialog
│   │   └── ui/                # shadcn-style primitives (dialog, ripple-button, …)
│   ├── context/
│   │   └── OfflineSyncContext.tsx
│   ├── hooks/                 # usePageFlip, useAutoSave, offline, realtime
│   ├── lib/                   # auth, db, validations, journal-api, offline, AI
│   ├── constants/             # MOODS, WEATHERS, themes, cover icons
│   ├── types/                 # Shared TS interfaces
│   └── proxy.ts               # Auth redirect boundary (Next.js 16+)
├── docs/                      # Extended guides (walkthrough, auth UI, guardrails)
├── .env.example               # Template for all environment variables
├── docker-compose.yml         # Optional local Postgres only (not the app)
├── next.config.ts             # Security headers, image remotePatterns
├── vercel.json                # Vercel header overrides
└── package.json
```

---

## Routes & Pages

| Route                | Type     | Description                                                         |
| -------------------- | -------- | ------------------------------------------------------------------- |
| `/`                  | Server   | Landing cover animation; redirects to `/dashboard` if authenticated |
| `/login`             | Server   | Login form inside book spread; optional Google OAuth                |
| `/register`          | Server   | Registration; creates user + welcome book + entry                   |
| `/dashboard`         | Server   | Bookshelf — lists all journals for the user                         |
| `/journal/[bookId]`  | Server   | Open book reader/writer (`bookId` is cuid, not slug)                |
| `/api-status`        | Server   | Live API dependency health + aggregate stats (auth required)        |
| `/api-documentation` | Server   | In-app OpenAPI-style route catalog (auth required)                  |
| `/robots.txt`        | Metadata | Disallows `/api`, `/dashboard`, `/journal` for crawlers             |
| `/sitemap.xml`       | Metadata | Public indexable routes (`/`, `/login`, `/register`)                |

**Route groups** `(auth)` and `(dashboard)` do not affect the URL — they organize layouts only.

Auth and dashboard pages use `export const dynamic = "force-dynamic"` so session data is always fresh.

---

## API Endpoints

All JSON responses follow a common envelope:

```json
{
  "success": true,
  "message": "Optional human message",
  "data": {}
}
```

| Method    | Path                      | Auth | Description                                                   |
| --------- | ------------------------- | ---- | ------------------------------------------------------------- |
| GET, POST | `/api/auth/[...nextauth]` | —    | NextAuth session, sign-in, sign-out, OAuth callbacks          |
| POST      | `/api/auth/register`      | —    | Register user; seeds default book + welcome entry             |
| GET       | `/api/books`              | ✅   | List user's journals with entry counts                        |
| POST      | `/api/books`              | ✅   | Create journal + starter entry (transaction)                  |
| GET       | `/api/books/[bookId]`     | ✅   | Book detail + entries (ownership scoped)                      |
| PATCH     | `/api/books/[bookId]`     | ✅   | Update title, cover, theme; slug sync on title change         |
| DELETE    | `/api/books/[bookId]`     | ✅   | Delete book and cascade entries                               |
| POST      | `/api/entries`            | ✅   | Create entry in owned book                                    |
| PATCH     | `/api/entries/[entryId]`  | ✅   | Autosave / manual save; recalculates wordCount, excerpt, slug |
| DELETE    | `/api/entries/[entryId]`  | ✅   | Delete entry (ownership scoped)                               |
| GET       | `/api/search`             | ✅   | Scoped entry search (`q`, optional `bookId`, `mood`)          |
| GET       | `/api/journal/events`     | ✅   | SSE stream — journal mutations (Redis pub/sub)                |
| POST      | `/api/ai/assist`          | ✅   | Sync AI continuation (rate limited)                           |
| POST      | `/api/ai/assist/stream`   | ✅   | SSE streaming AI continuation                                 |
| POST      | `/api/voice/transcribe`   | ✅   | Phase 3 voice STT proxy (Deepgram / AssemblyAI; rate limited) |
| GET       | `/api/health`             | —    | Simple health check for monitoring                            |
| GET       | `/api/status`             | ✅   | Dependency health + platform/personal aggregate stats         |
| GET       | `/api/openapi`            | ✅   | Machine-readable route catalog JSON                           |

**Authorization pattern** (every protected route):

```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 },
  );
}
// Prisma queries always include userId in where clause
```

Browse the full catalog interactively at **`/api-documentation`** when logged in, or fetch `GET /api/openapi`.

---

## Database Schema

Three main models in `prisma/schema.prisma`:

### User

Stores account credentials and profile. `passwordHash` is null for OAuth-only users. Relations: `books[]`, `entries[]`.

### JournalBook

A journal on the shelf. Unique constraint: `@@unique([userId, slug])`. Fields include `coverColor`, `coverEmoji` (icon slug), `theme`, `visibility`.

### JournalEntry

A single diary page. `tags` is stored as a **JSON string** (e.g. `"[\"morning\",\"coffee\"]"`) — parsed in app code with `parseTags()`. Unique: `@@unique([bookId, slug])`.

**Cascade deletes:** Deleting a user removes their books and entries.

```prisma
model JournalEntry {
  id          String   @id @default(cuid())
  bookId      String
  title       String   @default("Untitled Entry")
  content     String   @default("")
  mood        String   @default("✨")
  weather     String   @default("☀️")
  tags        String   @default("[]")
  wordCount   Int      @default(0)
  entryDate   String
  // … see prisma/schema.prisma for full model
}
```

---

## Environment Variables

There is **no `.env` file in the repository** (by design — secrets must not be committed). Copy the template:

```bash
cp .env.example .env
```

### Minimum required to run locally

You **cannot** authenticate or persist journals without a database and auth secret. These four variables are required:

| Variable       | Description                                     | How to obtain                                                                                                                   |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma queries | [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), local Docker, or any Postgres host |
| `DIRECT_URL`   | Direct Postgres URL for migrations/`db push`    | Same as `DATABASE_URL` unless you use a pooler (then use direct host for migrations)                                            |
| `AUTH_SECRET`  | NextAuth JWT signing secret                     | Run: `openssl rand -base64 32`                                                                                                  |
| `NEXTAUTH_URL` | Public app URL                                  | `http://localhost:3000` locally; `https://your-domain.vercel.app` in production                                                 |

**Example `.env` for local development:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storybook"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/storybook"
AUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

With only these four variables, the app runs fully: email/password auth, shelf, journal CRUD, autosave, offline drafts, and search. Optional features simply stay disabled.

### Optional (features degrade gracefully when unset)

| Variable                                              | Feature                                  | Behavior when missing                                                                        |
| ----------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`           | Google OAuth login                       | Google button hidden; email/password still works                                             |
| `GOOGLE_ID` + `GOOGLE_SECRET`                         | Legacy aliases                           | Same as above                                                                                |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | SSE realtime + AI rate limit             | In-memory rate limit fallback; no cross-tab SSE                                              |
| `GROQ_API_KEY`                                        | AI assist (primary)                      | Falls through to OpenRouter, then Anthropic                                                  |
| `OPENROUTER_API_KEY`                                  | AI assist (fallback)                     | Falls through to Anthropic                                                                   |
| `ANTHROPIC_API_KEY`                                   | AI assist (legacy)                       | Returns poetic placeholder text; UI still works                                              |
| `SHOW_DEMO_LOGIN`                                     | Demo account dropdown on `/login`        | Defaults to **on**; set `"false"` to hide in production                                      |
| `DEEPGRAM_API_KEY`                                    | Voice dictation Phase 3 (Deepgram)       | Phase 1/2 still work; set `NEXT_PUBLIC_VOICE_PROVIDER=server-deepgram` to expose in picker   |
| `ASSEMBLYAI_API_KEY`                                  | Voice dictation Phase 3 (AssemblyAI)     | Phase 1/2 still work; set `NEXT_PUBLIC_VOICE_PROVIDER=server-assemblyai` to expose in picker |
| `NEXT_PUBLIC_VOICE_PROVIDER`                          | Default cloud STT provider in mic picker | `server-deepgram` or `server-assemblyai`; server keys stay server-side                       |

**Voice dictation works without any keys.** Phase 1 uses the browser Web Speech API (Chrome/Edge). Phase 2 runs Whisper on-device via `@huggingface/transformers` — PCM decode on main thread, ONNX ASR in a dedicated Web Worker (`whisper.worker.ts`), ~140 MB model download on first use. Phase 3 is optional cloud STT:

| Provider       | Free tier                                                         | Sign up                                                                        |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Deepgram**   | $200 one-time credit, no credit card; expires 1 year after signup | [console.deepgram.com/signup](https://console.deepgram.com/signup)             |
| **AssemblyAI** | $50 one-time credit, no credit card; credits do not expire        | [assemblyai.com/dashboard/signup](https://www.assemblyai.com/dashboard/signup) |

After creating an API key, add it to `.env` and set the matching `NEXT_PUBLIC_VOICE_PROVIDER` so the mic button provider picker includes the cloud option.

**Vercel / production:** If you only use Phase 1 (Web Speech) and Phase 2 (browser Whisper), omit `DEEPGRAM_API_KEY`, `ASSEMBLYAI_API_KEY`, and `NEXT_PUBLIC_VOICE_PROVIDER` entirely — no empty placeholders needed.

### Where to set variables

| Environment | Location                                   |
| ----------- | ------------------------------------------ |
| Local       | `.env` or `.env.local` in project root     |
| Vercel      | Project → Settings → Environment Variables |
| CI          | GitHub Actions secrets or your pipeline    |

See **`.env.example`** for commented templates including Docker Postgres lines.

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **PostgreSQL** 14+ (hosted or local)

### Quick start

```bash
# 1. Clone and enter the project
git clone https://github.com/arnobt78/StoryBook-Journal-Smart-Dairy--NextJS-FullStack.git
cd StoryBook-Journal-Smart-Dairy--NextJS-FullStack

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, DIRECT_URL, AUTH_SECRET, NEXTAUTH_URL

# 4. Prepare database
npx prisma generate
npm run db:push
npm run db:seed    # optional demo data

# 5. Start dev server
npm run dev
```

Open **<http://localhost:3000>**

### Verify everything works

```bash
npm run verify   # lint + typecheck + 123 unit tests
```

### Test credentials (demo login)

When the demo login picker is enabled on `/login`:

| Field    | Value           |
| -------- | --------------- |
| Email    | `test@user.com` |
| Password | `12345678`      |

The test account is created automatically when the first real user registers (idempotent seed in the register API route).

### Optional: local PostgreSQL via Docker

If you do not have a hosted database:

```bash
docker compose up -d db
```

Then use the Docker lines from `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storybook"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/storybook"
```

Run `npm run db:push` again. **Docker runs Postgres only** — the Next.js app runs with `npm run dev`, not in Docker.

### Production (Vercel)

1. Push repo to GitHub.
2. Import project in [Vercel](https://vercel.com).
3. Add all required env vars in the dashboard.
4. Deploy — Vercel runs `next build` automatically.
5. For Google OAuth, add your Vercel URL to Google Cloud Console authorized origins and redirect URIs.

---

## Available Scripts

| Script           | Command               | Purpose                                |
| ---------------- | --------------------- | -------------------------------------- |
| Dev server       | `npm run dev`         | Hot reload at localhost:3000           |
| Production build | `npm run build`       | Compile for deployment                 |
| Start production | `npm run start`       | Run built app                          |
| **Verify all**   | `npm run verify`      | lint + typecheck + vitest              |
| Lint             | `npm run lint`        | ESLint check                           |
| Lint fix         | `npm run lint:fix`    | Auto-fix lint issues                   |
| Typecheck        | `npm run typecheck`   | `tsc --noEmit`                         |
| Unit tests       | `npm run test`        | Vitest (123 tests)                     |
| E2E tests        | `npm run test:e2e`    | Playwright (optional; needs seed)      |
| Prisma generate  | `npm run db:generate` | Regenerate client after schema changes |
| Push schema      | `npm run db:push`     | Sync schema to DB (dev-friendly)       |
| Migrate          | `npm run db:migrate`  | Create/apply migrations                |
| Prisma Studio    | `npm run db:studio`   | Visual DB browser                      |
| Seed             | `npm run db:seed`     | Run `prisma/seed.ts`                   |
| Full setup       | `npm run setup`       | install + generate + db push           |

---

## Learning Walkthrough

Follow this path if you are new to the codebase.

### Step 1 — Landing & auth

1. `src/app/page.tsx` — session check + landing cover.
2. `src/components/journal/BookCover.tsx` — 3D hinge CSS animation.
3. `src/app/(auth)/login/page.tsx` and `AuthBookShell.tsx` — page flip between login/register.
4. `src/hooks/useAuthBookNavigation.ts` — early `router.push`, hold cover, stagger remount.

### Step 2 — Dashboard shelf

1. `src/app/(dashboard)/dashboard/page.tsx` — Server Component fetches books.
2. `src/components/journal/BookShelf.tsx` — client shelf, create book modal, prefetch on hover.
3. `src/hooks/useJournalPrefetch.ts` — warms route + `bookDetail` query on spine hover.

### Step 3 — Journal reader (core)

1. `src/app/(dashboard)/journal/[bookId]/page.tsx` — loads book + entries server-side; resolves `?entry=`.
2. **`src/components/journal/BookSpread.tsx`** — orchestrator: flip, autosave, offline, AI.
3. `LeftPage.tsx` / `RightPage.tsx` — read vs write UI with stagger animations.
4. `src/hooks/usePageFlip.ts` — animation timing and re-entrancy guard.
5. `src/lib/journal-entry-url.ts` — `history.replaceState` for entry focus persistence.

### Step 4 — API & validation

1. `src/app/api/entries/[entryId]/route.ts` — PATCH autosave handler.
2. `src/lib/validations.ts` — Zod schemas shared with API.
3. `src/lib/journal-mutation.ts` — `afterJournalMutation()` for Redis publish.
4. `src/lib/api-route-catalog.ts` — static docs for `/api-documentation`.

### Step 5 — Client cache

1. `src/lib/query-keys.ts` — central cache keys (`journalSubtree`, `apiStatus`, …).
2. **`src/lib/journal-cache-notify.ts`** — the only place to invalidate journal queries.
3. `src/components/auth/OAuthReturnSync.tsx` — post-OAuth invalidation pattern.

### Step 6 — Offline (advanced)

1. `src/lib/offline/` — IndexedDB drafts + sync queue.
2. `src/hooks/useOfflineSyncQueue.ts` — FIFO drain on reconnect.
3. `src/context/OfflineSyncContext.tsx` — global pending count for nav badge.

### Step 7 — Realtime & ops

1. `src/hooks/useJournalRealtime.ts` — SSE → `notifyJournalCacheUpdated`.
2. `src/app/(dashboard)/api-status/page.tsx` — operational dashboard.
3. `src/app/(dashboard)/api-documentation/page.tsx` — developer docs UI.

---

## In-Source Code Comments

Many files under `src/` carry **`@file` + `WALKTHROUGH`** block comments at the top. These are educational only — they do not change runtime behavior.

| Pattern                           | Meaning                                                |
| --------------------------------- | ------------------------------------------------------ |
| `@file path/relative/to/src`      | Which module you are reading                           |
| `WALKTHROUGH — …`                 | High-level purpose and how it fits the app             |
| `── Section ──` inside components | Feature-specific notes (offline, flip, stagger, cache) |

**Recommended reading order:** `BookSpread.tsx` → `journal-cache-notify.ts` → `journal-api.ts` → `useOfflineSyncQueue.ts` → `AuthBookShell.tsx` → `api-route-catalog.ts`.

---

## Reusable Components & Patterns

These pieces are designed to be copied into other Next.js projects.

### `SafeImage` (`src/components/ui/safe-image.tsx`)

Wraps `next/image` with a fallback chain: primary URL → Robohash → native `<img>`.

**Use when:** loading user avatars from Google/GitHub where URLs may 404.

```tsx
import { SafeImage } from "@/components/ui/safe-image";

<SafeImage
  src={session.user.image}
  alt="Avatar"
  width={32}
  height={32}
  fallbackSrc={`https://robohash.org/${email}?size=64x64`}
/>;
```

### `RippleButton` (`src/components/ui/ripple-button.tsx`)

Water-splash click effect with optional shine radius. Used on auth CTAs, shelf spines, and journal nav.

```tsx
import { RippleButton } from "@/components/ui/ripple-button";

<RippleButton shineRadius={120} className="leather-glass-btn">
  Save
</RippleButton>;
```

### `usePageFlip` (`src/hooks/usePageFlip.ts`)

Manages flip animation state; calls your callback only **after** the animation ends (prevents blank flashes during navigation).

```tsx
const { isFlipping, flipDir, triggerFlip } = usePageFlip();

triggerFlip("fwd", () => {
  router.push("/next-page"); // safe — runs after flip completes
});
```

### `notifyJournalCacheUpdated` (`src/lib/journal-cache-notify.ts`)

Single invalidation entry point for all journal-related TanStack Query data.

```tsx
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";

await notifyJournalCacheUpdated(queryClient);
```

### `ConfirmDialog` (`src/components/feedback/ConfirmDialog.tsx`)

Accessible async confirmation modal with loading state.

**Use when:** destructive actions (delete entry, delete book).

### Offline sync pattern

Copy `src/lib/offline/*` + `useOfflineSyncQueue` for queue-and-drain semantics on any REST API.

### Auth proxy pattern (`src/proxy.ts`)

Next.js 16+ edge boundary — redirect unauthenticated users before protected pages render. API routes still call `auth()` independently.

### `BOOK_THEMES` + `useBookTheme`

Theme tokens in `src/constants/themes.ts` map to CSS variables via `bookThemeCssVars()`. Reuse for any multi-theme document UI.

---

## Code Examples

### Register a new user (API)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"securepass123","displayName":"You"}'
```

### Create a journal book (authenticated)

```typescript
const res = await fetch("/api/books", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Travel Log",
    coverColor: "#1a3a5c",
    coverEmoji: "plane",
    theme: "midnight-journal",
    description: "Road trips and memories",
  }),
});
const { data } = await res.json(); // { id: "cuid...", ... }
```

### Autosave an entry (PATCH)

```typescript
await fetch(`/api/entries/${entryId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Morning thoughts",
    content: "<p>Today I learned...</p>",
    mood: "☕",
    weather: "🌤️",
    tags: ["learning", "morning"],
  }),
});
```

### Server Component data fetch pattern

```tsx
// src/app/(dashboard)/dashboard/page.tsx (simplified)
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const books = await prisma.journalBook.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { entries: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return <BookShelf initialBooks={books} />;
}
```

### Search entries (⌘K or API)

```bash
curl "http://localhost:3000/api/search?q=morning&limit=10" \
  -H "Cookie: <your-session-cookie>"
```

---

## Keywords & SEO

Primary keywords (defined in `src/lib/site-metadata.ts`):

`StoryBook Journal`, `digital journal`, `online diary`, `journaling app`, `smart diary`, `page flip animation`, `immersive writing`, `AI writing assistant`, `personal journal`, `daily journal`, `offline journal`, `IndexedDB sync`, `Next.js journal`, `React diary app`, `Prisma PostgreSQL`, `NextAuth`, `TanStack Query`, `TipTap editor`, `Arnob Mahmud`

**Author:** [Arnob Mahmud](https://www.arnobmahmud.com) · <contact@arnobmahmud.com>

**Live demo:** [https://storybook-journal.vercel.app](https://storybook-journal.vercel.app)

**SEO notes:**

- Root metadata in `src/lib/site-metadata.ts` — title, description, OpenGraph, Twitter, icons (`/diary-1.svg`), author.
- `src/app/sitemap.ts` — `/`, `/login`, `/register`.
- `src/app/manifest.ts` — web app manifest (`/manifest.webmanifest`).
- Public landing `/` is indexable with full OpenGraph/Twitter metadata.
- Dashboard and journal routes set `robots: { index: false }` — private user content stays out of search indexes.
- `src/app/robots.ts` disallows `/api`, `/dashboard`, `/journal` for well-behaved crawlers.

---

## Related Documentation

| Document                                 | Topic                                            |
| ---------------------------------------- | ------------------------------------------------ |
| `docs/PROJECT_WALKTHROUGH.md`            | Deep architecture map and audit notes            |
| `docs/AUTH_UI_IMPLEMENTATION_GUIDE.md`   | OAuth flicker prevention, session patterns       |
| `docs/VERCEL_PRODUCTION_GUARDRAILS.md`   | Security headers, bot protection                 |
| `docs/SAFE_IMAGE_REUSABLE_COMPONENT.md`  | SafeImage implementation details                 |
| `docs/DROPDOWN_TEST_CREDENTIALS_DOCS.md` | Demo account and NextAuth reference              |
| `.env.example`                           | All environment variable templates with comments |

---

## Conclusion

StoryBook Journal demonstrates how to build a **polished, production-style** full-stack app with Next.js 16: tactile UI animations, strict auth boundaries, optimistic offline sync, centralized cache invalidation, and optional AI and realtime layers. Whether you are learning App Router patterns, Prisma modeling, TanStack Query, or offline-first design, this repository provides working code with inline walkthrough comments you can read file-by-file.

Clone it, set four environment variables, run `npm run dev`, and explore the live demo — then open `BookSpread.tsx` and follow the data from browser click to PostgreSQL row and back.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊
