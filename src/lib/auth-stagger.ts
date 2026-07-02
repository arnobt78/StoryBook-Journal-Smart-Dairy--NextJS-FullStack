import type { CSSProperties } from "react";

/** Delay step between auth row entrances — must match globals.css calc multiplier */
export const AUTH_STAGGER_STEP_MS = 60;

/** Class applied to each explicitly indexed auth stagger row */
export const AUTH_STAGGER_ROW_CLASS = "auth-stagger-row";

/**
 * Deterministic stagger props for one row (SSR + client safe — no auto-counter).
 * Landing parallel delays come from globals.css when `data-auth-from-landing` is set.
 */
export function authStaggerRowProps(
  index: number,
  extras?: {
    className?: string;
    style?: CSSProperties;
  },
): { className: string; style: CSSProperties } {
  const parts = [AUTH_STAGGER_ROW_CLASS, extras?.className].filter(Boolean);
  return {
    className: parts.join(" "),
    style: {
      ["--auth-stagger-i" as string]: index,
      ...extras?.style,
    },
  };
}
