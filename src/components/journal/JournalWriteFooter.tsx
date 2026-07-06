"use client";

/**
 * Write-mode footer — mood/weather meta, word count, AI assist, cancel, save.
 * Wave 35: icon-only on mobile via dual-span labels; md+ icon + label.
 * Voice interim/error banner spans full page width above the footer row.
 */
import { AlignLeft, Check, Mic, Sparkles, X } from "lucide-react";
import { AuthCtaSpinner } from "@/components/auth/AuthCtaSpinner";
import {
  WRITE_AI_LABEL_FULL,
  WRITE_CANCEL_LABEL_FULL,
  WRITE_SAVE_LABEL_FULL,
  WRITE_SAVING_LABEL_FULL,
} from "@/lib/journal-responsive-labels";
import { JOURNAL_INTERACTION_CLASS as C } from "@/lib/journal-interaction-styles";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  VOICE_LISTENING_INTERIM,
  VOICE_PROCESSING_INTERIM,
} from "@/lib/voice-input";
import type { VoiceInputStatus } from "@/types/voice";

function voiceStatusBaseLabel(label: string): string {
  return label.replace(/[.…]+$/, "");
}

function VoiceAnimatedStatus({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  const base = voiceStatusBaseLabel(label);
  return (
    <span className="voice-interim-banner__row" aria-label={label}>
      {icon}
      <span
        className="voice-interim-banner__label voice-interim-banner__label--pulse"
        aria-hidden
      >
        {base}
        <span className="voice-interim-banner__dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </span>
    </span>
  );
}

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
  /** Live preview while dictating — full-width banner above footer */
  voiceInterim?: string;
  /** Post-Stop drain — Processing banner only */
  voiceIsDraining?: boolean;
  /** Error message when voice status === error */
  voiceError?: string | null;
  voiceStatus?: VoiceInputStatus;
  /** Mic + provider picker slot — left of AI Assist */
  voiceDictation?: React.ReactNode;
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
  voiceInterim,
  voiceIsDraining,
  voiceError,
  voiceStatus,
  voiceDictation,
}: JournalWriteFooterProps) {
  const saveFullLabel = isSaving ? WRITE_SAVING_LABEL_FULL : WRITE_SAVE_LABEL_FULL;
  const aiDisabled = isAiThinking || !canAiAssist;
  const showVoiceError = Boolean(voiceError && voiceStatus === "error");
  const showVoiceProcessing = Boolean(voiceIsDraining && !showVoiceError);
  const showVoiceListening = Boolean(
    voiceInterim && !showVoiceError && !showVoiceProcessing,
  );

  return (
    <div className="journal-write-footer-stack">
      {showVoiceError ? (
        <div className="voice-interim-banner voice-interim-banner--error" aria-live="assertive">
          {voiceError}
        </div>
      ) : null}
      {showVoiceProcessing ? (
        <div
          className="voice-interim-banner voice-interim-banner--processing"
          aria-live="polite"
        >
          <VoiceAnimatedStatus
            label={VOICE_PROCESSING_INTERIM}
            icon={<AuthCtaSpinner size={12} />}
          />
        </div>
      ) : null}
      {showVoiceListening ? (
        <div className="voice-interim-banner" aria-live="polite">
          {voiceInterim === VOICE_LISTENING_INTERIM ? (
            <VoiceAnimatedStatus
              label={VOICE_LISTENING_INTERIM}
              icon={
                <Mic
                  size={12}
                  strokeWidth={2}
                  className="voice-interim-banner__icon voice-interim-banner__icon--listen"
                  aria-hidden
                />
              }
            />
          ) : (
            voiceInterim
          )}
        </div>
      ) : null}

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
          {voiceDictation}

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
    </div>
  );
}
