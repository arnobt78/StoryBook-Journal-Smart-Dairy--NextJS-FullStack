/**
 * @file hooks/useApiPagesPrefetch.ts
 *
 * WALKTHROUGH — useApiPagesPrefetch
 *
 * Profile-menu optimization: prefetches Next.js route chunks for `/api-status`
 * and `/api-documentation` plus TanStack `apiStatus` / `apiOpenApi` queries so
 * clicking either menu item feels instant (cache hit, no skeleton).
 *
 * Lifecycle: stateless callback returned once; no effects — safe to call from
 * DropdownMenu `onOpenChange` without stale closures.
 */
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { fetchApiOpenApi } from "@/lib/api-openapi-client";
import { fetchApiStatus } from "@/lib/api-status-client";
import { queryKeys } from "@/lib/query-keys";

const API_STATUS_STALE_MS = 10_000;
const API_OPENAPI_STALE_MS = 5 * 60_000;

export function useApiPagesPrefetch() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const prefetchApiPages = useCallback(() => {
    router.prefetch("/api-status");
    router.prefetch("/api-documentation");
    void queryClient.prefetchQuery({
      queryKey: queryKeys.apiStatus(),
      queryFn: fetchApiStatus,
      staleTime: API_STATUS_STALE_MS,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.apiOpenApi(),
      queryFn: fetchApiOpenApi,
      staleTime: API_OPENAPI_STALE_MS,
    });
  }, [queryClient, router]);

  return { prefetchApiPages };
}
