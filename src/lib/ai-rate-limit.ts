/**
 * In-memory per-user rate limit (resets on cold start — Vercel MVP).
 * assistSessionId dedupes stream + sync fallback. Upgrade: Redis/Upstash for multi-instance.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const SESSION_TTL_MS = 120_000;

const buckets = new Map<string, { count: number; resetAt: number }>();
const assistSessions = new Map<string, number>();

function pruneAssistSessions(now: number): void {
  for (const [key, expiresAt] of assistSessions) {
    if (now >= expiresAt) assistSessions.delete(key);
  }
}

export function consumeAiRateLimit(
  userId: string,
  assistSessionId?: string | null,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  pruneAssistSessions(now);

  if (assistSessionId) {
    const sessionKey = `${userId}:${assistSessionId}`;
    const sessionExpires = assistSessions.get(sessionKey);
    if (sessionExpires && now < sessionExpires) {
      return { ok: true };
    }
  }

  const bucket = buckets.get(userId);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    if (assistSessionId) {
      assistSessions.set(`${userId}:${assistSessionId}`, now + SESSION_TTL_MS);
    }
    return { ok: true };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  if (assistSessionId) {
    assistSessions.set(`${userId}:${assistSessionId}`, now + SESSION_TTL_MS);
  }
  return { ok: true };
}
