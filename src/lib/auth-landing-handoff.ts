/**
 * Landing → auth handoff flag (sessionStorage + html dataset).
 *
 * Set when the user opens the cover from `/` (CTA or cover click). The html
 * `data-auth-from-landing` attribute applies parallel enter CSS on the first auth
 * paint before React hydrates. Cleared after the full choreography completes.
 * Direct /login visits never set the flag.
 */
export const AUTH_LANDING_HANDOFF_KEY = "storybook-auth-from-landing";
export const AUTH_LANDING_DATASET = "authFromLanding";

/** Open spread shell enter — sync with globals.css authBookShellEnter (0.9s) and COVER_OPEN_MS */
export const AUTH_LANDING_SHELL_MS = 900;

/** Rows begin early inside shell enter (left/right same index share delay) */
export const AUTH_LANDING_STAGGER_START_MS = 100;

/** Per-index stair during landing (sync with globals.css) */
export const AUTH_LANDING_STAGGER_STEP_MS = 50;

/** authRowIn duration on landing rows */
export const AUTH_LANDING_ROW_ANIM_MS = 450;

/** Max stagger index buffer (login with demo uses index 11) */
export const AUTH_LANDING_MAX_ROWS = 12;

/**
 * Total choreography before clearing handoff — shell + last row finish buffer.
 */
export const AUTH_LANDING_TOTAL_MS =
  AUTH_LANDING_SHELL_MS +
  AUTH_LANDING_STAGGER_START_MS +
  AUTH_LANDING_MAX_ROWS * AUTH_LANDING_STAGGER_STEP_MS +
  AUTH_LANDING_ROW_ANIM_MS;

/** @deprecated Use AUTH_LANDING_SHELL_MS */
export const AUTH_LANDING_ENTER_MS = AUTH_LANDING_SHELL_MS;

/** CSS custom properties for landing parallel stagger — set on documentElement */
export const AUTH_LANDING_CSS_VARS: Record<string, string> = {
  "--auth-landing-stagger-start-ms": `${AUTH_LANDING_STAGGER_START_MS}ms`,
  "--auth-landing-stagger-step-ms": `${AUTH_LANDING_STAGGER_STEP_MS}ms`,
};

/** Apply landing stagger CSS variables on documentElement (client only). */
export function applyAuthLandingCssVars(): void {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(AUTH_LANDING_CSS_VARS)) {
    root.style.setProperty(key, value);
  }
}

/** Remove landing stagger CSS variables from documentElement. */
export function clearAuthLandingCssVars(): void {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  for (const key of Object.keys(AUTH_LANDING_CSS_VARS)) {
    root.style.removeProperty(key);
  }
}

/** Mark that the next auth mount should ease the open spread in from landing. */
export function setAuthLandingHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_LANDING_HANDOFF_KEY, "1");
    document.documentElement.dataset[AUTH_LANDING_DATASET] = "1";
    applyAuthLandingCssVars();
  } catch {
    /* private browsing / quota — skip enter animation */
  }
}

/** Whether landing handoff is pending (storage or html dataset). */
export function hasAuthLandingHandoff(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(AUTH_LANDING_HANDOFF_KEY) === "1" ||
      document.documentElement.dataset[AUTH_LANDING_DATASET] === "1"
    );
  } catch {
    return false;
  }
}

/** Clear handoff after enter animation — safe to call multiple times. */
export function clearAuthLandingHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_LANDING_HANDOFF_KEY);
    delete document.documentElement.dataset[AUTH_LANDING_DATASET];
    clearAuthLandingCssVars();
  } catch {
    /* ignore */
  }
}

/**
 * Read and clear the handoff flag. Returns true only on the first consume after landing.
 */
export function consumeAuthLandingHandoff(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const had = hasAuthLandingHandoff();
    if (had) clearAuthLandingHandoff();
    return had;
  } catch {
    return false;
  }
}
