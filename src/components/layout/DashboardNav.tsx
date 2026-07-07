/**
 * @file components/layout/DashboardNav.tsx
 *
 * WALKTHROUGH — Authenticated top navigation bar
 * ─────────────────────────────────────────────
 * Brand, journal pill, profile dropdown (API status/docs links), offline badge.
 * Glass transparent variant on `/journal/*` routes (Wave 37).
 */
"use client";

/**
 * DashboardNav — top bar for authenticated pages.
 *
 * Features:
 *  • Brand mark uses `public/diary-1.svg` (vector, crisp at any DPR).
 *  • Profile uses a Radix-based shadcn dropdown (`modal={false}`) so the menu opens in
 *    a portal without scroll-lock or width reflow — avoids navbar “jump” / layout shift.
 *  • Profile menu rows pair Lucide glyphs (`Activity`, `FileText`, `LogOut`) with labels
 *    for quick visual scanning next to API shortcuts and sign-out.
 *  • Sign-out delegates to `useSignOutWithBookClose` via `onSignOut` from DashboardClientShell.
 *  • Rendered **outside** `.dashboard-scroll` in `DashboardClientShell` — content scrollbar
 *    gutter must not change nav inner width (shelf ↔ journal profile shift fix).
 *  • Wave 38/40 — `.dashboard-nav-glass` on all routes (transparent, no backdrop-filter).
 *
 * ── WALKTHROUGH ──
 *  OFFLINE — `{pendingCount} offline` badge from `OfflineSyncContext`; counts IndexedDB queue.
 *  SafeImage — avatar tries Google URL first; `fallbackSrc` Robohash on error (see safe-image.tsx).
 */
import Image from "next/image";
import Link from "next/link";
import { Activity, FileText, LogOut } from "lucide-react";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarRing } from "@/components/ui/AvatarRing";
import {
  DASHBOARD_BRAND_TEXT_STYLE,
  DASHBOARD_NAV_BRAND_SIZE,
  DASHBOARD_NAV_GLASS_CLASS,
  DASHBOARD_SHELL_PAD_CLASS,
} from "@/lib/dashboard-styles";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { useApiPagesPrefetch } from "@/hooks/useApiPagesPrefetch";
import { resolveLogoutDisplayName } from "@/lib/logout-book-close";

interface DashboardNavProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  signingOut: boolean;
  onSignOut: () => void | Promise<void>;
}

export function DashboardNav({
  user,
  signingOut,
  onSignOut,
}: DashboardNavProps) {
  const { pendingCount } = useOfflineSync();
  const { prefetchApiPages } = useApiPagesPrefetch();
  const avatarSeed = user.email ?? user.name ?? "guest";
  const displayEmail = user.email ?? "—";
  const displayName = resolveLogoutDisplayName(user);

  return (
    <nav
      className={`${DASHBOARD_SHELL_PAD_CLASS} ${DASHBOARD_NAV_GLASS_CLASS}`}
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "transparent",
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      <Link
        href="/dashboard"
        className="dashboard-nav-brand"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span aria-hidden className="dashboard-nav-brand-spotlight" />
        <Image
          src="/diary-1.svg"
          alt=""
          width={24}
          height={24}
          unoptimized
          className="shrink-0 object-contain"
          style={{ width: 24, height: 24, display: "block" }}
          priority
        />
        <span
          style={{
            ...DASHBOARD_BRAND_TEXT_STYLE,
            fontSize: DASHBOARD_NAV_BRAND_SIZE,
            color: "rgba(255,205,130,.92)",
            lineHeight: 1,
          }}
        >
          StoryBook
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {pendingCount > 0 && (
          <span
            title={`${pendingCount} change${pendingCount === 1 ? "" : "s"} waiting to sync`}
            style={{
              fontFamily: "'IM Fell English',serif",
              fontSize: "10px",
              letterSpacing: "1px",
              color: "rgba(255,185,100,.65)",
              background: "rgba(160,85,30,.22)",
              border: "1px solid rgba(160,85,30,.28)",
              padding: "3px 9px",
              borderRadius: "12px",
            }}
          >
            {pendingCount} offline
          </span>
        )}
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => {
            if (open) prefetchApiPages();
          }}
        >
          <DropdownMenuTrigger asChild>
            <RippleButton
              type="button"
              aria-label="Open account menu"
              disabled={signingOut}
              className="dashboard-nav-avatar-glow flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent p-0 outline-none ring-offset-2 ring-offset-transparent transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[rgba(255,205,130,0.45)] disabled:cursor-default disabled:opacity-40"
              style={{ width: 40, height: 40, borderRadius: "50%" }}
            >
              <AvatarRing
                src={user.image}
                seed={avatarSeed}
                size={36}
                alt={user.name ?? "User avatar"}
              />
            </RippleButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="min-w-[15rem]"
          >
            <div className="px-3 pt-2 font-lora text-sm font-medium text-[rgba(255,205,130,0.88)]">
              {displayName}
            </div>
            <div className="px-3 pb-2 font-lora text-xs leading-snug text-paper-light/55">
              {displayEmail}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/api-status"
                className="flex cursor-pointer items-center gap-2 font-lora"
              >
                <Activity
                  className="size-4 shrink-0 text-[rgba(255,205,130,0.72)]"
                  strokeWidth={2}
                  aria-hidden
                />
                API Status
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/api-documentation"
                className="flex cursor-pointer items-center gap-2 font-lora"
              >
                <FileText
                  className="size-4 shrink-0 text-[rgba(255,205,130,0.72)]"
                  strokeWidth={2}
                  aria-hidden
                />
                API Document
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 font-lora text-[rgba(255,200,140,0.92)] focus:bg-white/10"
              disabled={signingOut}
              onSelect={() => {
                void onSignOut();
              }}
            >
              <LogOut
                className="size-4 shrink-0 text-[rgba(255,205,130,0.72)]"
                strokeWidth={2}
                aria-hidden
              />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
