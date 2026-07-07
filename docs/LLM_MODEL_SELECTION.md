# AI Model Selection & Fallback Strategy

## Purpose

This project is designed to work with multiple LLM providers and should NEVER depend on a single model.

If one model becomes unavailable, deprecated, rate limited, overloaded, or fails unexpectedly, the system should silently switch to the next suitable model without interrupting the user.

---

## Goals

- zero manual switching
- automatic fallback
- fastest available model
- highest coding quality
- minimal latency
- minimal cost
- graceful degradation
- future-proof against provider deprecations

---

## Important — Groq deprecations

Groq has announced shutdown of these models on **August 16, 2026**:

- `llama-3.1-8b-instant`
- `llama-3.3-70b-versatile`

Recommended replacements:

- `openai/gpt-oss-20b`
- `openai/gpt-oss-120b`
- `qwen/qwen3.6-27b`

These deprecated models should never be used for new development.

---

## StoryBook Journal — AI Assist implementation (REQ-0010)

**Code:** `src/lib/ai-provider.ts` · **Routes:** `/api/ai/assist`, `/api/ai/assist/stream` · **Trace:** CR-0006, CR-0007, Wave 49–50

Journal AI assist continues a diary entry with 2–3 poetic sentences. Groq requests use `reasoning_format: "hidden"` and `max_tokens: 700` so reasoning models (gpt-oss, qwen3.6) return prose only — not chain-of-thought. OpenRouter uses `reasoning: { exclude: true }`. Sync path also runs `stripReasoning()` as a safety net.

### Hardcoded model chains (verified 2026-07-07)

Only `GROQ_API_KEY` and `OPENROUTER_API_KEY` env vars are required on Vercel. Model IDs live in code — no model env vars.

**Groq** (shuffled per request via Fisher-Yates):

1. `openai/gpt-oss-20b` — fastest, primary for short creative prose
2. `qwen/qwen3.6-27b` — richer prose (Preview tier on Groq)
3. `openai/gpt-oss-120b` — production safety net

**OpenRouter** (`:free` tier, shuffled):

1. `meta-llama/llama-3.3-70b-instruct:free`
2. `deepseek/deepseek-chat-v3-0324:free`
3. `openai/gpt-oss-20b:free`

**Legacy:** Anthropic (`ANTHROPIC_API_KEY`) when Groq + OpenRouter both fail.

**Dev placeholder:** `DEV_PLACEHOLDER` in `ai-assist.ts` when no keys are set.

### Failover behaviour

- Retry next model on HTTP 408, 429, 500, 502, 503, 504, empty response, or network error
- `usedFallback: true` when crossing from Groq to OpenRouter (toast: "Using backup AI provider")
- `rateLimited: true` when every Groq + OpenRouter model returns 429 (toast with dynamic `retryAfterSec`)
- User-facing rate limit: 10/min per user via Redis (`consumeAiRateLimit`)

### Future model updates

To adopt new models, edit only the `GROQ_MODELS` / `OPENROUTER_MODELS` arrays in `ai-provider.ts` and update TC-0044 tests. No Vercel env changes required.

---

## Preferred Coding Models (generic / agent workflows)

Priority 1 — `openai/gpt-oss-120b` — difficult debugging, architecture, large repos, refactoring, planning, agent workflows, complex reasoning.

Priority 2 — `qwen/qwen3.6-27b` — everyday coding, frontend, backend, TypeScript, React, Next.js.

Priority 3 — `openai/gpt-oss-20b` — simple coding, autocomplete, quick fixes, documentation, tool calling, JSON generation.

---

## Automatic Fallback Order (generic)

For agent/IDE workflows (not fully implemented in journal assist):

1. `openai/gpt-oss-120b`
2. `qwen/qwen3.6-27b`
3. `openai/gpt-oss-20b`
4. Retry same request once
5. Retry with shorter context
6. Retry without images
7. Retry with chunked context
8. Return partial result instead of failing

Never stop after the first failure.

---

## Silent Failover Rules

Switch models automatically when:

- timeout
- provider overload
- HTTP 429, 500, 502, 503, 504
- model unavailable or deprecated
- context overflow
- tool invocation failure

The user should never need to manually change models.

---

## Context Rules

Prefer repository map, changed files, current file, imports, dependencies. Avoid sending the entire repository. Use chunking for large repositories.

---

## Coding Behaviour

Always preserve formatting, comments, types, tests, lint rules, accessibility, translations. Never rewrite unrelated files.

---

## Provider Preference

1. Groq
2. OpenRouter
3. OpenAI
4. Anthropic
5. Local Ollama
6. LM Studio

Choose whichever provider offers the highest-ranked available model.

---

## Future Compatibility

Whenever a better coding model becomes available, replace only the ranking arrays while keeping the fallback strategy unchanged. The routing system should adapt without repository-wide changes.

Use as many fallback strategies as practical to avoid single-model failure risk across providers.
