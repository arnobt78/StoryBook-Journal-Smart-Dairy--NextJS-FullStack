"use client";

/**
 * Bottom navigation pill below the open journal spread — shelf shortcut, page
 * controls, and journal CRUD actions. Hover glow + Radix tooltips on icon controls.
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
  const navBusy = isFlipping || isWriting;
  const bookBusy = navBusy || isSavingBook || isDeleting;

  return (
    <div className="journal-bottom-nav leather-glass-nav-pill cta-splash-glow">
      <NavTooltip label="Back to shelf">
        <span className={C.navShelfSlot}>
          <span aria-hidden className={C.navShelfSpotlight} />
          <RippleButton
            type="button"
            onClick={onBackToShelf}
            className={`${C.navIcon} journal-nav-icon-btn--shelf`}
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

      <NavTooltip label="Previous page">
        <RippleButton
          type="button"
          onClick={onPrev}
          disabled={currentIdx === 0 || navBusy}
          className={C.navIcon}
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
          className={C.navIcon}
        >
          <ChevronRight size={18} strokeWidth={2} aria-hidden />
        </RippleButton>
      </NavTooltip>

      <div className="journal-nav-divider" aria-hidden />

      <div className="journal-nav-actions">
        <RippleButton
          type="button"
          icon={FilePlus}
          iconSize={14}
          onClick={onNewEntry}
          disabled={navBusy}
          className={`${C.navPill} journal-nav-pill-btn--new`}
          style={{ fontSize: "9.5px", letterSpacing: "2px", padding: "5px 15px" }}
        >
          New Entry
        </RippleButton>

        <div className="journal-nav-divider" aria-hidden />

        <RippleButton
          type="button"
          icon={Pencil}
          iconSize={13}
          onClick={onEditJournal}
          disabled={bookBusy}
          className={C.navPill}
          style={{ fontSize: "9px", padding: "5px 12px" }}
        >
          Edit journal
        </RippleButton>

        <RippleButton
          type="button"
          icon={Trash2}
          iconSize={13}
          onClick={onRemoveJournal}
          disabled={bookBusy}
          className={`${C.navPill} ${C.navPillDestructive}`}
          style={{ fontSize: "9px", padding: "5px 12px" }}
        >
          Remove journal
        </RippleButton>
      </div>
    </div>
  );
}

function NavTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
