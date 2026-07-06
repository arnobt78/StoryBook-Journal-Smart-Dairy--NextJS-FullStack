/**
 * @file components/api-documentation/ApiDocumentationClient.tsx
 *
 * WALKTHROUGH — OpenAPI-style docs UI (Overview | Endpoints | Schemas)
 * ───────────────────────────────────────────────────────────────────
 * Static catalog from SSR `initialCatalog`; client caches 5min via useQuery.
 * EndpointList: expandable Swagger rows; SchemaPanel: Zod field tables.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EndpointList } from "@/components/api-documentation/EndpointList";
import { SchemaPanel } from "@/components/api-documentation/SchemaPanel";
import { fetchApiOpenApi } from "@/lib/api-openapi-client";
import { groupEndpointsByTag, type ApiRouteCatalog } from "@/lib/api-route-catalog";
import { journalStaggerRowProps } from "@/lib/journal-stagger";
import { queryKeys } from "@/lib/query-keys";

type ApiDocumentationClientProps = {
  initialCatalog: ApiRouteCatalog;
};

/** OpenAPI-style API documentation — Overview | Endpoints | Schemas tabs */
export function ApiDocumentationClient({ initialCatalog }: ApiDocumentationClientProps) {
  const { data: catalog } = useQuery({
    queryKey: queryKeys.apiOpenApi(),
    queryFn: fetchApiOpenApi,
    initialData: initialCatalog,
    staleTime: 5 * 60_000,
  });

  const grouped = groupEndpointsByTag(catalog.endpoints);

  return (
    <div className="api-status-page">
      <header {...journalStaggerRowProps(0, { className: "api-status-page-header" })}>
        <FileText
          className="mx-auto mb-2 size-8 text-[rgba(255,180,80,0.7)]"
          strokeWidth={1.5}
          aria-hidden
        />
        <h1 className="api-status-page-header__title">API Documentation</h1>
        <p className="api-status-page-header__subtitle">
          {catalog.info.title} v{catalog.info.version} — live route catalog
        </p>
      </header>

      <div {...journalStaggerRowProps(1)}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="schemas">Schemas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Architecture</CardTitle>
                <CardDescription>{catalog.info.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 font-lora text-sm leading-relaxed text-[rgba(255,205,130,0.7)]">
                <p>
                  <strong className="text-[rgba(255,210,140,0.9)]">Rendering:</strong> SSR in{" "}
                  <code>page.tsx</code> with <code>force-dynamic</code>; client islands for
                  interactivity only.
                </p>
                <p>
                  <strong className="text-[rgba(255,210,140,0.9)]">Cache:</strong> TanStack Query
                  with <code>initialData</code> from server. Journal mutations invalidate via{" "}
                  <code>notifyJournalCacheUpdated</code> only — never raw{" "}
                  <code>journalSubtree</code> elsewhere.
                </p>
                <p>
                  <strong className="text-[rgba(255,210,140,0.9)]">Realtime:</strong> SSE at{" "}
                  <code>GET /api/journal/events</code> polls Redis buffer; cross-tab sync triggers
                  cache invalidation without page refresh.
                </p>
                <p>
                  <strong className="text-[rgba(255,210,140,0.9)]">Auth:</strong> Session-scoped
                  routes filter all Prisma queries by <code>session.user.id</code>. Public routes:{" "}
                  <code>/api/health</code>, <code>/api/auth/register</code>, NextAuth handlers.
                </p>
                <p>
                  <strong className="text-[rgba(255,210,140,0.9)]">Envelope:</strong> Journal APIs
                  return <code>{`{ success, data, message? }`}</code>. AI routes use{" "}
                  <code>{`{ text }`}</code> or <code>{`{ error }`}</code>.
                </p>
                <div className="mt-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-[rgba(255,178,75,0.6)]">
                    Tags
                  </p>
                  <ul className="space-y-2">
                    {catalog.tags.map((t) => (
                      <li key={t.name}>
                        <span className="font-medium text-[rgba(255,210,140,0.85)]">{t.name}</span>
                        {" — "}
                        {t.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints">
            <EndpointList grouped={grouped} />
          </TabsContent>

          <TabsContent value="schemas">
            <SchemaPanel schemas={catalog.schemas} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
