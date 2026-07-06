/**
 * @file hooks/useMinMd.ts
 *
 * WALKTHROUGH — SSR-safe md breakpoint (768px) via useSyncExternalStore
 * ─────────────────────────────────────────────────────────────────────
 * SSR returns false; hydrates to match media query without layout flash hooks.
 */
"use client";

import { useSyncExternalStore } from "react";

const MD_QUERY = "(min-width: 768px)";

/** True at md breakpoint (768px+) — client-only; SSR defaults false. */
export function useMinMd(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(MD_QUERY);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(MD_QUERY).matches,
    () => false,
  );
}
