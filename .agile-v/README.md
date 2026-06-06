# Agile V — StoryBook Journal

<!-- Cycle: C1 | Revision: C1-bootstrap-2026-06-01-r2 | Standard: Agile V 1.4 -->

Living **AQMS** for this repository. **Every agent prompt:** load `agile-v-core` → read `STATE.md` → honor `POLICY.yaml`.

**Cursor activation:** `.cursor/rules/agile-v.mdc` (`alwaysApply: true`)

## Quick start

1. **`STATE.md`** — cycle, stage, gates, `eval_gate_status`
2. **`REQUIREMENTS.md`** — REQ-0001–0028; halt without parent REQ
3. **`skills/SKILLS_INDEX.md`** — 24 agent manifests
4. Human Gate pause → **`CHECKPOINTS.md`** + **`APPROVALS.md`**

## C1 snapshot (r2)

| Metric | Value |
|--------|-------|
| Requirements | 28 (21 implemented, 5 backlog, 2 process) |
| Artifacts | ART-0001–0048 |
| Test cases | TC-0001–0030 |
| Skills | 24 in `skills/` |
| Stage | 4 Verification (static PASS; e2e pending) |
| Commit | `72bb670` |
| Gate 1 | GATE-0001 + GATE-0003 ✅ |
| Gate 2 | PENDING (REQ-0021) |
| eval_gate_status | CONDITIONAL |

## Infinity Loop

```
Specify → Constrain → Orchestrate → Prove → Evolve → Verify → Accept
```

- **Error fix:** REQ → TC → Stage 4 → `DECISION_LOG.md`
- **Extension:** CR-XXXX → Stage 1–4 per impact

## Pipeline

```
Stage 1 Requirements → Stage 2 Validation → [Gate 1] →
Stage 3 Synthesis → Stage 4 Verification → [Gate 2] → Stage 5 Acceptance
```

## Primary skills (this repo)

01 core → 02 pipeline → 07 req-architect → 11 gatekeeper → **13 build-agent-js** → 18 test-designer → 19 red-team → 20 compliance → 04 compliance-gates

## Traceability rule

**Never create an artifact without parent REQ-XXXX.**
