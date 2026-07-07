/**
 * @file components/api-status/StatusStatGrid.tsx
 *
 * WALKTHROUGH — Stat grid for platform/personal aggregates
 * ───────────────────────────────────────────────────────
 * Static chrome (title, description, icons, labels, subtitles) always renders.
 * Only the numeric value pulses as a skeleton chip when `loading` is true.
 */
import type { LucideIcon } from "lucide-react";

export type StatItem = {
  label: string;
  /** null while loading — value cell shows skeleton chip */
  value: number | null;
  subtitle?: string;
  icon: LucideIcon;
};

type StatusStatGridProps = {
  title: string;
  description: string;
  stats: StatItem[];
  /** When true, stat values render skeleton chips; labels/icons unchanged */
  loading?: boolean;
  staggerStartIndex?: number;
};

/** Grid of glowing stat cards — platform or personal aggregates */
export function StatusStatGrid({
  title,
  description,
  stats,
  loading = false,
}: StatusStatGridProps) {
  return (
    <div className="api-status-card">
      <div className="api-status-card__header">
        <h3 className="api-status-card__title">{title}</h3>
        <p className="api-status-card__description">{description}</p>
      </div>
      <div className="api-status-card__content">
        <div className="api-status-grid api-status-grid--stats">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="api-status-stat-glow">
                <Icon
                  className="mb-2 size-4 text-[rgba(255,180,80,0.65)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <div className="api-status-stat-glow__value">
                  {loading || stat.value == null ? (
                    <span className="skeleton api-status-value-skeleton" aria-hidden />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
                <div className="api-status-stat-glow__label">{stat.label}</div>
                {stat.subtitle ? (
                  <div className="api-status-stat-glow__subtitle">
                    {stat.subtitle}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
