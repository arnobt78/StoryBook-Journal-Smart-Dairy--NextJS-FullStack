"use client";

import type { ReactNode } from "react";

/**
 * Wave 33 — horizontal scroll port for the open book 3D spread on narrow viewports.
 *
 * Wraps only the preserve-3d spread row (+ its ambient spotlight sibling).
 * Branding headers and bottom nav stay **outside** this port so they remain
 * viewport-centered via `left: 50%` on the full-width shell.
 *
 * Below 768px: `overflow-x: auto` when spread (2×--page-w + spine) exceeds
 * the port; inner width pinned to spread on mobile (Wave 33b) so scroll stops
 * at the right page edge; spotlight + 3D tilt contained via overflow:hidden.
 * md+: `overflow: hidden`; inner flex centers the spread when it fits.
 *
 * No scroll-position JS — default scrollLeft=0 shows the left page first;
 * user swipes right for the form / right page. See book-spread-scroll.ts.
 */
export function BookSpreadScrollPort({ children }: { children: ReactNode }) {
  return (
    <div className="book-spread-scroll-port">
      <div className="book-spread-scroll-inner">{children}</div>
    </div>
  );
}
