/**
 * @file lib/journal-stagger.ts
 *
 * WALKTHROUGH — Journal UI row entrance animation indices
 * ───────────────────────────────────────────────────────
 * Mirrors `auth-stagger.ts`: each row gets `--journal-stagger-i` × 60ms delay.
 * Used by BookSpreadHeader, LeftPage, RightPage. Replays on flip via `entryStaggerKey` remount.
 */
import type { CSSProperties } from "react";

/**
 * Journal book row entrance stagger — mirrors `auth-stagger.ts` exactly so the
 * dashboard book (header + left/right pages) plays the same synchronized
 * "wave" cascade as the login/register book on every mount (shelf click or
 * hard refresh), with zero flash/flicker/layout shift.
 *
 * Usage pattern (see BookSpreadHeader/LeftPage/RightPage): each column keeps
 * its OWN locally-scoped index counter starting at 0, so header/left/right
 * rows fire in lockstep at the same 60ms step — identical to how AuthBookShell
 * restarts the counter independently for its branding block, left page, and
 * right page.
 */

/** Delay step between journal row entrances — matches AUTH_STAGGER_STEP_MS for visual parity. */
export const JOURNAL_STAGGER_STEP_MS = 60;

/** Class applied to each explicitly indexed journal stagger row. */
export const JOURNAL_STAGGER_ROW_CLASS = "journal-stagger-row";

/**
 * Deterministic stagger props for one row (SSR + client safe — no auto-counter).
 * Reuses the `authRowIn` keyframe via `.journal-stagger-row` in globals.css.
 */
export function journalStaggerRowProps(
  index: number,
  extras?: {
    className?: string;
    style?: CSSProperties;
  },
): { className: string; style: CSSProperties } {
  const parts = [JOURNAL_STAGGER_ROW_CLASS, extras?.className].filter(Boolean);
  return {
    className: parts.join(" "),
    style: {
      ["--journal-stagger-i" as string]: index,
      ...extras?.style,
    },
  };
}
