/**
 * @file components/layout/JournalRealtimeBridge.tsx
 *
 * WALKTHROUGH — Invisible SSE listener mount
 * ───────────────────────────────────────
 * Renders null; only calls `useJournalRealtime()` once inside dashboard shell.
 * Keeps SSE subscription out of individual pages (single connection per session).
 */
"use client";

/** Mounts SSE realtime listener for authenticated dashboard sessions. */
import { useJournalRealtime } from "@/hooks/useJournalRealtime";

export function JournalRealtimeBridge() {
  useJournalRealtime();
  return null;
}
