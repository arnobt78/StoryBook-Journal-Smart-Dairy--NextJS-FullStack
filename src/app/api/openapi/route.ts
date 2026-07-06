/**
 * @file api/openapi/route.ts
 * @route GET `/api/openapi`
 *
 * WALKTHROUGH — Machine-readable API catalog
 * ─────────────────────────────────────────
 * Auth required. Returns OpenAPI 3.1-shaped JSON from static `api-route-catalog.ts`.
 * Powers `/api-documentation` UI (Endpoints + Schemas tabs).
 */
/**
 * GET /api/openapi — machine-readable route catalog (OpenAPI 3.1-shaped JSON).
 * Auth: session required. Static manifest from api-route-catalog.ts.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApiRouteCatalog } from "@/lib/api-route-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: getApiRouteCatalog() });
}
