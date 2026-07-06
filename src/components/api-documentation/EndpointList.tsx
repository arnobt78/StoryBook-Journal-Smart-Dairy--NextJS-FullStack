"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge, methodBadgeVariant } from "@/components/ui/badge";
import type { ApiEndpointDoc, ApiDocTag } from "@/lib/api-route-catalog";
import { cn } from "@/lib/utils";

type EndpointListProps = {
  grouped: Record<ApiDocTag, ApiEndpointDoc[]>;
};

function EndpointRow({ endpoint }: { endpoint: ApiEndpointDoc }) {
  const [open, setOpen] = useState(false);

  const authLabel =
    endpoint.auth === "none"
      ? "Public"
      : endpoint.auth === "session+rateLimit"
        ? "Session + rate limit"
        : "Session";

  return (
    <div className="api-status-endpoint">
      <button
        type="button"
        className="api-status-endpoint__header w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Badge variant={methodBadgeVariant(endpoint.method)}>{endpoint.method}</Badge>
        <code className="api-status-endpoint__path">{endpoint.path}</code>
        <Badge variant="outline">{authLabel}</Badge>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[rgba(255,180,80,0.55)] transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="api-status-endpoint__body">
          <p className="api-status-endpoint__summary">{endpoint.summary}</p>
          {endpoint.description ? (
            <p className="api-status-endpoint__summary">{endpoint.description}</p>
          ) : null}
          {endpoint.queryParams && endpoint.queryParams.length > 0 ? (
            <div className="mt-3">
              <p className="mb-1 font-lora text-xs uppercase tracking-wider text-[rgba(255,178,75,0.6)]">
                Query parameters
              </p>
              <SchemaFieldsTable fields={endpoint.queryParams} />
            </div>
          ) : null}
          {endpoint.requestBody ? (
            <div className="mt-3">
              <p className="mb-1 font-lora text-xs uppercase tracking-wider text-[rgba(255,178,75,0.6)]">
                Request body — {endpoint.requestBody.schemaName}
              </p>
              <SchemaFieldsTable fields={endpoint.requestBody.fields} />
            </div>
          ) : null}
          <div className="mt-3">
            <p className="mb-1 font-lora text-xs uppercase tracking-wider text-[rgba(255,178,75,0.6)]">
              Responses
            </p>
            <ul className="space-y-1 font-lora text-xs text-[rgba(255,205,130,0.65)]">
              {endpoint.responses.map((r) => (
                <li key={r.status}>
                  <Badge variant={r.status < 400 ? "success" : "warning"} className="mr-2">
                    {r.status}
                  </Badge>
                  {r.description}
                  {r.envelope ? ` — ${r.envelope}` : ""}
                </li>
              ))}
            </ul>
          </div>
          {endpoint.notes ? (
            <p className="mt-3 font-lora text-xs italic text-[rgba(255,205,130,0.5)]">
              {endpoint.notes}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SchemaFieldsTable({
  fields,
}: {
  fields: { name: string; type: string; required?: boolean; description?: string }[];
}) {
  return (
    <table className="api-status-schema-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Type</th>
          <th>Required</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f) => (
          <tr key={f.name}>
            <td>
              <code>{f.name}</code>
            </td>
            <td>{f.type}</td>
            <td>{f.required ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Swagger-style expandable endpoint list grouped by tag */
export function EndpointList({ grouped }: EndpointListProps) {
  return (
    <div className="space-y-8">
      {(Object.entries(grouped) as [ApiDocTag, ApiEndpointDoc[]][]).map(([tag, endpoints]) => {
        if (endpoints.length === 0) return null;
        return (
          <section key={tag}>
            <h3 className="mb-3 font-playfair text-lg font-semibold text-[rgba(255,210,140,0.92)]">
              {tag}
            </h3>
            {endpoints.map((ep) => (
              <EndpointRow key={ep.id} endpoint={ep} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
