/**
 * @file components/api-status/ApiStatusClient.tsx
 *
 * WALKTHROUGH — Live API status data island (client)
 * ─────────────────────────────────────────────────
 * Fetches GET `/api/status` via TanStack Query — no SSR `initialData` so first
 * paint never shows stale numbers; inline skeleton until the fetch resolves.
 * 30s `refetchInterval`; invalidated on journal CRUD via `notifyJournalCacheUpdated`.
 * Static shell/header lives in `api-status/page.tsx` for instant navigation.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
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
import { StatusDependencyCard } from "@/components/api-status/StatusDependencyCard";
import { StatusStatGrid } from "@/components/api-status/StatusStatGrid";
import { fetchApiStatus } from "@/lib/api-status-client";
import { journalStaggerRowProps } from "@/lib/journal-stagger";
import { queryKeys } from "@/lib/query-keys";

const REFETCH_MS = 30_000;

/** Pulse skeleton mirroring Service card + two stat grids — cold cache only */
function ApiStatusDataSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading API status">
      <div {...journalStaggerRowProps(1)}>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton h-5 w-24" />
                <div className="skeleton h-3 w-48 max-w-full" />
              </div>
              <div className="skeleton h-6 w-24 shrink-0 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            {[Database, Server, Sparkles].map((Icon, i) => (
              <div key={i} className="api-status-dep-row">
                <Icon
                  className="api-status-dep-row__icon size-5 opacity-40"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <div className="api-status-dep-row__body min-w-0 flex-1 space-y-2">
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-3 w-40 max-w-full" />
                </div>
                <div className="skeleton h-6 w-20 shrink-0 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div {...journalStaggerRowProps(2)}>
        <div className="api-status-card">
          <div className="api-status-card__header space-y-2">
            <div className="skeleton h-5 w-36" />
            <div className="skeleton h-3 w-56 max-w-full" />
          </div>
          <div className="api-status-card__content">
            <div className="api-status-grid api-status-grid--stats">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="api-status-stat-glow space-y-2">
                  <div className="skeleton mx-auto h-4 w-4 rounded" />
                  <div className="skeleton mx-auto h-7 w-16" />
                  <div className="skeleton mx-auto h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div {...journalStaggerRowProps(3)}>
        <div className="api-status-card">
          <div className="api-status-card__header space-y-2">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-3 w-64 max-w-full" />
          </div>
          <div className="api-status-card__content">
            <div className="api-status-grid api-status-grid--stats">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="api-status-stat-glow space-y-2">
                  <div className="skeleton mx-auto h-4 w-4 rounded" />
                  <div className="skeleton mx-auto h-7 w-12" />
                  <div className="skeleton mx-auto h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Live API status cards — client fetch + skeleton; shell/header in page.tsx */
export function ApiStatusClient() {
  const { data: status } = useQuery({
    queryKey: queryKeys.apiStatus(),
    queryFn: fetchApiStatus,
    refetchInterval: REFETCH_MS,
    staleTime: 10_000,
  });

  if (!status) {
    return <ApiStatusDataSkeleton />;
  }

  const updatedAt = new Date(status.timestamp).toLocaleString();

  return (
    <div className="flex flex-col gap-5">
      <div {...journalStaggerRowProps(1)}>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Service</CardTitle>
                <CardDescription>
                  {status.service} · last checked {updatedAt}
                </CardDescription>
              </div>
              <Badge variant={status.uptime.ok ? "success" : "destructive"}>
                {status.uptime.ok ? "Operational" : "Degraded"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <StatusDependencyCard
              icon={Database}
              title="PostgreSQL"
              meta={
                status.dependencies.database.latencyMs != null
                  ? `Round-trip ${status.dependencies.database.latencyMs}ms`
                  : "Database connectivity probe"
              }
              ok={status.dependencies.database.ok}
            />
            <StatusDependencyCard
              icon={Server}
              title="Redis (Upstash)"
              meta="Journal pub/sub and AI rate limiting"
              ok={status.dependencies.redis.ok}
              configured={status.dependencies.redis.configured}
            />
            <StatusDependencyCard
              icon={Sparkles}
              title="AI providers"
              meta="Groq · OpenRouter · Anthropic fallback chain"
              ok={status.dependencies.ai.configured}
              configured={status.dependencies.ai.configured}
            />
          </CardContent>
        </Card>
      </div>

      <div {...journalStaggerRowProps(2)}>
        <StatusStatGrid
          title="Platform totals"
          description="Aggregate counts across all accounts — numbers only"
          stats={[
            {
              label: "Accounts",
              value: status.platform.totalUsers,
              icon: Users,
            },
            {
              label: "Journals",
              value: status.platform.totalBooks,
              icon: BookOpen,
            },
            {
              label: "Entries",
              value: status.platform.totalEntries,
              icon: FileText,
            },
            {
              label: "Recently active",
              value: status.platform.recentlyActiveUsers,
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
          stats={[
            {
              label: "Your journals",
              value: status.personal.bookCount,
              icon: BookOpen,
            },
            {
              label: "Your entries",
              value: status.personal.entryCount,
              icon: FileText,
            },
          ]}
        />
      </div>
    </div>
  );
}
