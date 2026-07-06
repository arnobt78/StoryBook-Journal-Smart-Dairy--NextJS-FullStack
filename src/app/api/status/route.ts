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
