/**
 * @file components/api-status/ApiStatusClient.tsx
 *
 * WALKTHROUGH — Live API status data island (client)
 * ─────────────────────────────────────────────────
 * Fetches GET `/api/status` via TanStack Query — no SSR `initialData`.
 * Single unified render tree: static chrome (icons, titles, labels, descriptions)
 * always visible; only server-computed leaves pulse as skeleton chips (badges,
 * stat numbers, last-checked line). Failed fetch → error card + Try again.
 * 30s `refetchInterval`; invalidated on journal CRUD via `notifyJournalCacheUpdated`.
 * Static shell/header lives in `api-status/page.tsx` for instant navigation.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Database,
  FileText,
  Server,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RippleButton } from "@/components/ui/ripple-button";
import { StatusDependencyCard } from "@/components/api-status/StatusDependencyCard";
import { StatusStatGrid } from "@/components/api-status/StatusStatGrid";
import { fetchApiStatus } from "@/lib/api-status-client";
import { journalStaggerRowProps } from "@/lib/journal-stagger";
import { queryKeys } from "@/lib/query-keys";

const REFETCH_MS = 30_000;

type ApiStatusErrorCardProps = {
  isFetching: boolean;
  onRetry: () => void;
};

/** Fetch failure — retry without full page reload (cold cache only; last data kept on refetch) */
function ApiStatusErrorCard({ isFetching, onRetry }: ApiStatusErrorCardProps) {
  return (
    <div {...journalStaggerRowProps(1)}>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <AlertTriangle
            className="size-10 text-[rgba(255,160,80,0.75)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <div>
            <p className="font-playfair text-lg font-semibold text-[rgba(255,210,140,0.92)]">
              Could not load status
            </p>
            <p className="mt-2 font-lora text-sm text-[rgba(255,205,130,0.55)]">
              Check your connection and try again.
            </p>
          </div>
          <RippleButton
            type="button"
            className="api-status-retry-btn"
            disabled={isFetching}
            onClick={onRetry}
          >
            {isFetching ? "Retrying…" : "Try again"}
          </RippleButton>
        </CardContent>
      </Card>
    </div>
  );
}

/** Live API status — one tree; value-only skeleton chips when loading */
export function ApiStatusClient() {
  const { data: status, isError, isFetching, refetch } = useQuery({
    queryKey: queryKeys.apiStatus(),
    queryFn: fetchApiStatus,
    refetchInterval: REFETCH_MS,
    staleTime: 10_000,
  });

  if (isError && !status) {
    return (
      <ApiStatusErrorCard isFetching={isFetching} onRetry={() => void refetch()} />
    );
  }

  const loading = !status;

  return (
    <div
      className="flex flex-col gap-5"
      aria-busy={loading}
      aria-label={loading ? "Loading API status values" : undefined}
    >
      <div {...journalStaggerRowProps(1)}>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Service</CardTitle>
                <CardDescription>
                  {loading ? (
                    <span className="skeleton api-status-line-skeleton" aria-hidden />
                  ) : (
                    <>
                      {status.service} · last checked{" "}
                      {new Date(status.timestamp).toLocaleString()}
                    </>
                  )}
                </CardDescription>
              </div>
              {loading ? (
                <span className="skeleton api-status-badge-skeleton shrink-0" aria-hidden />
              ) : (
                <Badge variant={status.uptime.ok ? "success" : "destructive"}>
                  {status.uptime.ok ? "Operational" : "Degraded"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <StatusDependencyCard
              icon={Database}
              title="PostgreSQL"
              meta={
                status?.dependencies.database.latencyMs != null
                  ? `Round-trip ${status.dependencies.database.latencyMs}ms`
                  : "Database connectivity probe"
              }
              ok={status?.dependencies.database.ok ?? false}
              loading={loading}
            />
            <StatusDependencyCard
              icon={Server}
              title="Redis (Upstash)"
              meta="Journal pub/sub and AI rate limiting"
              ok={status?.dependencies.redis.ok ?? false}
              configured={status?.dependencies.redis.configured}
              loading={loading}
            />
            <StatusDependencyCard
              icon={Sparkles}
              title="AI providers"
              meta="Groq · OpenRouter · Anthropic fallback chain"
              ok={status?.dependencies.ai.configured ?? false}
              configured={status?.dependencies.ai.configured}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      <div {...journalStaggerRowProps(2)}>
        <StatusStatGrid
          title="Platform totals"
          description="Aggregate counts across all accounts — numbers only"
          loading={loading}
          stats={[
            {
              label: "Accounts",
              value: status?.platform.totalUsers ?? null,
              icon: Users,
            },
            {
              label: "Journals",
              value: status?.platform.totalBooks ?? null,
              icon: BookOpen,
            },
            {
              label: "Entries",
              value: status?.platform.totalEntries ?? null,
              icon: FileText,
            },
            {
              label: "Recently active",
              value: status?.platform.recentlyActiveUsers ?? null,
              subtitle: "Logged in within 15 minutes",
              icon: Clock,
            },
          ]}
        />
      </div>

      <div {...journalStaggerRowProps(3)}>
        <StatusStatGrid
          title="Your workspace"
          description="Counts scoped to your session — updates on CRUD without refresh"
          loading={loading}
          stats={[
            {
              label: "Your journals",
              value: status?.personal.bookCount ?? null,
              icon: BookOpen,
            },
            {
              label: "Your entries",
              value: status?.personal.entryCount ?? null,
              icon: FileText,
            },
          ]}
        />
      </div>
    </div>
  );
}
