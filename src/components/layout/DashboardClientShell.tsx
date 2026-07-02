"use client";

/**
 * Client shell for authenticated dashboard routes — OAuth sync, sign-out overlay,
 * nav, and command palette share one sign-out hook instance.
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
      <DashboardNav user={user} signingOut={signingOut} onSignOut={handleSignOut} />
      <DashboardCommandProvider onSignOut={handleSignOut} signingOut={signingOut}>
        <main>{children}</main>
      </DashboardCommandProvider>
    </TooltipProvider>
  );
}
