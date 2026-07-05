/**
 * Wave 33 — mobile horizontal scroll for the open book 3D spread.
 *
 * Below 768px the spread (2×--page-w + spine) often exceeds the viewport while
 * keeping readable page width. Auth + journal wrap the preserve-3d row in
 * `.book-spread-scroll-port` (see BookSpreadScrollPort.tsx + globals.css).
 *
 * CSS uses BOOK_SPREAD_WIDTH_CSS; this module exports the same math for tests.
 */

/** Max viewport width (px) where horizontal scroll is enabled — Tailwind `md` is 768. */
export const BOOK_SPREAD_SCROLL_MAX_PX = 767;

/** CSS expression for full spread width — keep in sync with scroll-inner sizing. */
export const BOOK_SPREAD_WIDTH_CSS =
  "calc(var(--page-w, 360px) * 2 + var(--spine-w, 22px))";

/** Class on the horizontal scroll port wrapper (see BookSpreadScrollPort.tsx). */
export const BOOK_SPREAD_SCROLL_PORT_CLASS = "book-spread-scroll-port";

/** Class on the inner snap/width pin wrapper inside the scroll port. */
export const BOOK_SPREAD_SCROLL_INNER_CLASS = "book-spread-scroll-inner";

/** Shared preserve-3d flex row — auth + journal spread; mobile tilt reset in globals.css */
export const BOOK_SPREAD_3D_ROW_CLASS = "book-spread-3d-row";

/** Journal-only mild perspective tilt — stripped below 768px inside scroll-inner */
export const BOOK_SPREAD_3D_ROW_TILTED_CLASS = "book-spread-3d-row--tilted";

/**
 * Wave 35 — fixed journal route wrapper; horizontal pan on scroll port only (phone).
 * Wave 36–39 — mobile chrome bands; md+ flows in dashboard-scroll with browser scroll.
 */
export const JOURNAL_ROUTE_VIEWPORT_CLASS = "journal-route-viewport";

/** Auth login/register — mobile chrome + header spotlight; md+ uses natural 80vh layout */
export const AUTH_ROUTE_VIEWPORT_CLASS = "auth-route-viewport";

/** Default spine width when --spine-w is unset (matches globals.css :root). */
export const BOOK_SPREAD_DEFAULT_SPINE_PX = 22;

/**
 * True when the spread is wider than the viewport — horizontal scroll is needed.
 * Pure helper for unit tests; runtime uses native overflow-x: auto.
 */
export function spreadWiderThanViewport(
  viewportPx: number,
  pageWPx: number,
  spineWPx: number = BOOK_SPREAD_DEFAULT_SPINE_PX,
): boolean {
  return pageWPx * 2 + spineWPx > viewportPx;
}
