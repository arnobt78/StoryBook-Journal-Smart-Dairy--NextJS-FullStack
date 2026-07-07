"use client";

/**
 * @file components/journal/RightPageWritePanel.tsx
 *
 * WALKTHROUGH — Right page write-mode panel (edit entry)
 * ─────────────────────────────────────────────────────
 * Mounted only when `RightPage` is in write mode (`isWriting === true`).
 * Unmounting on cancel/save tears down `useVoiceInput` and releases the mic.
 *
 * Voice dictation:
 *   - `useVoiceInput` + `VoiceDictationButton` live here (not in RightPage read mode)
 *   - Final transcript → `editorRef.insertTextAtCursor` → TipTap onChange → autosave
 *
 * Parent: RightPage passes draft + callbacks; no voice hooks in read mode.
 */
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import type { EntryDraft } from "@/types";
import { MOODS, WEATHERS } from "@/constants";
import { mergePendingTag } from "@/lib/journal-tags";
import {
  JOURNAL_DIVIDER_GRADIENT,
  JOURNAL_INK_HEADING,
  JOURNAL_INK_PLACEHOLDER,
  JOURNAL_TAG_INPUT_BG,
  JOURNAL_TAG_INPUT_BORDER,
  JOURNAL_TAG_INPUT_COLOR,
  journalMiniLabelStyle,
} from "@/lib/journal-page-styles";
import { normalizeTags, wordCount } from "@/lib/utils";
import { journalStaggerRowProps } from "@/lib/journal-stagger";
import { JournalEntryTagsEditor } from "@/components/journal/JournalEntryTagsEditor";
import { RippleButton } from "@/components/ui/ripple-button";
import { JournalWriteFooter } from "@/components/journal/JournalWriteFooter";
import type { JournalEditorHandle } from "@/components/editor/JournalEditor";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { VoiceDictationButton } from "@/components/journal/VoiceDictationButton";

const JournalEditor = dynamic(
  () => import("@/components/editor/JournalEditor").then((m) => ({ default: m.JournalEditor })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          flex: 1,
          minHeight: 80,
          fontFamily: "'Lora',serif",
          fontStyle: "italic",
          fontSize: "12px",
          color: JOURNAL_INK_PLACEHOLDER,
          paddingTop: 12,
        }}
      >
        Loading editor…
      </div>
    ),
  },
) as React.ComponentType<
  React.ComponentProps<typeof import("@/components/editor/JournalEditor").JournalEditor> &
    React.RefAttributes<JournalEditorHandle>
>;

export type RightPageWritePanelProps = {
  draft: EntryDraft;
  isSaving: boolean;
  isAiThinking: boolean;
  onDraftChange: (field: keyof EntryDraft, value: string | string[]) => void;
  onSave: (override?: Partial<EntryDraft>) => void;
  onCancel: () => void;
  onAiAssist: () => void;
};

export function RightPageWritePanel({
  draft,
  isSaving,
  isAiThinking,
  onDraftChange,
  onSave,
  onCancel,
  onAiAssist,
}: RightPageWritePanelProps) {
  const [newTag, setNewTag] = useState("");
  const editorRef = useRef<JournalEditorHandle>(null);

  const voice = useVoiceInput({
    onTranscript: (text) => {
      editorRef.current?.insertTextAtCursor(text);
    },
  });

  const draftTags = normalizeTags(draft.tags);
  const wc = wordCount(draft.content);

  const commitPendingTag = useCallback((): string[] => {
    const merged = mergePendingTag(draftTags, newTag);
    if (merged.length !== draftTags.length || merged.some((t, i) => t !== draftTags[i])) {
      onDraftChange("tags", merged);
    }
    setNewTag("");
    return merged;
  }, [draftTags, newTag, onDraftChange]);

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      commitPendingTag();
    }
    if (e.key === "Backspace" && !newTag && draftTags.length) {
      onDraftChange("tags", draftTags.slice(0, -1));
    }
  };

  const handleSave = () => {
    const tags = mergePendingTag(draftTags, newTag);
    if (newTag.trim()) setNewTag("");
    if (tags.length !== draftTags.length) onDraftChange("tags", tags);
    onSave({ tags });
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── WRITE-MODE ROW STAGGER — mirrors RightPage read-mode indices so the
          left + right pages cascade in lockstep (60ms step) on Edit click and
          after a New Page flip (BookSpread bumps `entryStaggerKey` for both).
          Date row is index 0 (rendered by RightPage above this panel). ── */}
      <input
        value={draft.title}
        onChange={(e) => onDraftChange("title", e.target.value)}
        placeholder="Title your entry…"
        {...journalStaggerRowProps(1, {
          style: {
            fontFamily: "'Playfair Display',serif",
            fontStyle: "italic",
            fontSize: "21px",
            color: JOURNAL_INK_HEADING,
            background: "transparent",
            border: "none",
            outline: "none",
            width: "100%",
            lineHeight: 1.2,
            margin: "6px 0 8px",
          },
        })}
      />
      <div
        {...journalStaggerRowProps(1, {
          style: {
            height: "1px",
            background: JOURNAL_DIVIDER_GRADIENT,
            marginBottom: "10px",
            flexShrink: 0,
          },
        })}
      />

      <div {...journalStaggerRowProps(2, { className: "journal-write-pickers" })}>
        <MiniLabel>Mood</MiniLabel>
        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", marginBottom: "6px" }}>
          {MOODS.map((m) => (
            <RippleButton
              key={m}
              type="button"
              onClick={() => onDraftChange("mood", m)}
              style={{
                fontSize: "13px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "4px",
                opacity: draft.mood === m ? 1 : 0.38,
                transform: draft.mood === m ? "scale(1.15)" : "scale(1)",
                transition: "all .15s",
              }}
            >
              {m}
            </RippleButton>
          ))}
        </div>

        <MiniLabel>Weather</MiniLabel>
        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", marginBottom: "8px" }}>
          {WEATHERS.map((w) => (
            <RippleButton
              key={w}
              type="button"
              onClick={() => onDraftChange("weather", w)}
              style={{
                fontSize: "13px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "4px",
                opacity: draft.weather === w ? 1 : 0.38,
                transform: draft.weather === w ? "scale(1.15)" : "scale(1)",
                transition: "all .15s",
              }}
            >
              {w}
            </RippleButton>
          ))}
        </div>
      </div>

      {/* Editor wrapper carries the stagger (index 3) while preserving the flex
          column so long entries still scroll; the editor eases in instead of
          flashing (chunk is preloaded in RightPage read mode). */}
      <div
        {...journalStaggerRowProps(3, {
          style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
        })}
      >
        <JournalEditor
          ref={editorRef}
          content={draft.content}
          onChange={(html) => onDraftChange("content", html)}
          placeholder="Write what's on your mind today…"
          autoFocus
        />
      </div>

      {/* AI "Writing…" status now renders as the animated banner in
          JournalWriteFooter (voice-parity pulse UI) — no inline text here. */}
      <div {...journalStaggerRowProps(4, { style: journalMiniLabelStyle })}>Tags</div>
      <div
        {...journalStaggerRowProps(4, {
          style: {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "4px",
            marginBottom: "8px",
            flexShrink: 0,
          },
        })}
      >
        <JournalEntryTagsEditor
          tags={draftTags}
          onRemove={(tag) =>
            onDraftChange(
              "tags",
              draftTags.filter((t) => t !== tag),
            )
          }
        />
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleTagKey}
          onBlur={commitPendingTag}
          placeholder="+ tag"
          style={{
            fontFamily: "'Lora',serif",
            fontSize: "10px",
            background: JOURNAL_TAG_INPUT_BG,
            border: `1px solid ${JOURNAL_TAG_INPUT_BORDER}`,
            borderRadius: "20px",
            padding: "2px 9px",
            outline: "none",
            color: JOURNAL_TAG_INPUT_COLOR,
            width: "70px",
          }}
        />
      </div>

      {/* Bottom row (mood/weather/words + Dictate/AI/Cancel/Save) rides the
          cascade as the final stagger step (index 5) — no post-flip button flash. */}
      <div {...journalStaggerRowProps(5, { style: { flexShrink: 0 } })}>
        <JournalWriteFooter
          mood={draft.mood}
          weather={draft.weather}
          wordCount={wc}
          isAiThinking={isAiThinking}
          isSaving={isSaving}
          canAiAssist={Boolean(draft.content.trim())}
          onAiAssist={onAiAssist}
          onCancel={onCancel}
          onSave={handleSave}
          voiceInterim={voice.interim}
          voiceIsDraining={voice.isVoiceDraining}
          voiceError={voice.error}
          voiceStatus={voice.status}
          voiceDictation={<VoiceDictationButton voice={voice} />}
        />
      </div>
    </div>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return <div style={journalMiniLabelStyle}>{children}</div>;
}
