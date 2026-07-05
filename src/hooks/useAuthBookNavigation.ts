"use client";

/**
 * useAuthBookNavigation — login ↔ register flip navigation for AuthBookShell.
 *
 * Early router.push at flip start (prefetched opposite route); hold cover until
 * pathname matches navTarget; stagger remount keys force row animation when
 * contentReady even if RSC updated pathname before flip ended.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FlipDirection } from "@/types";

export type AuthRoute = "/login" | "/register";

/** Stagger remount key — source while hidden, destination when ready (fixes fast-RSC skip). */
export function authStaggerRemountKey(
  contentReady: boolean,
  pathname: string,
  flipSourcePath: string | null,
): string {
  return contentReady ? pathname : (flipSourcePath ?? pathname);
}

/** Branding row key — keep source path during flip (no mid-flip remount); destination when ready. */
export function authBrandStaggerKey(
  contentReady: boolean,
  pathname: string,
  flipSourcePath: string | null,
): string {
  return contentReady ? pathname : (flipSourcePath ?? pathname);
}

export function normalizeAuthPath(p: string): string {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

type TriggerFlip = (
  dir: FlipDirection,
  onComplete?: () => void,
) => void;

export interface UseAuthBookNavigationArgs {
  pathname: string;
  isFlipping: boolean;
  triggerFlip: TriggerFlip;
}

export interface UseAuthBookNavigationReturn {
  goLogin: () => void;
  goRegister: () => void;
  awaitingRoute: boolean;
  contentReady: boolean;
  displayPath: string;
  leftIsRegister: boolean;
  authNavBusy: boolean;
  flipSourcePath: string | null;
  staggerRemountKey: string;
  brandStaggerKey: string;
}

export function useAuthBookNavigation({
  pathname,
  isFlipping,
  triggerFlip,
}: UseAuthBookNavigationArgs): UseAuthBookNavigationReturn {
  const router = useRouter();

  const [navTarget, setNavTarget] = useState<AuthRoute | null>(null);
  const [flipSourcePath, setFlipSourcePath] = useState<string | null>(null);

  /** Warm the opposite auth route so RSC payload is ready when the flip starts. */
  useEffect(() => {
    if (pathname === "/login") router.prefetch("/register");
    if (pathname === "/register") router.prefetch("/login");
  }, [pathname, router]);

  /** Clear nav lock when route settled or user navigated externally (browser back). */
  useEffect(() => {
    if (isFlipping) return;
    if (!navTarget) return;
    if (pathname === navTarget) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- router pathname sync
      setNavTarget(null);
      return;
    }
    if (flipSourcePath && pathname !== flipSourcePath) {
      setNavTarget(null);
      setFlipSourcePath(null);
    }
  }, [pathname, navTarget, flipSourcePath, isFlipping]);

  const goRegister = () => {
    if (pathname === "/register" || isFlipping) return;
    setFlipSourcePath(pathname);
    setNavTarget("/register");
    router.push("/register");
    triggerFlip("fwd", () => {
      /* flipSourcePath kept until contentReady — stagger remount key needs source path */
    });
  };

  const goLogin = () => {
    if (pathname === "/login" || isFlipping) return;
    setFlipSourcePath(pathname);
    setNavTarget("/login");
    router.push("/login");
    triggerFlip("bwd", () => {
      /* flipSourcePath kept until contentReady — stagger remount key needs source path */
    });
  };

  const awaitingRoute = navTarget !== null && pathname !== navTarget;
  const contentReady = !isFlipping && !awaitingRoute;

  /** Drop flip source snapshot after stagger remount key has transitioned to destination */
  useEffect(() => {
    if (contentReady && flipSourcePath) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- post-flip cleanup
      setFlipSourcePath(null);
    }
  }, [contentReady, flipSourcePath]);
  const displayPath =
    isFlipping && flipSourcePath ? flipSourcePath : pathname;
  const leftIsRegister = displayPath === "/register";
  const authNavBusy = isFlipping || awaitingRoute;
  const staggerRemountKey = authStaggerRemountKey(
    contentReady,
    pathname,
    flipSourcePath,
  );
  const brandStaggerKey = authBrandStaggerKey(
    contentReady,
    pathname,
    flipSourcePath,
  );

  return {
    goLogin,
    goRegister,
    awaitingRoute,
    contentReady,
    displayPath,
    leftIsRegister,
    authNavBusy,
    flipSourcePath,
    staggerRemountKey,
    brandStaggerKey,
  };
}
