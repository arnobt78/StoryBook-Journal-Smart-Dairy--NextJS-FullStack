/**
 * @file loading.tsx
 * @route Root segment — shown automatically while any child route's RSC payload streams.
 *
 * **SSR vs client:** Server Component (no `"use client"`). Next.js suspends the
 * matched page and renders this fallback in the same layout slot until ready.
 *
 * **Design choice:** Returning `null` avoids a second full-screen loader that would
 * flash over the landing cover animation during transitions to `/login` or `/register`.
 */
/**
 * Root `loading.tsx` previously rendered a full-screen “OPENING YOUR JOURNAL…”
 * panel on every segment transition, which read as an extra fallback flash
 * between the landing cover animation and `/login` / `/register`.
 * Returning `null` keeps the shell visible while RSC streams (no duplicate bg).
 */
export default function Loading() {
  return null;
}
