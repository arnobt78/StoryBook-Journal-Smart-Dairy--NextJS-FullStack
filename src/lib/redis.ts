/**
 * @file lib/redis.ts
 *
 * WALKTHROUGH — Upstash Redis REST singleton
 * ─────────────────────────────────────────
 * Used for: AI rate limiting (`ai-rate-limit.ts`), journal pub/sub buffer (`journal-pubsub.ts`).
 * Returns `null` when env unset — local dev uses in-memory fallbacks (no Redis required).
 */
/**
 * Upstash Redis REST client — rate limiting, journal pub/sub, SSE fanout.
 * Returns null when env vars unset so local dev degrades to in-memory fallbacks.
 */
import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    client = null;
    return null;
  }

  client = new Redis({ url, token });
  return client;
}
