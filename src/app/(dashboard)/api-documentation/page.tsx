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
