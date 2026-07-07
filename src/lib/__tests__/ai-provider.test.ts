/**
 * TC-0046 — ai-provider multi-model shuffle fallback chain (REQ-0010 / CR-0006).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GROQ_MODELS,
  OPENROUTER_MODELS,
  parseRetryAfter,
  shuffle,
  syncAssistCompletion,
  streamAssistCompletion,
} from "@/lib/ai-provider";
import { DEV_PLACEHOLDER } from "@/lib/ai-assist";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const ALL_MODELS = new Set<string>([...GROQ_MODELS, ...OPENROUTER_MODELS]);

function chatOk(text: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      choices: [{ message: { content: text } }],
    }),
  } as Response;
}

function chat429(retryAfter?: string) {
  return {
    ok: false,
    status: 429,
    headers: {
      get: (name: string) => (name.toLowerCase() === "retry-after" ? retryAfter ?? null : null),
    },
    json: async () => ({}),
  } as Response;
}

describe("parseRetryAfter", () => {
  it("parses numeric seconds and clamps to range", () => {
    expect(parseRetryAfter("30")).toBe(30);
    expect(parseRetryAfter("3")).toBe(5);
    expect(parseRetryAfter("999")).toBe(120);
  });
});

function parseBodyModel(init?: RequestInit): string | undefined {
  if (!init?.body || typeof init.body !== "string") return undefined;
  return (JSON.parse(init.body) as { model?: string }).model;
}

describe("ai-provider shuffle", () => {
  it("shuffle returns same elements, different order possible", () => {
    const input = ["a", "b", "c", "d"] as const;
    const out = shuffle(input);
    expect(out.sort()).toEqual([...input].sort());
    expect(out).toHaveLength(input.length);
  });
});

describe("syncAssistCompletion (TC-0046)", () => {
  const env = process.env;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllGlobals();
  });

  it("returns placeholder when no API keys are set", async () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const result = await syncAssistCompletion("test prompt");
    expect(result).toMatchObject({
      text: DEV_PLACEHOLDER,
      provider: "placeholder",
      usedFallback: false,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("Groq primary success — no fallback", async () => {
    process.env.GROQ_API_KEY = "groq-test";
    delete process.env.OPENROUTER_API_KEY;

    vi.mocked(fetch).mockImplementation(async (url, init) => {
      const model = parseBodyModel(init);
      expect(url).toBe(GROQ_URL);
      expect(model).toBeDefined();
      expect(ALL_MODELS.has(model!)).toBe(true);
      return chatOk("Poetic continuation.");
    });

    const result = await syncAssistCompletion("test prompt");
    expect(result).toMatchObject({
      text: "Poetic continuation.",
      provider: "groq",
      usedFallback: false,
    });
    expect(result.model).toBeDefined();
    expect(GROQ_MODELS).toContain(result.model as (typeof GROQ_MODELS)[number]);
  });

  it("Groq all 429 → OpenRouter success with usedFallback", async () => {
    process.env.GROQ_API_KEY = "groq-test";
    process.env.OPENROUTER_API_KEY = "or-test";

    vi.mocked(fetch).mockImplementation(async (url, init) => {
      const model = parseBodyModel(init);
      expect(ALL_MODELS.has(model!)).toBe(true);
      if (url === GROQ_URL) return chat429();
      if (url === OPENROUTER_URL) return chatOk("Backup prose.");
      throw new Error(`unexpected url ${url}`);
    });

    const result = await syncAssistCompletion("test prompt");
    expect(result).toMatchObject({
      text: "Backup prose.",
      provider: "openrouter",
      usedFallback: true,
    });
    expect(OPENROUTER_MODELS).toContain(
      result.model as (typeof OPENROUTER_MODELS)[number],
    );
  });

  it("all Groq + OpenRouter 429 → rateLimited placeholder with Retry-After", async () => {
    process.env.GROQ_API_KEY = "groq-test";
    process.env.OPENROUTER_API_KEY = "or-test";
    delete process.env.ANTHROPIC_API_KEY;

    vi.mocked(fetch).mockImplementation(async (url, init) => {
      const model = parseBodyModel(init);
      expect(ALL_MODELS.has(model!)).toBe(true);
      if (url === GROQ_URL || url === OPENROUTER_URL) return chat429("30");
      throw new Error(`unexpected url ${url}`);
    });

    const result = await syncAssistCompletion("test prompt");
    expect(result).toMatchObject({
      text: DEV_PLACEHOLDER,
      provider: "placeholder",
      usedFallback: true,
      rateLimited: true,
      retryAfterSec: 30,
    });
  });
});

describe("streamAssistCompletion (TC-0046)", () => {
  const env = process.env;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllGlobals();
  });

  it("emits rateLimited when Groq + OpenRouter all return 429", async () => {
    process.env.GROQ_API_KEY = "groq-test";
    process.env.OPENROUTER_API_KEY = "or-test";
    delete process.env.ANTHROPIC_API_KEY;

    vi.mocked(fetch).mockImplementation(async (url, init) => {
      const model = parseBodyModel(init);
      expect(ALL_MODELS.has(model!)).toBe(true);
      if (url === GROQ_URL || url === OPENROUTER_URL) return chat429();
      throw new Error(`unexpected url ${url}`);
    });

    const chunks: { rateLimited?: boolean; retryAfterSec?: number; error?: string }[] = [];
    for await (const chunk of streamAssistCompletion("test")) {
      chunks.push(chunk);
    }

    expect(chunks.some((c) => c.rateLimited === true)).toBe(true);
    expect(chunks.some((c) => c.error?.includes("rate limited"))).toBe(true);
  });

  it("emits retryAfterSec from provider Retry-After header", async () => {
    process.env.GROQ_API_KEY = "groq-test";
    process.env.OPENROUTER_API_KEY = "or-test";
    delete process.env.ANTHROPIC_API_KEY;

    vi.mocked(fetch).mockImplementation(async (url, init) => {
      const model = parseBodyModel(init);
      expect(ALL_MODELS.has(model!)).toBe(true);
      if (url === GROQ_URL || url === OPENROUTER_URL) return chat429("30");
      throw new Error(`unexpected url ${url}`);
    });

    const chunks: { rateLimited?: boolean; retryAfterSec?: number }[] = [];
    for await (const chunk of streamAssistCompletion("test")) {
      chunks.push(chunk);
    }

    const limited = chunks.find((c) => c.rateLimited);
    expect(limited?.retryAfterSec).toBe(30);
  });
});
