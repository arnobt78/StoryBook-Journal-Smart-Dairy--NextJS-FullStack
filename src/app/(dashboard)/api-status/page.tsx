/**
 * @file app/(dashboard)/api-status/page.tsx
 * @route `/api-status` — API health & aggregate stats UI (REQ-0032)
 *
 * WALKTHROUGH — Instant shell + client data island
 * ────────────────────────────────────────────────
 * Server: auth gate only + static shell (background, header icon/title/subtitle).
 *          No `getApiStatus()` await — DB/Redis probes blocked RSC for 0.5–2s.
 * Client: `ApiStatusClient` fetches GET `/api/status` via TanStack Query;
 *          inline pulse skeleton while pending (never SSR-seeded stale numbers).
 * Invalidation: `notifyJournalCacheUpdated` → `queryKeys.apiStatus()` on journal CRUD.
 */
import { Activity } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ApiStatusClient } from "@/components/api-status/ApiStatusClient";
import { journalStaggerRowProps } from "@/lib/journal-stagger";

export const dynamic = "force-dynamic";

export default async function ApiStatusPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #2e160a 0%, #1a0c05 55%, #0e0603 100%)",
        minHeight: "100%",
      }}
    >
      <div className="api-status-page">
        <header {...journalStaggerRowProps(0, { className: "api-status-page-header" })}>
          <Activity
            className="mx-auto mb-2 size-8 text-[rgba(255,180,80,0.7)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <h1 className="api-status-page-header__title">API Status</h1>
          <p className="api-status-page-header__subtitle">
            Live dependency health and platform aggregates — no personal data exposed
          </p>
        </header>

        <ApiStatusClient />
      </div>
    </div>
  );
}
