/**
 * Google OAuth environment — single source of truth
 * -------------------------------------------------
 * Canonical (preferred):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *
 * Legacy aliases (still supported for older .env files):
 *   GOOGLE_ID     → same as GOOGLE_CLIENT_ID
 *   GOOGLE_SECRET → same as GOOGLE_CLIENT_SECRET
 *
 * Resolution: first non-empty trimmed value wins per field.
 * enabled: true only when BOTH clientId and clientSecret are set.
 *
 * Walkthrough: copy .env.example → .env, fill Google Cloud Console credentials,
 * restart dev server. isGoogleOAuthEnabled() and NextAuth GoogleProvider both
 * read from getGoogleOAuthEnv() — no duplicate env parsing elsewhere.
 */
export type GoogleOAuthEnv = {
  clientId: string | undefined;
  clientSecret: string | undefined;
  enabled: boolean;
};

export function getGoogleOAuthEnv(): GoogleOAuthEnv {
  const clientId =
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_ID?.trim() ||
    undefined;

  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_SECRET?.trim() ||
    undefined;

  return {
    clientId,
    clientSecret,
    enabled: Boolean(clientId && clientSecret),
  };
}
