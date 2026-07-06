/**
 * @file components/layout/DashboardCommandProvider.tsx
 *
 * WALKTHROUGH — ⌘K palette + SSE bridge mount point
 * ────────────────────────────────────────────────
 * Wraps dashboard children with CommandPalette (global shortcut) and
 * JournalRealtimeBridge (mounts useJournalRealtime once per session).
 */
"use client";

/** Dashboard shell — command palette + realtime SSE bridge; shared sign-out from client shell. */
import { CommandPalette, useCommandPalette } from "@/components/journal/CommandPalette";
import { JournalRealtimeBridge } from "@/components/layout/JournalRealtimeBridge";

type DashboardCommandProviderProps = {
  children: React.ReactNode;
  onSignOut: () => void | Promise<void>;
  signingOut: boolean;
};

export function DashboardCommandProvider({
  children,
  onSignOut,
  signingOut,
}: DashboardCommandProviderProps) {
  const { open, setOpen } = useCommandPalette();

  return (
    <>
      {children}
      <JournalRealtimeBridge />
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onSignOut={onSignOut}
        signingOut={signingOut}
      />
    </>
  );
}
