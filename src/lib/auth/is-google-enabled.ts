/**
 * Google OAuth UI gate — env walkthrough
 * --------------------------------------
 * Returns true only when BOTH client ID and client secret are present
 * (see google-oauth-env.ts for canonical vs legacy variable names).
 *
 * Used in two places:
 *   1. getAuthPageConfig() — show/hide "Continue with Google" on auth pages
 *   2. auth.ts provider list — register GoogleProvider only when enabled
 *
 * If either var is missing, OAuth is fully disabled (no broken redirect buttons).
 * Server-only — gates UI and NextAuth config from the same env source.
 */
import { getGoogleOAuthEnv } from "@/lib/auth/google-oauth-env";

export function isGoogleOAuthEnabled(): boolean {
  return getGoogleOAuthEnv().enabled;
}
