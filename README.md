# StoryBook Journal Digital Diary - Next.js, TypeScript, PostgreSQL, Tailwind CSS FullStack Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple)](https://authjs.dev/)

A premium, immersive digital diary built with Next.js. It feels like opening a real leather notebook: 3D cover animations, CSS page-flip transitions, ruled paper, moods, weather, tags, autosave, offline drafts, and optional AI writing assistance — all backed by PostgreSQL and secure authentication.

- **Live Demo:** [https://storybook-journal.vercel.app](https://storybook-journal.vercel.app)

---

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
13. [Reusable Components & Patterns](#reusable-components--patterns)
14. [Code Examples](#code-examples)
15. [Keywords & SEO](#keywords--seo)
16. [Related Documentation](#related-documentation)
17. [License](#license)

---

## What Is This Project?

StoryBook Journal is a **full-stack journaling SaaS-style web application** — not a simple notes CRUD demo. The product goal is emotional and tactile:

- Open a **leather book cover** with a 3D hinge animation
- Browse **multiple journals** on a bookshelf dashboard
- **Flip pages** between daily entries like a real diary
- **Write** with rich content, mood/weather pickers, and tags
- **Autosave** while typing; survive refreshes with **offline drafts**
- **Sync** queued changes when the network returns
- Get **AI writing suggestions** through a secure server proxy (optional)

This repository is designed for **learning**: Server Components for data, Client Components for animation, REST Route Handlers for APIs, Prisma for persistence, TanStack Query for client cache, and IndexedDB for offline resilience.

---

## Key Features

| Feature                    | Description                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **3D book cover**          | Leather texture, gold shine sweep, hover tilt, animated cover open on landing           |
| **Page-flip navigation**   | CSS `preserve-3d` flip overlay; route changes fire _after_ animation completes          |
| **Book spread UI**         | Left page = previous entry + entry list; right page = read/write mode                   |
| **Multiple journals**      | Create books with custom cover color + emoji on the shelf                               |
| **Rich entry metadata**    | Mood, weather, location, tags, word count, reading time                                 |
| **Autosave**               | Debounced PATCH while editing (2 s delay)                                               |
| **Offline-first drafts**   | IndexedDB entry drafts + sync queue for PATCH/POST when offline                         |
| **Optimistic UI**          | TanStack Query cache updates instantly; server sync reconciles later                    |
| **Authentication**         | Email/password (bcrypt) + optional Google OAuth                                         |
| **Demo login**             | Pre-filled test account dropdown on `/login` for quick exploration                      |
| **AI writing assist**      | Anthropic Claude via `/api/ai/assist` (sync + SSE stream); key never exposed to browser |
| **Security headers**       | `X-Frame-Options`, CSP-friendly patterns, dashboard `noindex`                           |
| **SafeImage**              | Remote avatar loading with Robohash fallback                                            |
| **Responsive book sizing** | CSS `clamp()` tokens (`--page-w`, `--page-h`) scale to viewport                         |

---

## Technology Stack

Each library plays a specific role. Understanding _why_ it is here helps you reuse patterns in other projects.

### Core framework

| Library        | Version | Role                                                        |
| -------------- | ------- | ----------------------------------------------------------- |
| **Next.js**    | 16      | App Router, Server Components, Route Handlers, metadata API |
| **React**      | 19      | UI rendering, hooks, client/server component split          |
| **TypeScript** | 5.7     | Strict typing across API, DB, and UI                        |

**Next.js App Router** means pages under `src/app/` are routes. Files named `page.tsx` render URLs; `layout.tsx` wraps nested routes; `route.ts` files inside `api/` become REST endpoints.

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

Sessions use **HttpOnly cookies** (via NextAuth). The user id from Prisma is copied into the JWT so API routes can scope queries with `session.user.id`.

### Client state & UX

| Library             | Role                                                          |
| ------------------- | ------------------------------------------------------------- |
| **TanStack Query**  | Server-state cache, prefetch, invalidation after CRUD         |
| **React Hook Form** | Login/register form state                                     |
| **Sonner**          | Toast notifications (save success, offline queue, errors)     |
| **Framer Motion**   | Available for motion (book uses mostly custom CSS animations) |
| **TipTap**          | Rich text editor extensions (starter kit in dependencies)     |
| **date-fns**        | Format entry dates (`MMMM d, yyyy`, weekday names)            |
| **lucide-react**    | Icon set for nav and UI chrome                                |

### Styling

| Library                        | Role                                                          |
| ------------------------------ | ------------------------------------------------------------- |
| **Tailwind CSS**               | Utility classes for forms, nav, modals                        |
| **Custom CSS (`globals.css`)** | Book aesthetic: leather, paper, flip keyframes, design tokens |

---

## How It Works (Architecture)

```bash
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌──────────────┐
│   Browser   │────▶│  Next.js (App)   │────▶│   Prisma    │────▶│  PostgreSQL  │
│  React UI   │◀────│  Server + API    │◀────│   Client    │◀────│              │
└─────────────┘     └──────────────────┘     └─────────────┘     └──────────────┘
       │                      │
       │ IndexedDB            │ NextAuth JWT
       ▼                      ▼
  Offline drafts         Session cookies
  Sync queue
```

### Request flow (typical journal read)

1. User opens `/journal/[bookId]`.
2. **`src/proxy.ts`** (Next.js 16 edge boundary) checks session; redirects to `/login` if missing.
3. **`journal/[bookId]/page.tsx`** (Server Component) calls `auth()` + `prisma.journalBook.findFirst` with ownership check.
4. Data is passed as `initialBook` to **`BookSpread`** (Client Component).
5. User flips pages → `usePageFlip` animates → index changes locally.
6. User edits → `useAutoSave` debounces → `PATCH /api/entries/[entryId]`.
7. On success → `queryClient.invalidateQueries({ queryKey: queryKeys.journalSubtree() })` refreshes shelf counts everywhere.

### Rendering strategy

| Layer                  | Pattern                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| **Server Components**  | Data fetch in `page.tsx` — no client bundle for Prisma                |
| **Client Components**  | `"use client"` for flip, write mode, forms, offline hooks             |
| **API Route Handlers** | `src/app/api/**/route.ts` — JSON REST, Zod validation, `auth()` guard |

### Offline subsystem

When the browser is offline (or fetch fails):

1. **`useOfflineEntryDraft`** saves draft text to IndexedDB.
2. **`offline-journal-actions`** enqueues PATCH/POST to the sync queue with temp ids (`offline-entry-*`, `offline-book-*`).
3. **`useOfflineSyncQueue`** drains the queue on `window.online`.
4. **`useOfflineIdRemap`** swaps temp ids to server cuids so the reader stays on the correct page.
5. **`DashboardNav`** shows an `{n} offline` badge via `OfflineSyncContext`.

---

## Project Structure

```bash
storybook-journal/
├── prisma/
│   ├── schema.prisma          # User, JournalBook, JournalEntry models
│   ├── seed.ts                # Optional seed script
│   └── migrations/            # SQL migration history
├── public/                    # Static assets (SVG icons, book stack art)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout + SEO metadata
│   │   ├── page.tsx           # Landing (3D cover) → redirect if logged in
│   │   ├── providers.tsx      # SessionProvider, QueryClient, OfflineSync
│   │   ├── robots.ts          # SEO robots rules
│   │   ├── (auth)/            # Login & register (book-spread auth UI)
│   │   ├── (dashboard)/       # Protected shelf + journal reader
│   │   └── api/               # REST Route Handlers
│   ├── components/
│   │   ├── auth/              # AuthBookShell, Google OAuth, OAuthReturnSync
│   │   ├── journal/           # BookSpread, BookShelf, PageFlip, BookCover
│   │   ├── forms/             # LoginForm, RegisterForm
│   │   ├── layout/            # DashboardNav
│   │   ├── feedback/          # ConfirmDialog
│   │   └── ui/                # safe-image, dropdown-menu (shadcn-style)
│   ├── context/
│   │   └── OfflineSyncContext.tsx
│   ├── hooks/                 # usePageFlip, useAutoSave, offline hooks
│   ├── lib/                   # auth, db, validations, journal-api, offline, AI
│   ├── constants/             # MOODS, WEATHERS, cover colors, offline events
│   ├── types/                 # Shared TS interfaces
│   └── proxy.ts               # Auth redirect middleware (Next.js 16+)
├── docs/                      # Extended guides (auth UI, walkthrough, guardrails)
├── .env.example               # Template for all environment variables
├── docker-compose.yml         # Optional local Postgres only (not the app)
├── next.config.ts             # Security headers, image remotePatterns
├── vercel.json                # Vercel header overrides
└── package.json
```

---

## Routes & Pages

| Route               | Type     | Description                                                         |
| ------------------- | -------- | ------------------------------------------------------------------- |
| `/`                 | Server   | Landing cover animation; redirects to `/dashboard` if authenticated |
| `/login`            | Server   | Login form inside book spread; optional Google OAuth                |
| `/register`         | Server   | Registration; creates user + welcome book + entry                   |
| `/dashboard`        | Server   | Bookshelf — lists all journals for the user                         |
| `/journal/[bookId]` | Server   | Open book reader/writer (uses cuid `bookId`, not slug)              |
| `/robots.txt`       | Metadata | Disallows `/api`, `/dashboard`, `/journal` for crawlers             |

**Route groups** `(auth)` and `(dashboard)` do not affect the URL — they organize layouts only.

Auth and dashboard pages use `export const dynamic = "force-dynamic"` so session data is always fresh (no stale cached HTML for private routes).

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
| PATCH     | `/api/books/[bookId]`     | ✅   | Update title, cover, description; slug sync on title change   |
| DELETE    | `/api/books/[bookId]`     | ✅   | Delete book and cascade entries                               |
| POST      | `/api/entries`            | ✅   | Create entry in owned book                                    |
| PATCH     | `/api/entries/[entryId]`  | ✅   | Autosave / manual save; recalculates wordCount, excerpt, slug |
| DELETE    | `/api/entries/[entryId]`  | ✅   | Delete entry (ownership scoped)                               |
| POST      | `/api/ai/assist`          | ✅   | Sync AI continuation (rate limited)                           |
| POST      | `/api/ai/assist/stream`   | ✅   | SSE streaming AI continuation                                 |
| GET       | `/api/health`             | —    | Health check for monitoring                                   |

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

---

## Database Schema

Three main models in `prisma/schema.prisma`:

### User

Stores account credentials and profile. `passwordHash` is null for OAuth-only users. Relations: `books[]`, `entries[]`.

### JournalBook

A journal on the shelf. Unique constraint: `@@unique([userId, slug])`. Fields include `coverColor`, `coverEmoji`, `theme`, `visibility`.

### JournalEntry

A single diary page. `tags` is stored as a **JSON string** (e.g. `"[\"morning\",\"coffee\"]"`) — parsed in app code with `parseTags()`. Unique: `@@unique([bookId, slug])`.

**Cascade deletes:** Deleting a user removes their books and entries.

---

## Environment Variables

Copy the template and fill in values:

```bash
cp .env.example .env
```

### Required (app will not run without these)

| Variable       | Description                                     | How to obtain                                                                                                                   |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma queries | [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), local Docker, or any Postgres host |
| `DIRECT_URL`   | Direct Postgres URL for migrations/`db push`    | Same as `DATABASE_URL` unless you use a connection pooler (then use direct host for migrations)                                 |
| `AUTH_SECRET`  | NextAuth JWT signing secret                     | Run: `openssl rand -base64 32`                                                                                                  |
| `NEXTAUTH_URL` | Public app URL                                  | `http://localhost:3000` locally; `https://your-domain.vercel.app` in production                                                 |

**Example `.env` for local development:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storybook"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/storybook"
AUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

> **Note:** There is no `.env` committed to the repo (by design). You must create one from `.env.example`. Without `DATABASE_URL` and `AUTH_SECRET`, the app cannot authenticate or persist data.

### Optional (features degrade gracefully when unset)

| Variable                                    | Feature                        | Behavior when missing                                   |
| ------------------------------------------- | ------------------------------ | ------------------------------------------------------- |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | Google OAuth login             | Google button hidden; email/password still works        |
| `GOOGLE_ID` + `GOOGLE_SECRET`               | Legacy aliases                 | Same as above — supported for backward compatibility    |
| `ANTHROPIC_API_KEY`                         | AI writing assist              | Returns a poetic placeholder sentence; UI still works   |
| `SHOW_DEMO_LOGIN`                           | Demo account dropdown on login | Defaults to **on**; set `"false"` to hide in production |

### Where to set variables

| Environment | Location                                   |
| ----------- | ------------------------------------------ |
| Local       | `.env` or `.env.local` in project root     |
| Vercel      | Project → Settings → Environment Variables |
| CI          | GitHub Actions secrets or your pipeline    |

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **PostgreSQL** 14+ (hosted or local)

### Quick start (5 steps)

```bash
# 1. Clone and enter the project
git clone https://github.com/your-username/storybook-journal.git
cd storybook-journal

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

Then uncomment the Docker lines in `.env.example`:

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

| Script           | Command               | Purpose                                       |
| ---------------- | --------------------- | --------------------------------------------- |
| Dev server       | `npm run dev`         | Hot reload at localhost:3000                  |
| Production build | `npm run build`       | Compile for deployment                        |
| Start production | `npm run start`       | Run built app                                 |
| Lint             | `npm run lint`        | ESLint check                                  |
| Lint fix         | `npm run lint:fix`    | Auto-fix lint issues                          |
| Typecheck        | `npm run typecheck`   | `tsc --noEmit`                                |
| Prisma generate  | `npm run db:generate` | Regenerate Prisma client after schema changes |
| Push schema      | `npm run db:push`     | Sync schema to DB (dev-friendly)              |
| Migrate          | `npm run db:migrate`  | Create/apply migrations                       |
| Prisma Studio    | `npm run db:studio`   | Visual DB browser                             |
| Seed             | `npm run db:seed`     | Run `prisma/seed.ts`                          |
| Full setup       | `npm run setup`       | install + generate + db push                  |

---

## Learning Walkthrough

Follow this path if you are new to the codebase.

### Step 1 — Landing & auth

1. Start at `src/app/page.tsx` — session check + `LandingCover`.
2. Read `src/components/journal/BookCover.tsx` — 3D hinge CSS animation.
3. Explore `src/app/(auth)/login/page.tsx` and `AuthBookShell.tsx` — page flip between login/register.

### Step 2 — Dashboard shelf

1. `src/app/(dashboard)/dashboard/page.tsx` — Server Component fetches books.
2. `src/components/journal/BookShelf.tsx` — client shelf, create book modal, prefetch on hover.

### Step 3 — Journal reader (core)

1. `src/app/(dashboard)/journal/[bookId]/page.tsx` — loads book + entries server-side.
2. **`src/components/journal/BookSpread.tsx`** — the orchestrator: flip, autosave, offline, AI.
3. `LeftPage.tsx` / `RightPage.tsx` — read vs write UI.
4. `src/hooks/usePageFlip.ts` — animation timing and re-entrancy guard.

### Step 4 — API & validation

1. Pick any route in `src/app/api/entries/[entryId]/route.ts`.
2. Compare with `src/lib/validations.ts` — same Zod shapes the API expects.
3. See `src/lib/journal-slug.ts` — slug uniqueness when titles change.

### Step 5 — Client cache

1. `src/lib/query-keys.ts` — central cache keys.
2. After any save, search for `journalSubtree()` invalidation — one call refreshes shelf + open book.

### Step 6 — Offline (advanced)

1. `src/lib/offline/idb.ts` — IndexedDB wrapper.
2. `src/hooks/useOfflineSyncQueue.ts` — FIFO drain on reconnect.
3. `src/context/OfflineSyncContext.tsx` — global pending count for nav badge.

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

### `usePageFlip` (`src/hooks/usePageFlip.ts`)

Manages flip animation state; calls your callback only **after** the animation ends (prevents blank flashes during navigation).

**Use when:** building book/carousel UIs where content must swap post-animation.

```tsx
const { isFlipping, flipDir, triggerFlip } = usePageFlip();

triggerFlip("fwd", () => {
  router.push("/next-page"); // safe — runs after 650ms flip
});
```

### `queryKeys.journalSubtree()` (`src/lib/query-keys.ts`)

Single invalidation root for related queries.

**Use when:** multiple `useQuery` hooks share a domain and should refetch together after mutations.

```tsx
await queryClient.invalidateQueries({ queryKey: queryKeys.journalSubtree() });
```

### `ConfirmDialog` (`src/components/feedback/ConfirmDialog.tsx`)

Accessible async confirmation modal with loading state.

**Use when:** destructive actions (delete entry, delete book, sign out).

### Offline sync pattern

Copy `src/lib/offline/*` + `useOfflineSyncQueue` if you need queue-and-drain semantics for any REST API — not journal-specific at the storage layer.

### Auth proxy pattern (`src/proxy.ts`)

Next.js 16+ replacement for middleware — wrap NextAuth and redirect unauthenticated users before pages render.

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
    coverEmoji: "✈️",
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

---

## Keywords & SEO

Primary keywords (also defined in `src/lib/site-metadata.ts`):

`StoryBook Journal`, `digital journal`, `online diary`, `journaling app`, `page flip animation`, `immersive writing`, `AI writing assistant`, `personal journal`, `daily journal`, `Next.js journal`, `React diary app`, `offline journal`, `Prisma PostgreSQL`, `NextAuth`, `TanStack Query`

**SEO notes:**

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

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊
