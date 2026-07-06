/**
 * @file constants/auth.ts
 *
 * WALKTHROUGH — localStorage keys for OAuth return + navbar auth flicker guard
 * ───────────────────────────────────────────────────────────────────────────
 */
/**
 * Auth-related constants shared by login UI and OAuth redirect handling.
 * localStorage keys mirror AUTH_UI_IMPLEMENTATION_GUIDE.md to prevent navbar flicker
 * when returning from Google OAuth.
 */
export const AUTH_STATE_KEY = "navbar_was_authenticated";
export const OAUTH_PENDING_KEY = "oauth_login_pending";
/** Set before Google redirect — login vs register picks welcome vs registered toast */
export const OAUTH_VARIANT_KEY = "oauth_login_variant";

export type OAuthAuthVariant = "login" | "register";

/** Demo account — matches prisma/seed.ts and register route ensureTestUser */
export const TEST_ACCOUNT_EMAIL = "test@user.com";
export const TEST_ACCOUNT_PASSWORD = "12345678";
/** Display name shown in demo picker trigger + menu row when demo creds are active */
export const TEST_ACCOUNT_DISPLAY_NAME = "Test User";

/** Post-OAuth landing route; dashboard queries refetch on mount via TanStack Query */
export const OAUTH_CALLBACK_URL = "/dashboard";
