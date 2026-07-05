"use client";

/**
 * Bottom navigation pill below the open journal spread — shelf shortcut, page
 * controls, and journal CRUD actions. Hover glow on icons; tooltips on icon-only
 * controls (md+ labeled pills skip tooltip — labels already visible).
 */
import type { ReactNode } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMinMd } from "@/hooks/useMinMd";
import { DASHBOARD_SHELL_PAD_CLASS } from "@/lib/dashboard-styles";
import { JOURNAL_INTERACTION_CLASS as C } from "@/lib/journal-interaction-styles";

export type JournalBottomNavProps = {
  currentIdx: number;
  entryCount: number;
  isFlipping: boolean;
  isWriting: boolean;
  isSavingBook: boolean;
  isDeleting: boolean;
  onBackToShelf: () => void;
  onPrev: () => void;
  onNext: () => void;
  onNewEntry: () => void;
  onEditJournal: () => void;
  onRemoveJournal: () => void;
};

export function JournalBottomNav({
  currentIdx,
  entryCount,
  isFlipping,
  isWriting,
  isSavingBook,
  isDeleting,
  onBackToShelf,
  onPrev,
  onNext,
  onNewEntry,
  onEditJournal,
  onRemoveJournal,
}: JournalBottomNavProps) {
  const isMd = useMinMd();
  const navBusy = isFlipping || isWriting;
  const bookBusy = navBusy || isSavingBook || isDeleting;

  return (
    <div className={`journal-bottom-nav-outer ${DASHBOARD_SHELL_PAD_CLASS}`}>
      <div className="journal-bottom-nav leather-glass-nav-pill cta-splash-glow">
        <NavTooltip label="Back to shelf">
          <span className={C.navShelfSlot}>
            <span aria-hidden className={C.navShelfSpotlight} />
            <RippleButton
              type="button"
              onClick={onBackToShelf}
              className={`${C.navIcon} journal-nav-icon-btn--shelf journal-nav-touch-btn`}
            >
              <Image
                src="/book-stack-2.svg"
                alt=""
                width={24}
                height={24}
                unoptimized
                className="journal-nav-shelf-icon pointer-events-none"
              />
            </RippleButton>
          </span>
        </NavTooltip>

        <div className="journal-nav-divider" aria-hidden />

        <div className="journal-nav-page-controls">
          <NavTooltip label="Previous page">
            <RippleButton
              type="button"
              onClick={onPrev}
              disabled={currentIdx === 0 || navBusy}
              className={`${C.navIcon} journal-nav-touch-btn journal-nav-page-btn`}
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden />
            </RippleButton>
          </NavTooltip>

          <span className="journal-nav-page-count">
            {currentIdx + 1} of {entryCount}
          </span>

          <NavTooltip label="Next page">
            <RippleButton
              type="button"
              onClick={onNext}
              disabled={currentIdx === entryCount - 1 || navBusy}
              className={`${C.navIcon} journal-nav-touch-btn journal-nav-page-btn`}
            >
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </RippleButton>
          </NavTooltip>
        </div>

        <div className="journal-nav-divider journal-nav-divider--actions" aria-hidden />

        <div className="journal-nav-actions">
          <NavTooltip label="New entry" enabled={!isMd}>
            <RippleButton
              type="button"
              icon={FilePlus}
              iconSize={16}
              onClick={onNewEntry}
              disabled={navBusy}
              aria-label="New entry"
              className={`${C.navPill} journal-nav-pill-btn--new journal-nav-action-btn journal-nav-touch-btn`}
            >
              <span className="journal-nav-pill-text">New Entry</span>
            </RippleButton>
          </NavTooltip>

          <div className="journal-nav-divider journal-nav-divider--between-actions" aria-hidden />

          <NavTooltip label="Edit journal" enabled={!isMd}>
            <RippleButton
              type="button"
              icon={Pencil}
              iconSize={16}
              onClick={onEditJournal}
              disabled={bookBusy}
              aria-label="Edit journal"
              className={`${C.navPill} journal-nav-action-btn journal-nav-touch-btn`}
            >
              <span className="journal-nav-pill-text">Edit journal</span>
            </RippleButton>
          </NavTooltip>

          <NavTooltip label="Remove journal" enabled={!isMd}>
            <RippleButton
              type="button"
              icon={Trash2}
              iconSize={16}
              onClick={onRemoveJournal}
              disabled={bookBusy}
              aria-label="Remove journal"
              className={`${C.navPill} ${C.navPillDestructive} journal-nav-action-btn journal-nav-touch-btn`}
            >
              <span className="journal-nav-pill-text">Remove journal</span>
            </RippleButton>
          </NavTooltip>
        </div>
      </div>
    </div>
  );
}

function NavTooltip({
  label,
  children,
  enabled = true,
}: {
  label: string;
  children: ReactNode;
  enabled?: boolean;
}) {
  if (!enabled) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
