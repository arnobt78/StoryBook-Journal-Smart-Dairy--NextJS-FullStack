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
| 2026-06-01T20:00:00Z | DEC-0017 | C3 | build-agent-js | Single invalidation via journal-cache-notify.ts | Prevents scattered journalSubtree invalidates | REQ-0007 |
| 2026-06-01T22:00:00Z | DEC-0018 | C4 | ux-spec-author | Leather glass amber variant not sky-blue | Maps UI_STYLING_GUIDE to journal palette | REQ-0030 |
| 2026-06-01T22:00:01Z | DEC-0019 | C4 | build-agent-js | RippleButton skips default borderRadius unless shine | Preserves rounded-full nav avatar | REQ-0030 |
| 2026-06-01T22:00:02Z | DEC-0020 | C4 | build-agent-js | Auth OAuth uses buttonOutlinePaper not landing outline | Dark text on cream paper readability | REQ-0030 |
| 2026-06-07T00:30:00Z | DEC-0021 | C4 | red-team-verifier | DB audit: Midnight Thoughts tags `[]` while mood saved | Root cause pending-tag input not in PATCH payload | REQ-0031 |
| 2026-06-07T00:35:00Z | DEC-0022 | C4 | build-agent-js | mergePendingTag on blur/save before PATCH | Fixes tag persistence without requiring Enter | REQ-0031 |
| 2026-06-07T00:40:00Z | DEC-0023 | C4 | build-agent-js | Read body minHeight:0 — tags clipped on long entries | Flex overflow fix separate from DB issue | REQ-0031 |
| 2026-06-07T00:42:00Z | DEC-0024 | C4 | build-agent-js | JournalEntryTagsEditor with × remove in write mode | Tags editable like mood/weather pickers | REQ-0031 |
| 2026-06-07T00:45:00Z | DEC-0025 | C4 | agile-v-bootstrap | C4 AQMS re-baseline REQ-0029–0031 | Full traceability for UI+tags work; cursor rule alwaysApply | REQ-0024 |
