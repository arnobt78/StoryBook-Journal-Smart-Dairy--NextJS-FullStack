/**
 * @file lib/api-status-server.ts
 *
 * WALKTHROUGH — Server-side status aggregation
 * ──────────────────────────────────────────
 * Probes: PostgreSQL (`SELECT 1`), Redis ping, AI env flags (no secrets exposed).
 * Counts: platform totals + per-user book/entry counts + recently-active (15m proxy).
 * Shared by GET `/api/status` and SSR on `/api-status` page (no double network hop).
 */
/**
 * Server-side API status aggregation — DB ping, Redis ping, platform/personal counts.
 * Shared by GET /api/status and SSR on /api-status page (no double network hop).
 */
import { prisma } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import type { ApiStatusPayload } from "@/types/api-status";

const SERVICE_NAME = "storybook-journal";
const RECENTLY_ACTIVE_MS = 15 * 60 * 1000;

/** Probe PostgreSQL with SELECT 1 and measure round-trip latency */
async function probeDatabase(): Promise<{ ok: boolean; latencyMs?: number }> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

/** Ping Upstash Redis when configured; graceful when env vars unset */
async function probeRedis(): Promise<{ ok: boolean; configured: boolean }> {
  const redis = getRedis();
  if (!redis) return { ok: false, configured: false };
  try {
    const pong = await redis.ping();
    return { ok: pong === "PONG", configured: true };
  } catch {
    return { ok: false, configured: true };
  }
}

/** AI provider chain configured when any primary key is present — no key values exposed */
function probeAiConfigured(): boolean {
  return Boolean(
    process.env.GROQ_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.ANTHROPIC_API_KEY,
  );
}

/**
 * Build full status payload for the authenticated user.
 * Platform counts are aggregates only — no user lists or titles.
 */
export async function getApiStatus(userId: string): Promise<ApiStatusPayload> {
  const recentlyActiveSince = new Date(Date.now() - RECENTLY_ACTIVE_MS);

  const [
    database,
    redis,
    totalUsers,
    totalBooks,
    totalEntries,
    recentlyActiveUsers,
    personalBookCount,
    personalEntryCount,
  ] = await Promise.all([
    probeDatabase(),
    probeRedis(),
    prisma.user.count(),
    prisma.journalBook.count(),
    prisma.journalEntry.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: recentlyActiveSince } } }),
    prisma.journalBook.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
  ]);

  return {
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: { ok: true },
    dependencies: {
      database,
      redis,
      ai: { configured: probeAiConfigured() },
    },
    platform: {
      totalUsers,
      totalBooks,
      totalEntries,
      recentlyActiveUsers,
    },
    personal: {
      bookCount: personalBookCount,
      entryCount: personalEntryCount,
    },
  };
}
