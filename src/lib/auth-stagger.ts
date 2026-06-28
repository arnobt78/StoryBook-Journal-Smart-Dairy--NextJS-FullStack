import type { CSSProperties } from "react";

/** Delay step between auth row entrances — must match globals.css calc multiplier */
export const AUTH_STAGGER_STEP_MS = 60;

/** Class applied to each explicitly indexed auth stagger row */
export const AUTH_STAGGER_ROW_CLASS = "auth-stagger-row";

/**
 * Deterministic stagger props for one row (SSR + client safe — no auto-counter).
 * Pass optional `className` / `style` extras — they merge without dropping `--auth-stagger-i`.
 */
export function authStaggerRowProps(
  index: number,
  extras?: { className?: string; style?: CSSProperties },
): { className: string; style: CSSProperties } {
  const className = extras?.className
    ? `${AUTH_STAGGER_ROW_CLASS} ${extras.className}`
    : AUTH_STAGGER_ROW_CLASS;
  return {
    className,
    style: {
      ["--auth-stagger-i" as string]: index,
      ...extras?.style,
    },
  };
}
