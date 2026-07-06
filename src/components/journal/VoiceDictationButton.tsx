"use client";

/**
 * @file components/journal/VoiceDictationButton.tsx
 *
 * WALKTHROUGH — Voice dictation mic button for journal write mode
 * ───────────────────────────────────────────────────────────────
 * Mic toggle + provider picker in JournalWriteFooter actions row.
 * Uses same footer action classes as Cancel/Save for size parity.
 * Interim/error text renders in JournalWriteFooter full-width banner.
 */
import { ChevronDown, Mic, MicOff } from "lucide-react";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  VOICE_DICTATE_LABEL_FULL,
  VOICE_STOP_LABEL_FULL,
} from "@/lib/journal-responsive-labels";
import { JOURNAL_INTERACTION_CLASS as C } from "@/lib/journal-interaction-styles";
import { getAvailableProviders, VOICE_PROVIDER_LABELS } from "@/lib/voice-input";
import type { SttProvider, UseVoiceInputReturn } from "@/types/voice";

interface VoiceDictationButtonProps {
  voice: UseVoiceInputReturn;
}

export function VoiceDictationButton({ voice }: VoiceDictationButtonProps) {
  const { modelProgress, provider, setProvider, isSupported, toggle, isMicActive } = voice;
  /** Suppress click that follows pointerdown stop — otherwise mic restarts immediately */
  const suppressClickRef = useRef(false);

  if (!isSupported) return null;

  const isRecording = Boolean(isMicActive);
  const isBusy = isRecording || Boolean(voice.isVoiceProcessing);
  const showProgress =
    modelProgress !== null && modelProgress < 100 && provider === "browser-whisper";

  const availableProviders = getAvailableProviders();
  const stopLabel = VOICE_STOP_LABEL_FULL;
  const dictateLabel = VOICE_DICTATE_LABEL_FULL;
  const hasPicker = availableProviders.length > 1;

  const micBtnClass = [
    C.paperAction,
    "journal-write-footer__action-btn",
    hasPicker ? "journal-write-footer__voice-mic" : "",
    isRecording ? "voice-mic-btn--recording" : "",
    showProgress ? "voice-mic-btn--busy" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="voice-dictation-wrap">
      {showProgress ? (
        <div className="voice-progress-bar-wrap">
          <div
            className="voice-progress-bar"
            style={{ width: `${modelProgress}%` }}
            role="progressbar"
            aria-valuenow={modelProgress ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loading voice model"
          />
        </div>
      ) : null}

      <div className={`voice-dictation-cluster${hasPicker ? " voice-dictation-cluster--split" : ""}`}>
        <RippleButton
          type="button"
          onPointerDown={(e) => {
            if (isRecording) {
              e.preventDefault();
              suppressClickRef.current = true;
              toggle();
            }
          }}
          onClick={(e) => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              e.preventDefault();
              return;
            }
            toggle();
          }}
          aria-label={isRecording ? stopLabel : dictateLabel}
          aria-pressed={isRecording}
          className={micBtnClass}
          title={isRecording ? stopLabel : dictateLabel}
        >
          <span className="auth-responsive-label--full journal-md-icon-label">
            {isRecording ? (
              <MicOff size={13} strokeWidth={2} aria-hidden />
            ) : (
              <Mic size={13} strokeWidth={2} aria-hidden />
            )}
            <span className="voice-mic-label">
              {isRecording ? stopLabel : dictateLabel}
            </span>
          </span>
          <span className="auth-responsive-label--short" aria-hidden>
            {isRecording ? (
              <MicOff size={18} strokeWidth={2} />
            ) : (
              <Mic size={18} strokeWidth={2} />
            )}
          </span>
        </RippleButton>

        {hasPicker ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <RippleButton
                type="button"
                className={`${C.paperAction} journal-write-footer__action-btn journal-write-footer__voice-chevron`}
                aria-label="Select voice input provider"
                disabled={isBusy}
              >
                <ChevronDown size={13} strokeWidth={2} aria-hidden />
              </RippleButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="journal-tooltip-content"
              style={{ minWidth: 180 }}
            >
              <div
                style={{
                  padding: "4px 10px 6px",
                  fontFamily: "'Lora', serif",
                  fontSize: 9,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  opacity: 0.55,
                }}
              >
                Voice Provider
              </div>
              <DropdownMenuSeparator />
              {availableProviders.map((p: SttProvider) => (
                <DropdownMenuItem
                  key={p}
                  onSelect={() => setProvider(p)}
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: 11,
                    opacity: p === provider ? 1 : 0.75,
                    fontWeight: p === provider ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {p === provider ? "✓ " : "   "}
                  {VOICE_PROVIDER_LABELS[p]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}
