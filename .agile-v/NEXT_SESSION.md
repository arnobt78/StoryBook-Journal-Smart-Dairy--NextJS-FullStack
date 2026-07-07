# Next session resume — 2026-07-07+

<!-- Agent: read after STATE.md when resuming work -->

## Shipped (2026-07-07)

| Wave | Theme |
|------|-------|
| **49** | Groq model migration — `ai-provider.ts` shuffle chains, dynamic toasts, `docs/LLM_MODEL_SELECTION.md` |

**Verify:** `npm run verify` · **129** Vitest · build PASS

## Wave 49 summary

- Replaced deprecated `llama-3.3-70b-versatile` with hardcoded Groq + OpenRouter shuffle chains
- `GROQ_MODELS`: gpt-oss-20b, qwen3.6-27b, gpt-oss-120b
- `OPENROUTER_MODELS`: llama-3.3-70b-instruct:free, deepseek-chat-v3-0324:free, gpt-oss-20b:free
- Dynamic `retryAfterSec` toasts on 429; `rateLimited` when all providers exhausted
- TC-0046: `ai-provider.test.ts` (6 Vitest)
- CR-0006 / DEC-0080 / ART-0108

## Backlog (unchanged)

- REQ-0021 e2e in CI
- Roll `auth()` wrapper to books/entries POST (optional)
- DRY `journal-api` through `journalFetch` for all mutations

## Do not redo

- Groq migration — done Wave 49
- Voice stop / Quick transcript — fixed Wave 48
- Entry save 401 pilot — entries route only; working in dev
