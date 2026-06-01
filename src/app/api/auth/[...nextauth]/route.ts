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
