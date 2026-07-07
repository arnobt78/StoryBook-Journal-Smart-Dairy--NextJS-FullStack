"use client";

/**
 * @file components/api-status/StatusDependencyCard.tsx
 *
 * WALKTHROUGH — Single dependency row (DB, Redis, AI)
 * ───────────────────────────────────────────────────
 * Icon, title, and meta always render as static chrome. Only the trailing
 * status badge pulses as a skeleton chip when `loading` is true.
 */
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StatusDependencyCardProps = {
  icon: LucideIcon;
  title: string;
  meta: string;
  ok: boolean;
  configured?: boolean;
  /** When true, badge slot shows skeleton chip instead of Connected/Unreachable */
  loading?: boolean;
};

/** Single dependency row — database, Redis, or AI provider */
export function StatusDependencyCard({
  icon: Icon,
  title,
  meta,
  ok,
  configured,
  loading = false,
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
      {loading ? (
        <span className="skeleton api-status-badge-skeleton" aria-hidden />
      ) : (
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
      )}
    </div>
  );
}
