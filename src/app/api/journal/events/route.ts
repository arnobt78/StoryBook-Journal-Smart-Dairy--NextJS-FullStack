/**
 * @file api/journal/events/route.ts
 * @route GET `/api/journal/events` (SSE)
 *
 * WALKTHROUGH — Cross-tab realtime sync
 * ────────────────────────────────────
 * Server-Sent Events stream per authenticated user.
 * Upstash REST cannot SUBSCRIBE — polls Redis LPUSH buffer every 500ms.
 * Client: `useJournalRealtime` → `notifyJournalCacheUpdated` on remote mutations.
 * Query `?since=` dedupes events on reconnect. Heartbeat every 25s keeps connection alive.
 */
/**
 * GET /api/journal/events — SSE stream of journal mutations (Redis list poll).
 *
 * Upstash REST has no blocking SUBSCRIBE — we LPUSH on publish and poll the
 * per-user buffer here. Adaptive interval: 500ms with Redis, 3000ms without.
 */
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getRedis } from "@/lib/redis";
import { journalChannel, type JournalSyncEvent } from "@/lib/journal-pubsub";

export const dynamic = "force-dynamic";

const POLL_MS_REDIS = 500;
const POLL_MS_NO_REDIS = 3000;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const sinceParam = req.nextUrl.searchParams.get("since");
  const sinceParsed = sinceParam ? Number(sinceParam) : NaN;
  const initialSince = Number.isFinite(sinceParsed) ? sinceParsed : Date.now();

  const encoder = new TextEncoder();
  const listKey = `${journalChannel(userId)}:buffer`;

  let cleanupFn: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      let lastSeen = initialSince;
      let closed = false;
      let heartbeat: ReturnType<typeof setInterval> | null = null;

      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          cleanup();
        }
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      cleanupFn = cleanup;

      send({ connected: true, at: Date.now() });

      heartbeat = setInterval(() => {
        send({ heartbeat: true });
      }, 25000);

      const poll = async () => {
        while (!closed) {
          const redis = getRedis();
          const interval = redis ? POLL_MS_REDIS : POLL_MS_NO_REDIS;
          if (redis) {
            try {
              const raw = await redis.lrange<string>(listKey, 0, 19);
              for (const item of [...raw].reverse()) {
                const ev = JSON.parse(item) as JournalSyncEvent;
                if (ev.at > lastSeen) {
                  send(ev);
                  lastSeen = ev.at;
                }
              }
            } catch {
              /* retry on next tick */
            }
          }
          await new Promise((r) => setTimeout(r, interval));
        }
      };

      void poll();
      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      cleanupFn?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
