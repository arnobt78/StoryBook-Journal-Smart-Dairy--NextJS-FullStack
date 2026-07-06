/**
 * Client fetch wrapper for GET /api/openapi.
 */
import type { ApiRouteCatalog } from "@/lib/api-route-catalog";

export async function fetchApiOpenApi(): Promise<ApiRouteCatalog> {
  const res = await fetch("/api/openapi", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`OpenAPI request failed (${res.status})`);
  }
  const json = (await res.json()) as
    | { success: true; data: ApiRouteCatalog }
    | { success: false; message?: string };
  if (!json.success || !("data" in json)) {
    throw new Error("message" in json ? json.message ?? "Unauthorized" : "Invalid openapi response");
  }
  return json.data;
}
