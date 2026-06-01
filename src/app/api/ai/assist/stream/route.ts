import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  aiAssistRequestSchema,
  buildAssistPrompt,
  DEV_PLACEHOLDER,
} from "@/lib/ai-assist";
import { consumeAiRateLimit } from "@/lib/ai-rate-limit";

/**
 * POST /api/ai/assist/stream — SSE token stream for incremental draft append.
 * Falls back to a single dev placeholder chunk when ANTHROPIC_API_KEY is unset.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const parsed = aiAssistRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Invalid request" }),
      { status: 400 },
    );
  }

  const rate = consumeAiRateLimit(session.user.id, parsed.data.assistSessionId);
  if (!rate.ok) {
    return new Response(
      JSON.stringify({ error: `Rate limit exceeded — try again in ${rate.retryAfterSec}s` }),
      { status: 429 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, string>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      if (!apiKey) {
        send({ text: DEV_PLACEHOLDER });
        send({ done: "true" });
        controller.close();
        return;
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
            stream: true,
            messages: [{ role: "user", content: buildAssistPrompt(parsed.data) }],
          }),
        });

        if (!res.ok || !res.body) {
          send({ error: "AI assist failed" });
          controller.close();
          return;
        }

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
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (
                event.type === "content_block_delta" &&
                event.delta?.type === "text_delta" &&
                event.delta.text
              ) {
                send({ text: event.delta.text });
              }
            } catch {
              /* skip malformed SSE lines */
            }
          }
        }

        send({ done: "true" });
        controller.close();
      } catch (err) {
        console.error("[AI assist stream]", err);
        send({ error: "AI assist failed" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
