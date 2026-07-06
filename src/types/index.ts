/**
 * @file types/index.ts
 *
 * WALKTHROUGH — Domain TypeScript interfaces (JournalBook, JournalEntry, User)
 * ───────────────────────────────────────────────────────────────────────────
 * Mirror Prisma models + client-only shapes. Imported by components, hooks, journal-api.
 */
/**
 * Shared TypeScript domain types — mirror Prisma models + client-only shapes.
 * Used by components, hooks, and journal-api fetch helpers for strict typing.
 */

/** Mirrors Prisma User — session user is a subset via NextAuth */
export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  themePreference: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Journal on the shelf; `_count.entries` from Prisma include on dashboard */
export interface JournalBook {
  id: string;
  userId: string;
  title: string;
  slug: string;
  coverColor: string;
  coverEmoji: string;
  theme: string;
  description?: string | null;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { entries: number };
  entries?: JournalEntry[];
}

/** Single diary page; `tags` is parsed JSON string from DB in API/pages */
export interface JournalEntry {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  mood: string;
  weather: string;
  location?: string | null;
  tags: string[];
  wordCount: number;
  readingTime: number;
  isFavorite: boolean;
  isArchived: boolean;
  entryDate: string;
  weekday: string;
  createdAt: Date;
  updatedAt: Date;
}

/** In-memory write mode shape — subset of JournalEntry fields edited in RightPage */
export type EntryDraft = Pick<
  JournalEntry,
  "title" | "content" | "mood" | "weather" | "tags" | "location"
>;

/** Page-flip animation direction consumed by PageFlipOverlay + stagger CSS */
export type FlipDirection = "fwd" | "bwd";

/** Standard JSON envelope from Route Handlers (`success`, `message`, optional `data`) */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}
