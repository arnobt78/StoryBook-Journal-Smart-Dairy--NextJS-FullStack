/**
 * @file components/api-status/ApiStatusClient.tsx
 *
 * WALKTHROUGH — Live API status dashboard (client island)
 * ─────────────────────────────────────────────────────
 * TanStack Query: `initialData` from SSR + 30s `refetchInterval`.
 * Invalidated on journal CRUD via `notifyJournalCacheUpdated` (personal counts).
 * Subcomponents: StatusDependencyCard, StatusStatGrid.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
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
import type { ApiStatusPayload } from "@/types/api-status";

const REFETCH_MS = 30_000;

type ApiStatusClientProps = {
  initialStatus: ApiStatusPayload;
};

/** Live API status dashboard — SSR initialData + 30s background refetch */
export function ApiStatusClient({ initialStatus }: ApiStatusClientProps) {
  const { data: status } = useQuery({
    queryKey: queryKeys.apiStatus(),
    queryFn: fetchApiStatus,
    initialData: initialStatus,
    refetchInterval: REFETCH_MS,
    staleTime: 10_000,
  });

  const updatedAt = new Date(status.timestamp).toLocaleString();

  return (
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
    </div>
  );
}
