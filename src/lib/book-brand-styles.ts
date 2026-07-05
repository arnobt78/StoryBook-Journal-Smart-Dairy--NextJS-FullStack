/**
 * Golden book branding — shared between auth shell header and journal spread header.
 * Keeps Dancing Script + amber glow consistent across login and reader views.
 */
import type { CSSProperties } from "react";

/** Dancing Script golden title — matches auth "StoryBook" label above open spread */
export const BOOK_BRAND_GOLD_TEXT_STYLE: CSSProperties = {
  fontFamily: "'Dancing Script', cursive",
  fontWeight: 700,
  fontStyle: "italic",
  fontSize: "20px",
  color: "rgba(255,205,120,.92)",
  letterSpacing: "0.02em",
  textShadow: "0 0 22px rgba(255,165,60,.5), 0 2px 8px rgba(0,0,0,.45)",
  lineHeight: 1.2,
};

/**
 * Inline description beside golden title — same face/size as title (AuthBookShell parity).
 * nowrap + ellipsis keep icon/title/desc on one horizontal axis in BookSpreadHeader.
 */
export const BOOK_BRAND_DESC_INLINE_STYLE: CSSProperties = {
  ...BOOK_BRAND_GOLD_TEXT_STYLE,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** Cover icon beside journal header title — warm leather stroke + amber glow */
export const BOOK_BRAND_ICON_STYLE: CSSProperties = {
  color: "rgba(255,195,110,.88)",
  filter:
    "drop-shadow(0 0 10px rgba(255,155,50,.42)) drop-shadow(0 1px 5px rgba(120,60,10,.28))",
  flexShrink: 0,
};

/** Middle dot between title and description — matches auth brand separator opacity */
export const BOOK_BRAND_SEPARATOR_STYLE: CSSProperties = {
  ...BOOK_BRAND_GOLD_TEXT_STYLE,
  opacity: 0.5,
};

/**
 * Truncate book meta for inline header — preserves full string for tooltip.
 * @param text - title or description
 * @param maxLen - visible character budget before ellipsis
 */
export function truncateBookMeta(
  text: string | null | undefined,
  maxLen = 48,
): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

/** True when tooltip should expose full text (truncated or multi-line description). */
export function bookMetaNeedsTooltip(
  title: string,
  description: string | null | undefined,
  maxLen = 48,
): boolean {
  const desc = (description ?? "").trim();
  if (desc.length > maxLen) return true;
  return title.trim().length > maxLen;
}
