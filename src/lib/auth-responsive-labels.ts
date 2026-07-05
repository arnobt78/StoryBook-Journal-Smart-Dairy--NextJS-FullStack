/**
 * Wave 34 — auth UI labels with mobile short variants.
 *
 * Short strings render below 768px via `.auth-responsive-label--short` in globals.css;
 * full strings use `.auth-responsive-label--full`. SSR-safe — no matchMedia.
 */

/** Demo picker — full label on md+ */
export const DEMO_PICKER_LABEL_FULL = "Select Demo Account";

/** Demo picker — two-word label that fits ~340px auth right page */
export const DEMO_PICKER_LABEL_SHORT = "Demo account";

/** Google OAuth — login + register mobile short label */
export const OAUTH_GMAIL_LABEL = "Open with Gmail";

/** Google OAuth — register full label on md+ */
export const OAUTH_GMAIL_REGISTER_LABEL_FULL = "Continue with Gmail";
