/**
 * GET /api/health — liveness probe.
 *
 * HTTP: GET only; always 200 when App Router responds.
 * Auth: none — safe for profile menu "API Status" link.
 * Validation: N/A — no request body.
 * Ownership: N/A — no user-scoped data.
 */
import { NextResponse } from "next/server";

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
