/**
 * @file components/layout/DashboardClientShell.tsx
 * @route Wraps all `(dashboard)/*` pages after auth gate
 *
 * WALKTHROUGH — Authenticated app chrome
 * ────────────────────────────────────
 * Mounts: OAuthReturnSync (welcome toast), LogoutBookCloseOverlay, DashboardNav,
 * DashboardCommandProvider (⌘K + realtime bridge), TooltipProvider.
 * Layout: nav outside `.dashboard-scroll` so scrollbar doesn't shift avatar (Wave 28).
 * Sign-out: shared `useSignOutWithBookClose` for nav + palette.
 */
"use client";

/**
 * Client shell for authenticated dashboard routes — OAuth sync, sign-out overlay,
 * nav, and command palette share one sign-out hook instance.
 *
 * Layout: `.dashboard-shell` flex column — nav sits **outside** `.dashboard-scroll`
 * so the content scrollbar never shrinks the nav width (profile avatar shift fix).
 */
import { OAuthReturnSync } from "@/components/auth/OAuthReturnSync";
import { DashboardCommandProvider } from "@/components/layout/DashboardCommandProvider";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { LogoutBookCloseOverlay } from "@/components/layout/LogoutBookCloseOverlay";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSignOutWithBookClose } from "@/hooks/useSignOutWithBookClose";
import { resolveLogoutDisplayName } from "@/lib/logout-book-close";

type DashboardClientShellProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: React.ReactNode;
};

export function DashboardClientShell({ user, children }: DashboardClientShellProps) {
  const displayName = resolveLogoutDisplayName(user);
  const { signingOut, handleSignOut } = useSignOutWithBookClose(user);

  return (
    <TooltipProvider delayDuration={200}>
      <OAuthReturnSync displayName={displayName} />
      <LogoutBookCloseOverlay active={signingOut} />
      <div className="dashboard-shell">
        <DashboardNav user={user} signingOut={signingOut} onSignOut={handleSignOut} />
        <div className="dashboard-scroll">
          <DashboardCommandProvider onSignOut={handleSignOut} signingOut={signingOut}>
            <main>{children}</main>
          </DashboardCommandProvider>
        </div>
      </div>
    </TooltipProvider>
  );
}
