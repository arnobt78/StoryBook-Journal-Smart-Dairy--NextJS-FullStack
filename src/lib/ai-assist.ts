/**
 * WALKTHROUGH — ai-assist.ts
 *
 * Shared server/client contract for AI writing continuation:
 *   - Zod schema validates POST body (title, content, mood, assistSessionId)
 *   - createAiAssistSessionId() — one id per button click; pairs with rate limit
 *   - buildAssistPrompt() — poetic journal tone for Claude/API route
 *   - DEV_PLACEHOLDER — fallback text when no API key in development
 */
import { z } from "zod";

export const aiAssistRequestSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, "No content to continue"),
  mood: z.string().optional(),
  /** Client-generated id — stream + sync fallback share one rate-limit slot per click */
  assistSessionId: z.string().min(8).max(64).optional(),
});

/** One assist click → one session id for deduped rate limiting */
export function createAiAssistSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export type AiAssistRequest = z.infer<typeof aiAssistRequestSchema>;

export type AiAssistResponse = {
  text?: string;
  error?: string;
};

export function buildAssistPrompt(input: AiAssistRequest): string {
  return `You are a poetic journal writing assistant. Continue this personal diary entry with 2-3 sentences that match the voice and mood (${input.mood ?? "✨"}). Be literary, warm, introspective. Write only the continuation — no preamble, no quotation marks, no explanation.

Title: "${input.title ?? ""}"
Current text: "${input.content}"

Continue:`;
}

export const DEV_PLACEHOLDER =
  "\n\nThe words came slowly at first, then all at once — as they always do when truth finds its way through.";
