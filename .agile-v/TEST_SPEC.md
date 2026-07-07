# Test Specification

<!-- TC-XXXX — Red Team updates Status after each run -->

| TC-ID | Cycle | Linked REQ | Description | Type | Status | Last run |
|-------|-------|------------|-------------|------|--------|----------|
| TC-0001 | C1 | REQ-0001 | Register new user → redirect dashboard | e2e | NOT RUN | — |
| TC-0002 | C1 | REQ-0001 | Login credentials → session cookie | e2e | NOT RUN | — |
| TC-0003 | C1 | REQ-0002 | Create book → appears on shelf | integration | NOT RUN | — |
| TC-0004 | C1 | REQ-0003 | Save entry PATCH persists content | integration | NOT RUN | — |
| TC-0005 | C1 | REQ-0003 | New entry POST + page flip | e2e | NOT RUN | — |
| TC-0006 | C1 | REQ-0004 | Page flip fwd/bwd without blank spread | e2e | NOT RUN | — |
| TC-0007 | C1 | REQ-0005 | Landing cover opens without error | e2e | NOT RUN | — |
| TC-0008 | C1 | REQ-0006 | Profile dropdown + sign-out overlay | e2e | NOT RUN | — |
| TC-0009 | C1 | REQ-0007 | CRUD invalidates shelf without reload | integration | **PASS** (static) | 2026-06-01 |
| TC-0010 | C1 | REQ-0008 | New book opens with starter entry | integration | **PASS** (static) | 2026-06-01 |
| TC-0011 | C1 | REQ-0009 | Demo account fill + login (dev) | e2e | NOT RUN | — |
| TC-0012 | C1 | REQ-0010 | AI assist appends text or graceful error | integration | NOT RUN | — |
| TC-0013 | C1 | REQ-0011 | Spread scales at 1280/1440/768 widths | manual | NOT RUN | — |
| TC-0014 | C1 | REQ-0012 | Unauthorized API returns 401 | integration | **PASS** (static) | 2026-06-01 |
| TC-0015 | C1 | REQ-0013 | TipTap formatting persists | e2e | PLANNED | — |
| TC-0016 | C1 | REQ-0014 | Two tabs receive entry update | e2e | PLANNED | — |
| TC-0017 | C1 | REQ-0015 | Offline enqueue → online drain → id remap | e2e | **PASS** (static); live NOT RUN | 2026-06-01 |
| TC-0018 | C1 | REQ-0016 | Search finds entry by tag | integration | PLANNED | — |
| TC-0019 | C1 | REQ-0017 | Command palette opens with ⌘K | e2e | **PASS** (local spec) | 2026-06-01 |
| TC-0020 | C1 | REQ-0018 | Theme cycle via ⌘K palette | e2e | **PASS** (local spec) | 2026-06-01 |
| TC-0021 | C1 | REQ-0019 | GET /api/health returns ok JSON | integration | **PASS** (static) | 2026-06-01 |
| TC-0022 | C1 | REQ-0020 | `next build` succeeds; no app Dockerfile | ci | **PASS** (static) | 2026-06-01 |
| TC-0023 | C1 | REQ-0022 | axe: no critical a11y on login | a11y | FLAG | 2026-06-01 partial |
| TC-0024 | C1 | REQ-0023 | Root metadata title present | unit | **PASS** (static) | 2026-06-01 |
| TC-0025 | C1 | REQ-0025 | Prisma PostgreSQL schema + db push | integration | **PASS** (static) | 2026-06-01 |
| TC-0026 | C1 | REQ-0026 | Tracked files exclude secrets / VPS IP | audit | **PASS** (static) | 2026-06-01 |
| TC-0027 | C1 | REQ-0027 | docker-compose db-only documented | audit | **PASS** (static) | 2026-06-01 |
| TC-0028 | C1 | REQ-0010 | AI rate limit returns 429 when exceeded | integration | **PASS** (static) | 2026-06-01 |
| TC-0029 | C1 | REQ-0023 | robots.ts disallows /dashboard, /journal | audit | **PASS** (static) | 2026-06-01 |
| TC-0030 | C1 | REQ-0028 | Security headers + SafeImage fallback | audit | **PASS** (static) | 2026-06-01 |
| TC-0031 | C4 | REQ-0029 | Landing typewriter + auth footers + RippleButton icons | audit | **PASS** | 2026-06-07 |
| TC-0032 | C4 | REQ-0030 | Leather glass CSS tokens + 70% cover | audit | **PASS** | 2026-06-07 |
| TC-0033 | C4 | REQ-0030 | Nav AvatarRing circular; toast center align | audit | **PASS** | 2026-06-07 |
| TC-0034 | C4 | REQ-0031 | Tag PATCH persists to DB (mergePendingTag) | unit+db | **PASS** | 2026-06-07 |
| TC-0035 | C4 | REQ-0031 | Tags visible on long entry; × removes in edit | audit | **PASS** | 2026-06-07 |
| TC-0036 | C4 | REQ-0029 | Self-hosted fonts + landing cover redesign | audit | **PASS** | 2026-06-28 |
| TC-0037 | C4 | REQ-0030 | Auth spotlight + dashboard stagger + nav pill | audit | **PASS** | 2026-06-28 |
| TC-0038 | C4 | REQ-0024 | Wave 3 deep audit micro-fixes | audit | **PASS** | 2026-06-28 |
| TC-0039 | C4 | REQ-0029–0030 | Radix journal dialog + Lucide cover icons + theme preview | audit+unit | **PASS** | 2026-06-29 |
| TC-0040 | C4 | REQ-0029–0030 | BookSpineMark inline + dialog glow unclip + shelf glow | audit | **PASS** | 2026-06-29 |
| TC-0041 | C4 | REQ-0005, REQ-0029 | Landing handoff + auth book enter CSS | unit+audit | **PASS** | 2026-06-29 |
| TC-0044 | C4 | REQ-0032 | api-route-catalog completeness (no dup paths) | unit | **PASS** | 2026-07-06 |
| TC-0045 | C4 | REQ-0032 | getApiStatus payload shape | unit | **PASS** | 2026-07-06 |
| TC-0046 | C4 | REQ-0010 | ai-provider shuffle fallback chain (Groq→OpenRouter→placeholder; rateLimited) | unit | **PASS** | 2026-07-07 |

## Regression baseline (Gate 2)

TC-0001–0014 + TC-0021–0046 — **29 PASS static/unit, 1 FLAG, 15 NOT RUN e2e**
