# Agile V Playbook — StoryBook Journal

<!-- Cycle: C4 | Operational guide for every agent prompt | Standard: Agile V 1.4 -->

## Session start (mandatory)

1. Read **`STATE.md`** — cycle, stage, gates, `eval_gate_status`, `resume_token`
2. Honor **`POLICY.yaml`** — traceability, gates, append-only logs
3. Load skills: **`01 core`** → **`02 pipeline`** → domain from **`skills/SKILLS_INDEX.md`**
4. If **`CHECKPOINTS.md`** has `PENDING` → halt until **`APPROVALS.md`** matches `resume_token`
5. Load only current **`phases/XX-*/`** files (not full archive)

## Infinity Loop (per task)

| Phase | Action | Primary skills |
|-------|--------|----------------|
| **Specify** | Atomic REQ or CR with parent traceability | 07, 08, 09, 10, 06 |
| **Constrain** | Validate against POLICY + repo constraints | 11, 13 |
| **Orchestrate** | Implement / test design from approved REQs only | 12, 13, 18 |
| **Prove** | Lint, typecheck, unit, manifest update | 13, 18, 20 |
| **Evolve** | Append DECISION_LOG + CHANGE_LOG | All |
| **Verify** | Red Team independent of Build Agent | 19, 20, 04 |

**Red Team rule:** Build Agent never self-verifies (Directive #4).

## 5-stage pipeline

```
Stage 1 Requirements → Stage 2 Validation → [Gate 1] →
Stage 3 Synthesis → Stage 4 Verification → [Gate 2] → Stage 5 Acceptance
```

| Stage | Living docs | Exit criteria |
|-------|-------------|---------------|
| 1 | REQUIREMENTS.md, RISK_REGISTER.md | Gate 1 approved |
| 2 | phases/02-validation/* | Logic Gatekeeper PASS |
| 3 | BUILD_MANIFEST.md, TEST_SPEC.md | Code + tests drafted |
| 4 | VALIDATION_SUMMARY.md, EVAL_RESULTS.md | Red Team evidence |
| 5 | ATM.md, release notes | Gate 2 PASS/WAIVED |

## Human Gates

| Gate | When | Required artifacts | Approver roles |
|------|------|-------------------|----------------|
| **Gate 1** | After Stage 2 | REQUIREMENTS.md, RISK_REGISTER.md | Product Owner, Tech Lead |
| **Gate 2** | After Stage 4 | VALIDATION_SUMMARY, EVAL_RESULTS, BUILD_MANIFEST, TEST_SPEC | Product Owner, Release Manager |

**Gate 2 block:** `eval_gate_status` must be **PASS** or **WAIVED** (currently **CONDITIONAL** — REQ-0021 e2e in CI).

**HITL pause:** append `CHECKPOINTS.md` (PENDING + `resume_token`) before ending turn.

## Traceability rules

- Every artifact → parent **REQ-XXXX** (halt if missing)
- Every code change → update **BUILD_MANIFEST.md** (ART-XXXX)
- Every test → **TEST_SPEC.md** (TC-XXXX)
- Changes to REQs → **CR-XXXX** in CHANGE_LOG.md first

## Repo architecture constraints (C4)

| Area | Rule |
|------|------|
| Rendering | SSR in `page.tsx`; `force-dynamic` on auth/dashboard/journal + SSE/search APIs |
| Client | Islands only — no blank loading screens |
| Cache | **Only** `notifyJournalCacheUpdated` / `AndRefetch` in `journal-cache-notify.ts` |
| Server writes | `afterJournalMutation()` on books/entries APIs |
| UI tokens | `leather-glass-*`, `--cover-w/h`, `.book-viewport-80`, `LEATHER_GLASS` |
| Offline | Optimistic patch + IndexedDB queue (REQ-0015) |

## Verify commands

```bash
npm run lint && npm run typecheck && npm run test
rm -rf .next && npm run build   # stop dev first if ENOENT
npm run test:e2e:install && npm run dev && npm run test:e2e
```

## Cycle management

| Trigger | Re-entry | Action |
|---------|----------|--------|
| New feature | Stage 1 | New REQ + CR → Gate 1 |
| Bug (no REQ change) | Stage 3 | Fix → re-verify affected TC only |
| Verification fail | Stage 1 | CR → Gate 1 → delta rebuild |
| Gate 2 acceptance | Archive | Snapshot → `cycles/CN/` (frozen) |

## Primary skills (this repo)

**Always load:** 01 → 02 → **13 build-agent-js** → 18 → 19 → 20 → 04

**On demand:** 07 (new REQ), 10 (UX), 11 (validate), 22 (observability), 23 (release)

## Backlog (Gate 2 blockers)

- **REQ-0021** — Playwright e2e in CI
- **REQ-0009** — `SHOW_DEMO_LOGIN=false` for production
- **REQ-0019** — Pino/Sentry observability
- **REQ-0022** — axe accessibility audit

## Current resume (2026-07-05)

- **main:** `709087e` (Waves 1–30)
- **Stage 4** IN_PROGRESS · **eval_gate_status:** CONDITIONAL
- **Verify baseline:** 71 Vitest · lint · typecheck · build PASS
- **Next work:** only with parent REQ-XXXX via Infinity Loop

## Evidence Summary template

```
Scope: [produced/validated] | Traceability: [REQ-IDs] | Findings: [PASS/FAIL/FLAG counts]
Decision Points: [choices] | Log: [TIMESTAMP | AGENT_ID | DECISION | RATIONALE | LINKED_REQ]
```
