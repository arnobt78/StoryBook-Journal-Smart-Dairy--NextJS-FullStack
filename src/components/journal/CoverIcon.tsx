"use client";

/**
 * Renders a journal cover icon by slug (or legacy emoji via resolveCoverIconId).
 */
import { getCoverIconDef } from "@/constants/cover-icons";

export type CoverIconProps = {
  id: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export function CoverIcon({
  id,
  size = 20,
  className,
  strokeWidth = 1.75,
}: CoverIconProps) {
  const { Icon } = getCoverIconDef(id);
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden
    />
  );
}
