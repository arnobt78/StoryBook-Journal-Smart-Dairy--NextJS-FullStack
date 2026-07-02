/**
 * Logout book-close choreography — phased fold, hinge shut, 360° orbit.
 * Timings mirror landing BookCover open (0.8s fold, 0.72s hinge) but slower for sign-out.
 */

/** Pages fold inward — matches landing cover-fold-sheet ~0.8s */
export const LOGOUT_FOLD_MS = 800;
/** Leather cover swings shut — matches coverHingeOpen 0.72s */
export const LOGOUT_HINGE_MS = 720;
/** Full 360° orbit after close */
export const LOGOUT_ORBIT_MS = 1400;
/** Hinge starts near end of fold (landing uses ~0.1s after fold start) */
export const LOGOUT_HINGE_DELAY_MS = 550;
/** Orbit starts only after hinge completes — keeps phases in sync */
export const LOGOUT_ORBIT_DELAY_MS = LOGOUT_HINGE_DELAY_MS + LOGOUT_HINGE_MS;
export const LOGOUT_HOLD_MS = 250;

export const LOGOUT_TOTAL_MS =
  LOGOUT_ORBIT_DELAY_MS + LOGOUT_ORBIT_MS + LOGOUT_HOLD_MS;

export const LOGOUT_REDUCED_MOTION_MS = 500;

/** CSS custom properties for globals.css animation durations */
export const LOGOUT_ANIMATION_VARS = {
  "--logout-fold-ms": `${LOGOUT_FOLD_MS}ms`,
  "--logout-hinge-ms": `${LOGOUT_HINGE_MS}ms`,
  "--logout-orbit-ms": `${LOGOUT_ORBIT_MS}ms`,
  "--logout-hinge-delay": `${LOGOUT_HINGE_DELAY_MS}ms`,
  "--logout-orbit-delay": `${LOGOUT_ORBIT_DELAY_MS}ms`,
} as const;

type LogoutUser = {
  name?: string | null;
  email?: string | null;
};

/** Display name for goodbye / OAuth welcome toasts */
export function resolveLogoutDisplayName(user: LogoutUser): string {
  if (user.name?.trim()) return user.name.trim();
  const local = user.email?.split("@")[0];
  if (local?.trim()) return local.trim();
  return "Reader";
}
