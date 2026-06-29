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
