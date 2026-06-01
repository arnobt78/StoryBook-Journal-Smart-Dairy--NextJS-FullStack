"use client";

/**
 * After Google OAuth redirect, invalidate journal queries once so shelf/spread
 * show the new user's data without a manual refresh (matches credentials login flow).
 *
 * ── WALKTHROUGH: post-OAuth cache sync ──
 *  GoogleSignInButton sets OAUTH_PENDING_KEY before redirect; this effect runs once
 *  on dashboard mount, clears the flag, and invalidates `journalSubtree`.
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { OAUTH_PENDING_KEY } from "@/constants/auth";
import { queryKeys } from "@/lib/query-keys";

export function OAuthReturnSync() {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || typeof window === "undefined") return;
    if (localStorage.getItem(OAUTH_PENDING_KEY) !== "true") return;

    ran.current = true;
    localStorage.removeItem(OAUTH_PENDING_KEY);
    void queryClient.invalidateQueries({ queryKey: queryKeys.journalSubtree() });
  }, [queryClient]);

  return null;
}
