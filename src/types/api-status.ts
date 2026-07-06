/**
 * @file types/api-status.ts
 *
 * WALKTHROUGH — TypeScript contracts for GET /api/status
 * ────────────────────────────────────────────────────
 * Platform/personal aggregates only — no PII fields. Shared by api-status-server,
 * ApiStatusClient, and api-status-client fetch wrapper.
 */
/**
 * API status payload — aggregate counts only; no PII (emails, names, IDs).
 * Consumed by GET /api/status and the /api-status dashboard page.
 */

export type DependencyStatus = {
  database: { ok: boolean; latencyMs?: number };
  redis: { ok: boolean; configured: boolean };
  ai: { configured: boolean };
};

export type PlatformStats = {
  totalUsers: number;
  totalBooks: number;
  totalEntries: number;
  /** Users with lastLoginAt within the last 15 minutes — not true live presence */
  recentlyActiveUsers: number;
};

export type PersonalStats = {
  bookCount: number;
  entryCount: number;
};

export type ApiStatusPayload = {
  service: string;
  timestamp: string;
  uptime: { ok: boolean };
  dependencies: DependencyStatus;
  platform: PlatformStats;
  personal: PersonalStats;
};

export type ApiStatusResponse = {
  success: true;
  data: ApiStatusPayload;
};
