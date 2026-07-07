/**
 * @file api/ai/assist/route.ts
 * @route POST `/api/ai/assist`
 *
 * WALKTHROUGH — Sync AI writing assist (fallback when stream fails)
 * ────────────────────────────────────────────────────────────────
 * Provider chain in `ai-provider.ts`: Groq shuffle → OpenRouter :free shuffle → Anthropic → placeholder.
 * Rate limit: 10/min per user via Redis (`consumeAiRateLimit`). API keys never sent to browser.
 * Client: RightPage "AI Assist" button; `assistSessionId` dedupes stream+sync rate slot.
 */
/**
 * POST /api/ai/assist — sync JSON AI writing fallback.
 * Provider chain: Groq shuffle → OpenRouter :free shuffle → Anthropic (legacy) → placeholder.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  aiAssistRequestSchema,
  buildAssistPrompt,
  type AiAssistResponse,
} from "@/lib/ai-assist";
import { consumeAiRateLimit } from "@/lib/ai-rate-limit";
import { syncAssistCompletion } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" } satisfies AiAssistResponse, {
      status: 401,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" } satisfies AiAssistResponse, {
      status: 400,
    });
  }

  const parsed = aiAssistRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" } satisfies AiAssistResponse,
      { status: 400 },
    );
  }

  const rate = await consumeAiRateLimit(session.user.id, parsed.data.assistSessionId);
  if (!rate.ok) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded — try again in ${rate.retryAfterSec}s`,
        retryAfterSec: rate.retryAfterSec,
      } satisfies AiAssistResponse & { retryAfterSec?: number },
      { status: 429 },
    );
  }

  try {
    const result = await syncAssistCompletion(buildAssistPrompt(parsed.data));
    if (result.rateLimited) {
      return NextResponse.json(
        {
          error: "AI providers are rate limited — try again shortly",
          retryAfterSec: result.retryAfterSec ?? 45,
        } satisfies AiAssistResponse & { retryAfterSec?: number },
        { status: 429 },
      );
    }
    return NextResponse.json({
      text: result.text,
      meta: { provider: result.provider, usedFallback: result.usedFallback, model: result.model },
    } satisfies AiAssistResponse & { meta?: object });
  } catch (err) {
    console.error("[AI assist]", err);
    return NextResponse.json({ error: "AI assist failed" } satisfies AiAssistResponse, {
      status: 502,
    });
  }
}
