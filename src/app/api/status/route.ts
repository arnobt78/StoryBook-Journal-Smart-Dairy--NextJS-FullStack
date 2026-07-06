/**
 * @file api/status/route.ts
 * @route GET `/api/status`
 *
 * WALKTHROUGH — Enriched system status API
 * ──────────────────────────────────────
 * Auth required. Returns DB ping latency, Redis/AI configured flags,
 * platform aggregates (user/book/entry counts), personal counts, recently-active proxy.
 * Server logic: `getApiStatus()` shared with SSR on `/api-status` page.
 */
/**
 * GET /api/status — enriched dependency health + aggregate platform/personal stats.
 * Auth: session required. No PII — counts only.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApiStatus } from "@/lib/api-status-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const data = await getApiStatus(session.user.id);
  return NextResponse.json({ success: true, data });
}
