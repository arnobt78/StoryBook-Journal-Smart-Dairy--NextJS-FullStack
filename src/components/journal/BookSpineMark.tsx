"use client";

/**
 * Spine ornament — icon beside vertical title, centered on book cover.
 * Shared by dashboard shelf and editor shelf preview.
 */
import { CoverIcon } from "@/components/journal/CoverIcon";

export type BookSpineMarkProps = {
  iconId: string;
  title: string;
  iconSize?: number;
  className?: string;
};

export function BookSpineMark({
  iconId,
  title,
  iconSize = 20,
  className,
}: BookSpineMarkProps) {
  return (
    <div className={className ? `journal-spine-mark ${className}` : "journal-spine-mark"}>
      <CoverIcon
        id={iconId}
        {...(iconSize != null ? { size: iconSize } : {})}
        className="journal-spine-mark-icon"
      />
      <span className="journal-spine-mark-title">{title}</span>
    </div>
  );
}
