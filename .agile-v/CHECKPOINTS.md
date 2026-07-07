# Checkpoints (durable HITL)

<!-- INTERRUPT-ID | resume_token | status -->

| INT-ID | Cycle | Gate | Status | due_at | resume_token | Scope | Created |
|--------|-------|------|--------|--------|--------------|-------|---------|
| — | — | — | — | — | — | No pending interrupts | — |

## Planned discussion (non-HITL — 2026-07-07)

| Topic | Doc | Code touch |
|-------|-----|------------|
| Groq model deprecation + fallback strategy | `docs/LLM_MODEL_SELECTION.md` | `src/lib/ai-provider.ts`, `.env.example` |

Details: `.agile-v/NEXT_SESSION.md`

## Resume protocol

1. Find row with `status=PENDING`.
2. Human action recorded in APPROVALS.md with matching `resume_token`.
3. Agent reads STATE.md + checkpoint; continues from documented stage only.
