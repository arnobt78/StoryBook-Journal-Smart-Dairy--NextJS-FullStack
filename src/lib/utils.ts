/**
 * @file lib/utils.ts
 *
 * WALKTHROUGH — Shared helpers (cn, wordCount, slugify, tag merge)
 * ────────────────────────────────────────────────────────────────
 * `cn()` — shadcn Tailwind merge. `wordCount` strips HTML for footer stats.
 * `mergePendingTag` — flush "+ tag" input on blur/save (prevents empty DB tags).
 */
/**
 * General-purpose helpers — Tailwind class merge, journal text metrics, slug/tags.
 * Imported by API routes, autosave, and UI components.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  /* shadcn pattern: merge Tailwind classes without conflicting utilities */
  return twMerge(clsx(inputs));
}

/** Count words in plain or HTML content — strips tags first */
export function wordCount(text: string): number {
  const clean = text.replace(/<[^>]*>/g, "").trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

/** ~200 wpm reading estimate; minimum 1 minute for UX */
export function readingTime(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}

/** URL-safe slug from title; optional suffix for uniqueness (see journal-slug.ts) */
export function slugify(text: string, suffix?: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return suffix ? `${base}-${suffix}` : base;
}

/** Human-readable date strings stored on JournalEntry (entryDate + weekday) */
export function formatEntryDate(date: Date = new Date()): {
  entryDate: string;
  weekday: string;
} {
  return {
    entryDate: format(date, "MMMM d, yyyy"),
    weekday: format(date, "EEEE"),
  };
}

/** Prisma stores tags as JSON string — safe parse for API → client */
export function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

/** Normalize tags from cache/API — handles parsed arrays or legacy JSON strings */
export function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((t): t is string => typeof t === "string");
  }
  if (typeof tags === "string") {
    return parseTags(tags);
  }
  return [];
}

/** Serialize tag array before Prisma write */
export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function excerptFromContent(content: string, length = 200): string {
  const text = stripHtml(content);
  return text.length > length ? text.slice(0, length) + "…" : text;
}
