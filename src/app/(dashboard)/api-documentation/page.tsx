/**
 * @file app/(dashboard)/api-documentation/page.tsx
 * @route `/api-documentation` — OpenAPI-style route catalog UI (REQ-0032)
 *
 * WALKTHROUGH — Static catalog SSR + client cache
 * ─────────────────────────────────────────────
 * `getApiRouteCatalog()` builds docs from Zod schemas (no runtime OpenAPI gen).
 * Client caches 5min; catalog rarely changes between deploys.
 */
/**
 * @route `/api-documentation` — OpenAPI-style live route catalog UI.
 * SSR: getApiRouteCatalog() on server; client caches catalog for 5 minutes.
 */
import { auth } from "@/lib/auth";
import { getApiRouteCatalog } from "@/lib/api-route-catalog";
import { redirect } from "next/navigation";
import { ApiDocumentationClient } from "@/components/api-documentation/ApiDocumentationClient";

export const dynamic = "force-dynamic";

export default async function ApiDocumentationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const initialCatalog = getApiRouteCatalog();

  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #2e160a 0%, #1a0c05 55%, #0e0603 100%)",
        minHeight: "100%",
      }}
    >
      <ApiDocumentationClient initialCatalog={initialCatalog} />
    </div>
  );
}
