# Agile V — StoryBook Journal

<!-- Cycle: C4 | Revision: C4-wave48-2026-07-06 | Standard: Agile V 1.4 -->

Living **AQMS** for this repository.

**Every agent prompt:** `.cursor/rules/agile-v.mdc` (`alwaysApply: true`) → read `STATE.md` → honor `POLICY.yaml`.

## Quick start

1. **`STATE.md`** — cycle **C4**, stage, gates
2. **`NEXT_SESSION.md`** — resume after 2026-07-06 (Groq / LLM doc)
3. **`PLAYBOOK.md`** — Infinity Loop + session protocol
4. **`REQUIREMENTS.md`** — REQ-0001–**0032**
5. **`cycles/C4/README.md`** — wave index through **48**
5. **`skills/SKILLS_INDEX.md`** — 24 agent manifests
6. Human Gate → **`CHECKPOINTS.md`** + **`APPROVALS.md`**

## C4 snapshot (2026-07-06 end of day)

| Metric | Value |
|--------|-------|
| Requirements | **32** (27 implemented, 5 backlog/partial) |
| Artifacts | ART-0001–**0107** |
| Waves | **1–48** done (UI 1–43, voice 47, auth/save 48) |
| Vitest | **123 PASS** |
| Stage | 4 Verification |
| Commit | `ec8ec35` |
| Gate 2 | CONDITIONAL (REQ-0021 CI e2e) |
| Next | Groq model migration — `docs/LLM_MODEL_SELECTION.md` |

## Cycles

| Cycle | Folder | Theme |
|-------|--------|-------|
| C1 | `cycles/C1/` | Foundation |
| C2 | `cycles/C2/` | Platform upgrade |
| C3 | `cycles/C3/` | Consistency |
| C4 | `cycles/C4/` | UI + tags (**active**) |

## Primary skills (UI work)

`01 core` → `02 pipeline` → **`10 ux-spec-author`** → **`13 build-agent-js`** → `18 test-designer` → `19 red-team`

## Traceability rule

**Never create an artifact without parent REQ-XXXX.**
