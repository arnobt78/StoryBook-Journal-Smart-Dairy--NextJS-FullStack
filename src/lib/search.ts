/**
 * @file lib/search.ts
 *
 * WALKTHROUGH — Command palette search types + Zod query schema
 * ─────────────────────────────────────────────────────────────
 * `searchQuerySchema` validates GET `/api/search` params.
 * `SearchHit` shape returned to CommandPalette for keyboard navigation.
 */
/**
 * Journal search — Prisma scoped full-text-lite (title/content contains).
 */
import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  bookId: z.string().cuid().optional(),
  mood: z.string().max(8).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export type SearchHit = {
  id: string;
  bookId: string;
  bookTitle: string;
  title: string;
  excerpt: string | null;
  mood: string;
  entryDate: string;
};
