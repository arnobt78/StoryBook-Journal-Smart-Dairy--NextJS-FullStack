/**
 * Client fetch wrapper for GET /api/status — used by ApiStatusClient useQuery.
 */
import type { ApiStatusPayload, ApiStatusResponse } from "@/types/api-status";

export async function fetchApiStatus(): Promise<ApiStatusPayload> {
  const res = await fetch("/api/status", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Status request failed (${res.status})`);
  }
  const json = (await res.json()) as ApiStatusResponse | { success: false; message?: string };
  if (!json.success || !("data" in json)) {
    throw new Error("message" in json ? json.message ?? "Unauthorized" : "Invalid status response");
  }
  return json.data;
}
