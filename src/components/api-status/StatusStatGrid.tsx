import type { LucideIcon } from "lucide-react";

export type StatItem = {
  label: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
};

type StatusStatGridProps = {
  title: string;
  description: string;
  stats: StatItem[];
  staggerStartIndex?: number;
};

/** Grid of glowing stat cards — platform or personal aggregates */
export function StatusStatGrid({
  title,
  description,
  stats,
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
                  {stat.value.toLocaleString()}
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
