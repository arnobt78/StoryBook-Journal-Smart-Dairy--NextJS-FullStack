"use client";

import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StatusDependencyCardProps = {
  icon: LucideIcon;
  title: string;
  meta: string;
  ok: boolean;
  configured?: boolean;
};

/** Single dependency row — database, Redis, or AI provider */
export function StatusDependencyCard({
  icon: Icon,
  title,
  meta,
  ok,
  configured,
}: StatusDependencyCardProps) {
  const badgeVariant =
    configured === false ? "warning" : ok ? "success" : "destructive";
  const badgeLabel =
    configured === false ? "Not configured" : ok ? "Connected" : "Unreachable";

  return (
    <div className="api-status-dep-row">
      <Icon className="api-status-dep-row__icon size-5" strokeWidth={1.75} aria-hidden />
      <div className="api-status-dep-row__body">
        <div className="api-status-dep-row__title">{title}</div>
        <div className="api-status-dep-row__meta">{meta}</div>
      </div>
      <Badge variant={badgeVariant}>{badgeLabel}</Badge>
    </div>
  );
}
