/**
 * Server-only check: Google OAuth button renders only when both env vars are set.
 * Keeps production builds safe when OAuth is not configured (no dead button).
 */
export function isGoogleOAuthEnabled(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}
