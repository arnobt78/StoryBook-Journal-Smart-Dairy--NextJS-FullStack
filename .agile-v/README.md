# Agile V — StoryBook Journal

<!-- Cycle: C4 | Revision: C4-ui-tags-2026-06-07 | Standard: Agile V 1.4 -->

Living **AQMS** for this repository.

**Every agent prompt:** `.cursor/rules/agile-v.mdc` (`alwaysApply: true`) → read `STATE.md` → honor `POLICY.yaml`.

## Quick start

1. **`STATE.md`** — cycle **C4**, stage, gates
2. **`REQUIREMENTS.md`** — REQ-0001–**0031**
3. **`skills/SKILLS_INDEX.md`** — 24 agent manifests
4. **`DECISION_LOG.md`** — append-only decisions
5. Human Gate → **`CHECKPOINTS.md`** + **`APPROVALS.md`**

## C4 snapshot (2026-06-07)

| Metric | Value |
|--------|-------|
| Requirements | **31** (26 implemented, 5 backlog/partial) |
| Artifacts | ART-0001–**0078** |
| Test cases | TC-0001–**0035** |
| Skills | 24 in `skills/` |
| Vitest | **16 PASS** |
| Stage | 4 Verification |
| Commit | `8f88e90` |
| Gate 2 | PENDING (REQ-0021 CI e2e) |

## Cycles

| Cycle | Folder | Theme |
|-------|--------|-------|
| C1 | `cycles/C1/` | Foundation |
| C2 | `cycles/C2/` | Platform upgrade |
| C3 | `cycles/C3/` | Consistency |
| C4 | `cycles/C4/` | UI + tags (active) |

## Primary skills

`01 core` → `02 pipeline` → `07 req-architect` → `11 gatekeeper` → **`13 build-agent-js`** → `18 test-designer` → `19 red-team` → `20 compliance` → `04 quality-gates`

## Traceability rule

**Never create an artifact without parent REQ-XXXX.**
