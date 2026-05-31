# Validation Summary — Cycle C1

| Field | Value |
|-------|-------|
| **Cycle** | C1 |
| **Revision** | C1-bootstrap-2026-06-01 |
| **Status** | Stage 4 static complete; e2e pending |
| **Stage** | 4 Verification |
| **eval_gate_status** | CONDITIONAL |
| **Last Updated** | 2026-06-01T12:00:00Z |
| **Verifier** | red-team-verifier (static); independent of Build Agent context |

## Evidence Summary

```
Scope: static verify implemented REQs incl. infra amendment | Traceability: REQ-0001–0012, 0019–0020, 0022–0027
Findings: PASS 11 | FLAG 1 | FAIL 0 | NOT RUN 16 (e2e/integration harness)
Decision Points: Gate 2 held until REQ-0021; demo prod gate REQ-0009
Log: 2026-06-01 | bootstrap-agent | C1 re-baseline | REQ-0025–0027 static PASS
```

## EvalGate line (Gate 2 prerequisite)

```
eval_gate_status: CONDITIONAL | waiver: none | approver: — | ref: EVAL_RESULTS.md
Gate 2 NOT READY — execute TC-0001–0014, TC-0025–0027 after Vitest/Playwright + running app
```

## Static verification results (Red Team)

| TC | REQ | Method | Result | Notes |
|----|-----|--------|--------|-------|
| TC-0009 | REQ-0007 | code audit | **PASS** | `journalSubtree()` invalidation pattern |
| TC-0010 | REQ-0008 | code audit | **PASS** | Prisma `$transaction` starter entry |
| TC-0014 | REQ-0012 | code audit | **PASS** | `auth()` + 401; Zod validation |
| TC-0021 | REQ-0019 | code audit | **PASS** | `/api/health` JSON |
| TC-0024 | REQ-0023 | code audit | **PASS** | Root metadata in layout.tsx |
| TC-0025 | REQ-0025 | code audit | **PASS** | schema.prisma `provider = postgresql`; directUrl |
| TC-0026 | REQ-0026 | code audit | **PASS** | .gitignore excludes .env + Hetzner guide; .env.example generic |
| TC-0027 | REQ-0027 | code audit | **PASS** | docker-compose db-only; README documents optional use |
| TC-0022 | REQ-0020 | code audit | **PASS** | No Dockerfile; next.config.ts present |
| TC-0023 | REQ-0022 | code audit | **FLAG** | Profile aria-label ✅; full axe NOT RUN |
| TC-0001–0008 | REQ-0001–0006 | e2e | NOT RUN | No Playwright |
| TC-0011–0013 | REQ-0009–0011 | e2e/manual | NOT RUN | — |
| TC-0012 | REQ-0010 | integration | NOT RUN | Requires API key + session |

## Tooling checks

| Check | Result |
|-------|--------|
| `npm run lint` | PASS (last run 2026-03-16) |
| `npx tsc --noEmit` | PASS (last run 2026-03-16) |
| Tracked files secret scan | PASS (2026-06-01) |

## REQ rollup (implemented)

| REQ | Red Team |
|-----|----------|
| REQ-0007, 0008, 0012 | PASS (static) |
| REQ-0019, 0023 | PASS (static) |
| REQ-0020, 0025–0027, 0024 | PASS (static) |
| REQ-0009 | FLAG (prod demo gate open) |
| REQ-0001–0006, 0010–0011 | NOT RUN (e2e) — no FAIL |

## Human Gate 2 readiness

**NOT READY** — implement REQ-0021 test harness; disable demo account for prod (REQ-0009); re-run full TC suite.
