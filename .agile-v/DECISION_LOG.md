# Decision Log (append-only)

<!-- Principle #9 — never overwrite; cycle-tag entries -->

| Timestamp | ID | Cycle | Agent | Decision | Rationale | Linked REQ |
|-----------|-----|-------|-------|----------|-----------|------------|
| 2026-03-16T00:00:00Z | DEC-0001 | C1 | bootstrap-agent | Initialize `.agile-v/` C1 living AQMS | User requested Agile V Infinity Loop bootstrap with REQ traceability | REQ-0024 |
| 2026-03-16T00:00:01Z | DEC-0002 | C1 | bootstrap-agent | Tag REQs 0001–0012 as `implemented` retroactive baseline | Codebase already contains auth, shelf, spread, nav, query invalidation | REQ-0001–0012 |
| 2026-03-16T00:00:03Z | DEC-0004 | C1 | bootstrap-agent | Use TanStack `journalSubtree()` as standard CRUD invalidation | Matches src/lib/query-keys.ts; POLICY.yaml enforces | REQ-0007 |
| 2026-03-16T00:00:05Z | DEC-0006 | C1 | bootstrap-agent | Gitignore Hetzner migration guide | Ops doc stays local only | REQ-0026 |
| 2026-03-16T12:00:00Z | DEC-0007 | C1 | logic-gatekeeper | Stage 2 PASS with 4 FLAGS | GATE-0001 approved blueprint | REQ-0024 |
| 2026-03-16T12:00:01Z | DEC-0008 | C1 | red-team-verifier | Stage 4 static PASS; e2e NOT RUN | REQ-0021 blocks Gate 2 | REQ-0021 |
| 2026-06-01T12:00:00Z | DEC-0009 | C1 | bootstrap-agent | C1 re-baseline after PostgreSQL + fresh GitHub | Prisma postgresql; remote DB; user deleted old repo for clean history | REQ-0025, REQ-0026 |
| 2026-06-01T12:00:01Z | DEC-0010 | C1 | bootstrap-agent | Vercel-native deploy; remove app Dockerfile | No Docker app image; docker-compose Postgres-only optional | REQ-0020, REQ-0027 |
| 2026-06-01T12:00:02Z | DEC-0011 | C1 | bootstrap-agent | Add REQ-0025–0027; amend GATE-0003 | Infrastructure traceability for Gate 2 readiness | REQ-0025–0027 |
| 2026-06-01T12:00:03Z | DEC-0012 | C1 | bootstrap-agent | Demo credentials flagged for prod disable | test@user.com in UI acceptable dev-only; CR before Vercel prod | REQ-0009, RISK-0006 |
| 2026-06-01T18:00:00Z | DEC-0013 | C1 | agile-v-bootstrap | C1 r2 Infinity Loop re-baseline | Align AQMS with commits 22fa6ef+72bb670; activate Cursor rule | REQ-0024 |
| 2026-06-01T18:00:01Z | DEC-0014 | C1 | agile-v-bootstrap | REQ-0015 promoted implemented via CR-0002 | Offline MVP complete: IndexedDB, queue, optimistic cache | REQ-0015 |
| 2026-06-01T18:00:02Z | DEC-0015 | C1 | agile-v-bootstrap | REQ-0028 registered (guardrails+SafeImage) | Security headers, robots, slug PATCH, force-dynamic | REQ-0028 |
| 2026-06-01T18:00:03Z | DEC-0016 | C1 | red-team-verifier | Static verify PASS +5 TC (0017,0028–0030) | Stage 3 synthesis complete; Gate 2 still blocked on e2e | REQ-0021 |
