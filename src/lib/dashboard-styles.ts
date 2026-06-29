/**
 * Shared dashboard typography — Dancing Script matches landing cover branding.
 */
import type { CSSProperties } from "react";

/** Nav + shelf h1 — same signature font as landing "StoryBook" / "Journal" */
export const DASHBOARD_BRAND_TEXT_STYLE: CSSProperties = {
  fontFamily: "'Dancing Script', cursive",
  fontWeight: 700,
};

/** Nav bar brand size */
export const DASHBOARD_NAV_BRAND_SIZE = "22px";

/** Shelf title — responsive like landing cover stack */
export const DASHBOARD_TITLE_SIZE = "clamp(32px, 5vw, 48px)";

/** #RRGGBB + 8-bit alpha for tight shelf hover rings (opaque books need real alpha, not color-mix). */
export function bookCoverGlowVars(coverColor: string): CSSProperties {
  return {
    "--book-glow-color": coverColor,
    "--book-glow-spot": `${coverColor}47`,
    "--book-glow-ring": `${coverColor}59`,
    "--book-glow-halo": `${coverColor}2e`,
  } as CSSProperties;
}
