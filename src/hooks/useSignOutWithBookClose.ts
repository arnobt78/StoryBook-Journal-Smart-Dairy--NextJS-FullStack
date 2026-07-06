/**
 * @file hooks/useSignOutWithBookClose.ts
 *
 * WALKTHROUGH — Logout with 3D book-close animation (Wave 20)
 * ────────────────────────────────────────────────────────────
 * Sequence: goodbye toast → LogoutBookCloseOverlay phases → queryClient.clear → signOut.
 * Shared by DashboardNav and CommandPalette. Timings in `logout-book-close.ts`.
 */
"use client";

/**
 * Shared sign-out flow for nav dropdown and ⌘K command palette.
 * Goodbye toast → book-close overlay → query cache clear → NextAuth redirect.
 */
import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import {
  AUTH_STATE_KEY,
  OAUTH_PENDING_KEY,
  OAUTH_VARIANT_KEY,
} from "@/constants/auth";
import { appToast } from "@/lib/app-toast";
import {
  LOGOUT_REDUCED_MOTION_MS,
  LOGOUT_TOTAL_MS,
  resolveLogoutDisplayName,
} from "@/lib/logout-book-close";

type SignOutUser = {
  name?: string | null;
  email?: string | null;
};

export function useSignOutWithBookClose(user: SignOutUser) {
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const busyRef = useRef(false);
  const displayName = resolveLogoutDisplayName(user);

  const handleSignOut = useCallback(async () => {
    if (busyRef.current || signingOut) return;
    busyRef.current = true;

    appToast.auth.goodbye(displayName);
    setSigningOut(true);

    queryClient.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STATE_KEY);
      localStorage.removeItem(OAUTH_PENDING_KEY);
      localStorage.removeItem(OAUTH_VARIANT_KEY);
    }

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const waitMs = reducedMotion ? LOGOUT_REDUCED_MOTION_MS : LOGOUT_TOTAL_MS;

    await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    await signOut({ callbackUrl: "/" });
  }, [displayName, queryClient, signingOut]);

  return { signingOut, handleSignOut, displayName };
}
