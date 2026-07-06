/**
 * @route `/api-status` — live API dependency health and aggregate stats UI.
 * SSR: getApiStatus() on server; client refetches via TanStack Query.
 */
import { auth } from "@/lib/auth";
import { getApiStatus } from "@/lib/api-status-server";
import { redirect } from "next/navigation";
import { ApiStatusClient } from "@/components/api-status/ApiStatusClient";

export const dynamic = "force-dynamic";

export default async function ApiStatusPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const initialStatus = await getApiStatus(session.user.id);

  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #2e160a 0%, #1a0c05 55%, #0e0603 100%)",
        minHeight: "100%",
      }}
    >
      <ApiStatusClient initialStatus={initialStatus} />
    </div>
  );
}
