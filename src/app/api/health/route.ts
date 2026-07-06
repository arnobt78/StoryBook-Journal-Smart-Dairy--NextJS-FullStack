/**
 * @file api/health/route.ts
 * @route GET `/api/health`
 *
 * WALKTHROUGH — Public liveness probe (uptime monitors)
 * ───────────────────────────────────────────────────
 * Minimal JSON `{ ok, service, timestamp }` — no DB/Redis checks.
 * For enriched deps + stats see GET `/api/status` (auth required).
 * UI: `/api-status` dashboard page; external monitors hit this endpoint directly.
 */
/**
 * GET /api/health — liveness probe.
 *
 * HTTP: GET only; always 200 when App Router responds.
 * Auth: none — safe for profile menu "API Status" link.
 * Validation: N/A — no request body.
 * Ownership: N/A — no user-scoped data.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lightweight JSON health probe for the profile menu “API Status” link.
 * Safe to call unauthenticated; returns 200 when the App Router responds.
 */
export function GET() {
  return NextResponse.json({
    ok: true,
    service: "storybook-journal",
    timestamp: new Date().toISOString(),
  });
}
