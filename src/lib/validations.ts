/**
 * @file lib/validations.ts
 *
 * WALKTHROUGH — Shared Zod schemas (single source of truth)
 * ─────────────────────────────────────────────────────────
 * API Route Handlers call `.safeParse()` on incoming JSON bodies.
 * Client forms may reuse the same schemas via `@hookform/resolvers/zod`.
 * Keeping validation here prevents drift between frontend payloads and server rules.
 * OpenAPI docs in `api-route-catalog.ts` mirror these field definitions.
 */
/**
 * Zod schemas shared by API Route Handlers and (optionally) client forms.
 * Single validation source prevents drift between frontend payloads and server expectations.
 */
import { z } from "zod";
import { isAllowedCoverIcon } from "@/constants/cover-icons";

/** POST /api/auth/register */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Name is required").max(60),
});

/** POST /api/auth/login (client-side); Credentials provider uses raw fields */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/** POST /api/books — shelf create */
export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(300).optional(),
  coverColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b4513"),
  coverEmoji: z
    .string()
    .refine(isAllowedCoverIcon, "Invalid cover icon")
    .default("book-open"),
  theme: z
    .enum(["warm-paper", "dark-academia", "midnight-journal", "soft-minimal", "vintage-diary"])
    .default("warm-paper"),
  visibility: z.enum(["private", "public"]).default("private"),
});

/** PATCH /api/books/[bookId] — all fields optional */
export const updateBookSchema = createBookSchema.partial();

/** POST /api/entries */
export const createEntrySchema = z.object({
  bookId: z.string().cuid(),
  title: z.string().max(200).default("Untitled Entry"),
  content: z.string().default(""),
  mood: z.string().default("✨"),
  weather: z.string().default("☀️"),
  location: z.string().max(100).optional(),
  tags: z.array(z.string().max(30)).default([]),
});

/** PATCH /api/entries/[entryId] — autosave + manual save send partial payloads */
export const updateEntrySchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  mood: z.string().optional(),
  weather: z.string().optional(),
  location: z.string().max(100).optional(),
  tags: z.array(z.string().max(30)).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

/** POST /api/voice/transcribe — multipart metadata fields (audio blob validated in handler) */
export const voiceTranscribeSchema = z.object({
  provider: z
    .enum(["server-deepgram", "server-assemblyai"])
    .optional()
    .default("server-deepgram"),
  audioFormat: z.string().max(30).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type VoiceTranscribeInput = z.infer<typeof voiceTranscribeSchema>;
