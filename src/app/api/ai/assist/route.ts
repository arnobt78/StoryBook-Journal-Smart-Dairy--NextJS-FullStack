import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  aiAssistRequestSchema,
  buildAssistPrompt,
  DEV_PLACEHOLDER,
  type AiAssistResponse,
} from "@/lib/ai-assist";
import { consumeAiRateLimit } from "@/lib/ai-rate-limit";

/**
 * POST /api/ai/assist — sync JSON fallback; shares assistSessionId rate slot with stream route.
 */
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

  const rate = consumeAiRateLimit(session.user.id, parsed.data.assistSessionId);
  if (!rate.ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded — try again in ${rate.retryAfterSec}s` } satisfies AiAssistResponse,
      { status: 429 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ text: DEV_PLACEHOLDER } satisfies AiAssistResponse);
  }

  try {
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
        messages: [{ role: "user", content: buildAssistPrompt(parsed.data) }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}`);

    const data = (await res.json()) as { content?: { text?: string }[] };
    const text = data.content?.map((b) => b.text ?? "").join("") ?? "";
    return NextResponse.json({ text } satisfies AiAssistResponse);
  } catch (err) {
    console.error("[AI assist]", err);
    return NextResponse.json({ error: "AI assist failed" } satisfies AiAssistResponse, {
      status: 502,
    });
  }
}
