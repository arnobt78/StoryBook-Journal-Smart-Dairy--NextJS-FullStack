"use client";

/**
 * Read-mode footer — mood, weather, word count, page remove, edit.
 * Wave 36: same meta rhythm as write footer; icon-only delete/edit on mobile
 * via `.auth-responsive-label--full/short`; md+ shows icon + label (`.journal-md-icon-label`).
 */
import { AlignLeft, PencilLine, Trash2 } from "lucide-react";
import type { JournalEntry } from "@/types";
import { READ_REMOVE_LABEL_FULL } from "@/lib/journal-responsive-labels";
import { JOURNAL_INTERACTION_CLASS as C } from "@/lib/journal-interaction-styles";
import { RippleButton } from "@/components/ui/ripple-button";

type JournalReadFooterProps = {
  entry: JournalEntry;
  onStartWriting: () => void;
  onDeleteEntry?: () => void;
  canDeleteEntry?: boolean;
};

export function JournalReadFooter({
  entry,
  onStartWriting,
  onDeleteEntry,
  canDeleteEntry = true,
}: JournalReadFooterProps) {
  return (
    <div className="journal-read-footer">
      <div className="journal-page-footer__meta journal-read-footer__meta">
        <span className="journal-page-footer__emoji journal-read-footer__emoji">
          {entry.mood}
        </span>
        <span className="journal-page-footer__emoji journal-read-footer__emoji">
          {entry.weather}
        </span>
        <span className="journal-page-footer__words journal-read-footer__words">
          <AlignLeft size={13} strokeWidth={2} aria-hidden />
          {entry.wordCount} words
        </span>
      </div>

      <div className="journal-read-footer__actions">
        {onDeleteEntry && canDeleteEntry && (
          <RippleButton
            type="button"
            onClick={onDeleteEntry}
            aria-label="Remove page"
            className={`${C.paperAction} ${C.paperActionDestructive} journal-read-footer__btn`}
          >
            <span className="journal-md-icon-label auth-responsive-label--full">
              <Trash2 size={13} strokeWidth={2} aria-hidden />
              {READ_REMOVE_LABEL_FULL}
            </span>
            <span className="auth-responsive-label--short" aria-hidden>
              <Trash2 size={18} strokeWidth={2} />
            </span>
          </RippleButton>
        )}
        <RippleButton
          type="button"
          onClick={onStartWriting}
          aria-label="Edit"
          className={`${C.paperAction} journal-read-footer__btn`}
        >
          <span className="journal-md-icon-label auth-responsive-label--full">
            <PencilLine size={13} strokeWidth={2} aria-hidden />
            Edit
          </span>
          <span className="auth-responsive-label--short" aria-hidden>
            <PencilLine size={18} strokeWidth={2} />
          </span>
        </RippleButton>
      </div>
    </div>
  );
}
