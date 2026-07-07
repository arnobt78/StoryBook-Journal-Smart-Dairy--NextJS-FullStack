/**
 * AI assist provider chain — REQ-0010 / CR-0006 (Wave 49), CR-0007 (Wave 50).
 *
 * Groq (shuffled production models) → OpenRouter (:free shuffle) → Anthropic legacy → placeholder.
 * Groq/OpenRouter bodies suppress reasoning chain-of-thought (reasoning_format hidden / reasoning.exclude).
 * Model IDs are hardcoded — only GROQ_API_KEY / OPENROUTER_API_KEY env vars required on Vercel.
 * verified 2026-07-07 against Groq + OpenRouter model catalogs.
 */
import { DEV_PLACEHOLDER } from "@/lib/ai-assist";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Groq production models — shuffled per request to spread free-tier rate budgets. */
export const GROQ_MODELS = [
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "openai/gpt-oss-120b",
] as const;

/** OpenRouter free-tier variants — append :free for zero-cost inference. */
export const OPENROUTER_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "openai/gpt-oss-20b:free",
] as const;

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

const OPENROUTER_HEADERS = {
  "HTTP-Referer": process.env.NEXTAUTH_URL ?? "https://storybook-journal.vercel.app",
  "X-Title": "StoryBook Journal",
} as const;

/**
 * Groq reasoning suppression is model-specific:
 *   - gpt-oss (20b/120b): `reasoning_format: "hidden"` returns prose only.
 *   - qwen3.6-27b: uses `reasoning_effort` (not reasoning_format) — sending
 *     `reasoning_format` yields an EMPTY completion. `none` disables reasoning
 *     so the model streams the final prose directly.
 */
const GROQ_REASONING_EFFORT_MODELS = new Set<string>(["qwen/qwen3.6-27b"]);

function groqBodyForModel(model: string): Record<string, unknown> {
  if (GROQ_REASONING_EFFORT_MODELS.has(model)) {
    return { reasoning_effort: "none", max_tokens: 700 };
  }
  return { reasoning_format: "hidden", max_tokens: 700 };
}

/** OpenRouter unified flag — strips reasoning for gpt-oss:free; ignored by non-reasoning models. */
const OPENROUTER_BODY = {
  reasoning: { exclude: true },
} as const;

export type AiProviderName = "groq" | "openrouter" | "placeholder" | "anthropic";

export type AiProviderResult = {
  text: string;
  provider: AiProviderName;
  usedFallback: boolean;
  /** Winning model id from the provider catalog. */
  model?: string;
  /** True when every attempted Groq + OpenRouter model returned HTTP 429. */
  rateLimited?: boolean;
  /** Max Retry-After (seconds) from provider 429 responses, when available. */
  retryAfterSec?: number;
};

export type AiStreamChunk = {
  text?: string;
  usedFallback?: boolean;
  rateLimited?: boolean;
  /** Max Retry-After (seconds) from provider 429 responses, when available. */
  retryAfterSec?: number;
  done?: boolean;
  error?: string;
};

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type ProviderAttemptResult =
  | { ok: true; text: string; model: string }
  | { ok: false; allRateLimited: boolean; retryAfterSec?: number };

type ProviderStreamAttemptResult =
  | { res: Response; model: string }
  | { allRateLimited: boolean; retryAfterSec?: number };

const RETRY_AFTER_MIN_SEC = 5;
const RETRY_AFTER_MAX_SEC = 120;

/** Parse Retry-After header (seconds or HTTP-date); clamp to sane range for toasts. */
export function parseRetryAfter(headerValue: string | null): number | undefined {
  if (!headerValue) return undefined;

  const trimmed = headerValue.trim();
  const asSeconds = Number(trimmed);
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return Math.min(RETRY_AFTER_MAX_SEC, Math.max(RETRY_AFTER_MIN_SEC, Math.ceil(asSeconds)));
  }

  const asDate = Date.parse(trimmed);
  if (!Number.isNaN(asDate)) {
    const deltaSec = Math.ceil((asDate - Date.now()) / 1000);
    if (deltaSec > 0) {
      return Math.min(RETRY_AFTER_MAX_SEC, Math.max(RETRY_AFTER_MIN_SEC, deltaSec));
    }
  }

  return undefined;
}

function maxRetryAfter(current: number | undefined, next: number | undefined): number | undefined {
  if (next === undefined) return current;
  if (current === undefined) return next;
  return Math.max(current, next);
}

function retryAfterFromResponse(res: Response): number | undefined {
  if (res.status !== 429) return undefined;
  return parseRetryAfter(res.headers.get("retry-after"));
}

/** Fisher-Yates shuffle — spreads load across models on free-tier keys. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function isRetryable(status: number): boolean {
  return RETRYABLE_STATUS.has(status);
}

async function chatCompletion(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  extraHeaders?: Record<string, string>,
  extraBody?: Record<string, unknown>,
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 300,
      temperature: 0.7,
      ...extraBody,
    }),
  });
}

async function streamChatCompletion(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  extraHeaders?: Record<string, string>,
  extraBody?: Record<string, unknown>,
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 300,
      stream: true,
      ...extraBody,
    }),
  });
}

/** Safety net when a provider still embeds reasoning tags in content (sync path only). */
export function stripReasoning(text: string): string {
  return text
    .replace(/[\s\S]*?<\/think>/gi, "")
    .replace(/<redacted_thinking>[\s\S]*?<\/redacted_thinking>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .trim();
}

async function parseChatJson(res: Response): Promise<string> {
  if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  return stripReasoning(raw);
}

/** Try each shuffled model on one provider; advance on retryable status / empty / network error. */
async function tryProviderModelsSync(
  url: string,
  apiKey: string,
  models: readonly string[],
  messages: ChatMessage[],
  extraHeaders?: Record<string, string>,
  bodyFor?: (model: string) => Record<string, unknown> | undefined,
): Promise<ProviderAttemptResult> {
  let allRateLimited = true;
  let sawAttempt = false;
  let retryAfterSec: number | undefined;

  for (const model of shuffle(models)) {
    sawAttempt = true;
    try {
      const res = await chatCompletion(url, apiKey, model, messages, extraHeaders, bodyFor?.(model));
      if (!res.ok) {
        retryAfterSec = maxRetryAfter(retryAfterSec, retryAfterFromResponse(res));
        if (res.status !== 429) allRateLimited = false;
        if (isRetryable(res.status)) continue;
        continue;
      }
      const text = await parseChatJson(res);
      if (text) return { ok: true, text, model };
      allRateLimited = false;
    } catch {
      allRateLimited = false;
    }
  }

  return { ok: false, allRateLimited: sawAttempt && allRateLimited, retryAfterSec };
}

/** Stream path — returns first model that yields a readable body. */
async function tryProviderModelsStream(
  url: string,
  apiKey: string,
  models: readonly string[],
  messages: ChatMessage[],
  extraHeaders?: Record<string, string>,
  bodyFor?: (model: string) => Record<string, unknown> | undefined,
): Promise<ProviderStreamAttemptResult> {
  let allRateLimited = true;
  let sawAttempt = false;
  let retryAfterSec: number | undefined;

  for (const model of shuffle(models)) {
    sawAttempt = true;
    try {
      const res = await streamChatCompletion(url, apiKey, model, messages, extraHeaders, bodyFor?.(model));
      if (res.ok && res.body) return { res, model };
      retryAfterSec = maxRetryAfter(retryAfterSec, retryAfterFromResponse(res));
      if (res.status !== 429) allRateLimited = false;
      if (isRetryable(res.status)) continue;
    } catch {
      allRateLimited = false;
    }
  }

  return { allRateLimited: sawAttempt && allRateLimited, retryAfterSec };
}

/** Legacy Anthropic path when only ANTHROPIC_API_KEY is set. */
async function anthropicSync(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No Anthropic key");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = (await res.json()) as { content?: { text?: string }[] };
  return data.content?.map((b) => b.text ?? "").join("") ?? "";
}

export async function syncAssistCompletion(prompt: string): Promise<AiProviderResult> {
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const messages: ChatMessage[] = [{ role: "user", content: prompt }];

  if (!groqKey && !openRouterKey && !process.env.ANTHROPIC_API_KEY) {
    return { text: DEV_PLACEHOLDER, provider: "placeholder", usedFallback: false };
  }

  let groqAllRateLimited = false;
  let groqRetryAfterSec: number | undefined;

  if (groqKey) {
    const groq = await tryProviderModelsSync(
      GROQ_URL,
      groqKey,
      GROQ_MODELS,
      messages,
      undefined,
      groqBodyForModel,
    );
    if (groq.ok) {
      return { text: groq.text, provider: "groq", usedFallback: false, model: groq.model };
    }
    groqAllRateLimited = groq.allRateLimited;
    groqRetryAfterSec = groq.retryAfterSec;
  }

  let openRouterAllRateLimited = false;
  let openRouterRetryAfterSec: number | undefined;

  if (openRouterKey) {
    const or = await tryProviderModelsSync(
      OPENROUTER_URL,
      openRouterKey,
      OPENROUTER_MODELS,
      messages,
      OPENROUTER_HEADERS,
      () => OPENROUTER_BODY,
    );
    if (or.ok) {
      return {
        text: or.text,
        provider: "openrouter",
        usedFallback: Boolean(groqKey),
        model: or.model,
      };
    }
    openRouterAllRateLimited = or.allRateLimited;
    openRouterRetryAfterSec = or.retryAfterSec;
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const text = await anthropicSync(prompt);
      if (text) {
        return {
          text,
          provider: "anthropic",
          usedFallback: true,
          model: "claude-sonnet-4-20250514",
        };
      }
    } catch {
      /* fall through */
    }
  }

  const rateLimited =
    Boolean(groqKey || openRouterKey) && groqAllRateLimited && openRouterAllRateLimited;

  return {
    text: DEV_PLACEHOLDER,
    provider: "placeholder",
    usedFallback: true,
    rateLimited,
    retryAfterSec: maxRetryAfter(groqRetryAfterSec, openRouterRetryAfterSec),
  };
}

/** Stream tokens via Groq/OpenRouter OpenAI SSE format; yields text chunks. */
export async function* streamAssistCompletion(prompt: string): AsyncGenerator<AiStreamChunk> {
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const messages: ChatMessage[] = [{ role: "user", content: prompt }];

  if (!groqKey && !openRouterKey && !process.env.ANTHROPIC_API_KEY) {
    yield { text: DEV_PLACEHOLDER };
    yield { done: true };
    return;
  }

  let usedFallback = false;
  let groqAllRateLimited = false;
  let openRouterAllRateLimited = false;
  let providerRetryAfterSec: number | undefined;
  let res: Response | null = null;

  if (groqKey) {
    const groq = await tryProviderModelsStream(
      GROQ_URL,
      groqKey,
      GROQ_MODELS,
      messages,
      undefined,
      groqBodyForModel,
    );
    if ("res" in groq) {
      res = groq.res;
    } else {
      groqAllRateLimited = groq.allRateLimited;
      providerRetryAfterSec = maxRetryAfter(providerRetryAfterSec, groq.retryAfterSec);
    }
  }

  if (!res && openRouterKey) {
    usedFallback = Boolean(groqKey);
    const or = await tryProviderModelsStream(
      OPENROUTER_URL,
      openRouterKey,
      OPENROUTER_MODELS,
      messages,
      OPENROUTER_HEADERS,
      () => OPENROUTER_BODY,
    );
    if ("res" in or) {
      res = or.res;
    } else {
      openRouterAllRateLimited = or.allRateLimited;
      providerRetryAfterSec = maxRetryAfter(providerRetryAfterSec, or.retryAfterSec);
    }
  }

  if (!res?.ok || !res.body) {
    const rateLimited =
      Boolean(groqKey || openRouterKey) && groqAllRateLimited && openRouterAllRateLimited;

    if (rateLimited) {
      yield {
        rateLimited: true,
        retryAfterSec: providerRetryAfterSec,
        error: "AI assist rate limited",
      };
      return;
    }

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const text = await anthropicSync(prompt);
        yield { text, usedFallback: true };
        yield { done: true };
        return;
      } catch {
        yield { error: "AI assist failed" };
        return;
      }
    }

    yield { error: "AI assist failed" };
    return;
  }

  if (usedFallback) yield { usedFallback: true };

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") continue;

      try {
        const event = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const chunk = event.choices?.[0]?.delta?.content;
        if (chunk) yield { text: chunk };
      } catch {
        /* skip malformed SSE */
      }
    }
  }

  yield { done: true };
}
