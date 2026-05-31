# Agile V — StoryBook Journal

<!-- Cycle: C1 | Revision: C1-bootstrap-2026-06-01 | Standard: Agile V 1.4 -->

Living **Autonomous Quality Management System (AQMS)** for this repository. All agents load **agile-v-core** first, then domain skills on demand.

## Quick start

1. Read **`STATE.md`** — cycle, stage, gate, `eval_gate_status`, resume token.
2. Read **`REQUIREMENTS.md`** — REQ-0001–0027 source of truth; halt if parent REQ missing.
3. On Human Gate pause, read **`CHECKPOINTS.md`** + **`APPROVALS.md`** before resuming.
4. Append only to **`DECISION_LOG.md`**, **`TRACE_LOG.md`**, **`CHANGE_LOG.md`**.

## C1 snapshot (2026-06-01)

| Metric | Value |
|--------|-------|
| Requirements | 27 (18 implemented/partial, 6 planned backlog, 3 process) |
| Artifacts | ART-0001–0036 |
| Test cases | TC-0001–0027 |
| Skills | 24 manifests in `skills/` |
| Stage | 4 Verification (static PASS; e2e pending) |
| Gate 1 | GATE-0001 + GATE-0003 approved |
| Gate 2 | PENDING (REQ-0021) |

## Infinity Loop (fix & extend)

```
Specify → Constrain → Orchestrate → Prove → Evolve → Verify → (Accept)
```

- **Bug fix:** trace to REQ → TC → Stage 4 verify → DECISION_LOG
- **Feature:** CR-XXXX → Stage 1–2 → Gate 1 if scope change → Stage 3–4

## File map

| File | Purpose |
|------|---------|
| `STATE.md` | Current phase/stage/status |
| `REQUIREMENTS.md` | Traceable REQs (Gate 1 artifact) |
| `BUILD_MANIFEST.md` | ART-XXXX artifact registry |
| `TEST_SPEC.md` | TC-XXXX test cases |
| `VALIDATION_SUMMARY.md` | Red Team / cycle validation rollup |
| `DECISION_LOG.md` | Append-only decisions (Principle #9) |
| `ATM.md` | Audit traceability matrix |
| `CHANGE_LOG.md` | CR-XXXX change requests |
| `RISK_REGISTER.md` | RISK-XXXX register |
| `CAPA_LOG.md` | CAPA-XXXX nonconformance |
| `APPROVALS.md` | GATE-XXXX human signatures |
| `REVALIDATION_LOG.md` | REVAL-XXXX periodic review |
| `EVAL_RESULTS.md` | Eval flywheel + Gate 2 `eval_gate_status` |
| `CHECKPOINTS.md` | Durable HITL interrupts |
| `TRACE_LOG.md` | Policy/tool spans |
| `POLICY.yaml` | Policy-as-code |
| `config.json` | Project + LLM registry |
| `skills/` | 24 agent skill manifests |
| `phases/` | Stage PLAN / SUMMARY / CONTEXT |
| `cycles/C1/` | Frozen snapshot on Gate 2 accept |

## Pipeline (5 stages)

```
Stage 1 Requirements → Stage 2 Validation → [Gate 1] →
Stage 3 Synthesis (Build ∥ Test Design) → Stage 4 Verification → [Gate 2] → Stage 5 Acceptance
```

Compliance Auditor observes all stages.

## Primary skills (this repo)

**01** core → **02** pipeline → **07** requirement-architect → **11** logic-gatekeeper → **13** build-agent-js → **18** test-designer → **19** red-team-verifier → **20** compliance-auditor → **04** compliance gates

## Traceability rule

**Never create an artifact without a parent REQ-XXXX.**
