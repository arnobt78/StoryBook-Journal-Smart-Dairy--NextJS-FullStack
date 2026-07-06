/**
 * @file api/auth/[...nextauth]/route.ts
 * @route GET, POST `/api/auth/*`
 *
 * WALKTHROUGH — NextAuth.js App Router entry
 * ─────────────────────────────────────────
 * Re-exports `handlers` from `@/lib/auth` — OAuth callbacks, session endpoint,
 * CSRF, credentials sign-in/out. All session/JWT logic lives in auth.ts callbacks.
 */
/**
 * NextAuth.js catch-all route — /api/auth/[...nextauth]
 *
 * HTTP: GET + POST (OAuth callbacks, session, CSRF, sign-in/out).
 * Auth: handled inside @/lib/auth handlers (credentials + Google OAuth).
 * Validation: none in this file; NextAuth validates its own payloads.
 * Ownership: N/A — session/JWT provisioning lives in auth callbacks.
 */
import { handlers } from "@/lib/auth";

/** Re-export NextAuth route handlers for App Router. */
export const { GET, POST } = handlers;
