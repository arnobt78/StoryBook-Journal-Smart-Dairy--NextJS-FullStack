/**
 * @file components/auth/OAuthReturnSync.tsx
 *
 * WALKTHROUGH — Post-OAuth journal cache invalidation + welcome toast
 * ─────────────────────────────────────────────────────────────────
 * Mounts in DashboardClientShell; calls notifyJournalCacheUpdated once.
 */
"use client";

/**
 * After Google OAuth redirect, invalidate journal queries once so shelf/spread
 * show the new user's data without a manual refresh (matches credentials login flow).
 *
 * ── WALKTHROUGH: post-OAuth cache sync + welcome toast ──
 *  GoogleSignInButton sets OAUTH_PENDING_KEY (+ OAUTH_VARIANT_KEY) before redirect;
 *  this effect runs once on dashboard mount, shows welcome/registered toast, then
 *  invalidates `journalSubtree` (same as credentials login).
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  OAUTH_PENDING_KEY,
  OAUTH_VARIANT_KEY,
  type OAuthAuthVariant,
} from "@/constants/auth";
import { appToast } from "@/lib/app-toast";
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";

type OAuthReturnSyncProps = {
  /** SSR session display name — no client session fetch delay */
  displayName: string;
};

function readOAuthVariant(): OAuthAuthVariant {
  if (typeof window === "undefined") return "login";
  const raw = localStorage.getItem(OAUTH_VARIANT_KEY);
  return raw === "register" ? "register" : "login";
}

export function OAuthReturnSync({ displayName }: OAuthReturnSyncProps) {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || typeof window === "undefined") return;
    if (localStorage.getItem(OAUTH_PENDING_KEY) !== "true") return;

    ran.current = true;
    const variant = readOAuthVariant();
    localStorage.removeItem(OAUTH_PENDING_KEY);
    localStorage.removeItem(OAUTH_VARIANT_KEY);

    if (variant === "register") {
      appToast.auth.registered(displayName);
    } else {
      appToast.auth.welcomeBack(displayName);
    }

    void notifyJournalCacheUpdated(queryClient);
  }, [displayName, queryClient]);

  return null;
}
