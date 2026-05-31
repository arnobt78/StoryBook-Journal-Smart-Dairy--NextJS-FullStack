# Phase 01 — Context

## Product

**StoryBook Journal** — premium immersive journaling SaaS (Next.js 16, React 19, Prisma PostgreSQL, TanStack Query, Vercel target).

## User intent (C1 bootstrap 2026-06-01)

- Establish Agile V AQMS with full traceability (27 REQs)
- Document implemented baseline + infrastructure pivot
- Plan extension: TipTap, realtime, offline, search, automated tests

## Constraints

- No hydration regressions; query invalidation on all CRUD
- Server-only secrets; POLICY.yaml enforced; public GitHub sanitized
- Human gates before synthesis changes to approved REQs
- Demo credentials dev-only until Vercel prod (REQ-0009)

## References

- `README.md` — setup, PostgreSQL, optional docker-compose
- `docs/VERCEL_PRODUCTION_GUARDRAILS.md` — REQ-0020
- `docs/HETZNER_VPS_MIGRATION_GUIDE.md` — local ops only (gitignored)
- `src/lib/query-keys.ts` — REQ-0007
