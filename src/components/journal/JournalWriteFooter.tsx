"use client";

/**
 * Write-mode footer — mood/weather meta, word count, AI assist, cancel, save.
 * Wave 35: icon-only on mobile via dual-span labels; md+ icon + label.
 * Hover glow on all action buttons matches read-mode paper actions (globals.css).
 */
import { AlignLeft, Check, Sparkles, X } from "lucide-react";
import {
  WRITE_AI_LABEL_FULL,
  WRITE_CANCEL_LABEL_FULL,
  WRITE_SAVE_LABEL_FULL,
  WRITE_SAVING_LABEL_FULL,
} from "@/lib/journal-responsive-labels";
import { JOURNAL_INTERACTION_CLASS as C } from "@/lib/journal-interaction-styles";
import { RippleButton } from "@/components/ui/ripple-button";

type JournalWriteFooterProps = {
  mood: string;
  weather: string;
  wordCount: number;
  isAiThinking: boolean;
  isSaving: boolean;
  canAiAssist: boolean;
  onAiAssist: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export function JournalWriteFooter({
  mood,
  weather,
  wordCount,
  isAiThinking,
  isSaving,
  canAiAssist,
  onAiAssist,
  onCancel,
  onSave,
}: JournalWriteFooterProps) {
  const saveFullLabel = isSaving ? WRITE_SAVING_LABEL_FULL : WRITE_SAVE_LABEL_FULL;
  const aiDisabled = isAiThinking || !canAiAssist;

  return (
    <div className="journal-write-footer">
      <div className="journal-page-footer__meta journal-write-footer__meta">
        {mood ? (
          <span className="journal-page-footer__emoji journal-write-footer__emoji">
            {mood}
          </span>
        ) : null}
        {weather ? (
          <span className="journal-page-footer__emoji journal-write-footer__emoji">
            {weather}
          </span>
        ) : null}
        <span className="journal-page-footer__words journal-write-footer__words">
          <AlignLeft size={13} strokeWidth={2} aria-hidden />
          {wordCount} words
        </span>
      </div>

      <div className="journal-write-footer__actions">
        <RippleButton
          type="button"
          onClick={onAiAssist}
          disabled={aiDisabled}
          aria-label={WRITE_AI_LABEL_FULL}
          className="journal-write-footer__ai-btn"
        >
          <span className="journal-md-icon-label auth-responsive-label--full">
            <Sparkles size={13} strokeWidth={2} aria-hidden />
            {WRITE_AI_LABEL_FULL}
          </span>
          <span className="auth-responsive-label--short" aria-hidden>
            <Sparkles size={18} strokeWidth={2} />
          </span>
        </RippleButton>

        <RippleButton
          type="button"
          onClick={onCancel}
          aria-label={WRITE_CANCEL_LABEL_FULL}
          className={`${C.paperAction} journal-write-footer__action-btn`}
        >
          <span className="journal-md-icon-label auth-responsive-label--full">
            <X size={13} strokeWidth={2} aria-hidden />
            {WRITE_CANCEL_LABEL_FULL}
          </span>
          <span className="auth-responsive-label--short" aria-hidden>
            <X size={18} strokeWidth={2} />
          </span>
        </RippleButton>

        <RippleButton
          type="button"
          onClick={onSave}
          disabled={isSaving}
          aria-label={saveFullLabel}
          shine
          shineRadius={4}
          className="journal-write-footer__save-btn"
        >
          <span className="journal-md-icon-label auth-responsive-label--full">
            <Check size={13} strokeWidth={2} aria-hidden />
            {saveFullLabel}
          </span>
          <span className="auth-responsive-label--short" aria-hidden>
            <Check size={18} strokeWidth={2} />
          </span>
        </RippleButton>
      </div>
    </div>
  );
}
