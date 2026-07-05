"use client";

/**
 * RightPage — the journal entry view/edit panel.
 *
 * READ mode:  Renders HTML content via dangerouslySetInnerHTML (TipTap output).
 *             Row entrance wave replays after every flip (see ROW STAGGER below).
 * WRITE mode: Textarea-based editor with mood/weather pickers, tag input,
 *             word count, AI Assist button.
 *
 * Sizing: driven by CSS custom properties --page-w / --page-h so the entire
 * book scales responsively from the root :root rule in globals.css.
 *
 * ── ANTI-FLASH (mirrors AuthBookShell's contentReady technique) ──
 *  `PageFlipOverlay` only covers this page's face while rotating; `isFlipping` also
 *  hides this content-stack via `visibility` (never `display`, so no layout shift) for
 *  the whole 650ms+80ms flip — same gate as auth's `contentReady`. Only the static
 *  paper shell (ruled lines, margin, seam curl) stays visible underneath, so no stale
 *  text is ever revealed mid-turn. `BookSpread` remounts this component
 *  (`key={entryStaggerKey}` on BookSpread's Fragment wrapper) once per flip so read-mode rows replay their
 *  `journalStaggerRowProps` entrance wave the instant the flip reveals them — in sync
 *  with `LeftPage`, which remounts on the same key. Write mode is controlled here;
 *  autosave/offline persistence live in BookSpread.
 *
 * ── ROW STAGGER (mount + every flip) ──
 *  Date/weekday row is index 0 (always rendered above read/write). Read-mode rows
 *  continue: title(1), body(2), tags(3, only when present), footer(4). This local
 *  counter runs in lockstep with BookSpreadHeader (0..2, mount-only) and LeftPage
 *  (0..5+) — both restart at 0 and share the same 60ms step, so left/right cascade
 *  together on initial mount AND after every page turn (remount key), matching the
 *  auth login/register effect exactly.
 */
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { JournalEntry, EntryDraft } from "@/types";
import { MOODS, WEATHERS } from "@/constants";
import { mergePendingTag } from "@/lib/journal-tags";
import {
  JOURNAL_DIVIDER_GRADIENT,
  JOURNAL_INK_BODY,
  JOURNAL_INK_HEADING,
  JOURNAL_INK_META,
  JOURNAL_INK_ORNAMENT,
  JOURNAL_INK_PLACEHOLDER,
  JOURNAL_PAGE_INSET_SHADOW_RIGHT,
  JOURNAL_PAGE_RIGHT_BG,
  JOURNAL_TAG_INPUT_BG,
  JOURNAL_TAG_INPUT_BORDER,
  JOURNAL_TAG_INPUT_COLOR,
  journalMiniLabelStyle,
  journalPageNumberStyle,
  journalRuledLinesLayerStyle,
} from "@/lib/journal-page-styles";
import { journalStaggerRowProps } from "@/lib/journal-stagger";
import { normalizeTags, wordCount } from "@/lib/utils";
import { JournalEntryTags } from "@/components/journal/JournalEntryTags";
import { JournalEntryTagsEditor } from "@/components/journal/JournalEntryTagsEditor";
import { RippleButton } from "@/components/ui/ripple-button";
import { JournalReadFooter } from "@/components/journal/JournalReadFooter";
import { JournalWriteFooter } from "@/components/journal/JournalWriteFooter";

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
);

interface RightPageProps {
  entry: JournalEntry;
  pageNumber: number;
  isWriting: boolean;
  draft: EntryDraft;
  isSaving: boolean;
  /** Hides real content via `visibility` for the flip duration — see ANTI-FLASH note above. */
  isFlipping: boolean;
  onStartWriting: () => void;
  onDraftChange: (field: keyof EntryDraft, value: string | string[]) => void;
  /** Optional override merges pending tag input before PATCH (draft state may lag one tick) */
  onSave: (override?: Partial<EntryDraft>) => void;
  onCancel: () => void;
  onAiAssist: () => void;
  isAiThinking: boolean;
  /** Opens confirm flow — destructive DELETE handled in BookSpread */
  onDeleteEntry?: () => void;
  canDeleteEntry?: boolean;
}

export function RightPage({
  entry, pageNumber, isWriting, draft, isSaving,
  isFlipping,
  onStartWriting, onDraftChange, onSave, onCancel, onAiAssist, isAiThinking,
  onDeleteEntry, canDeleteEntry = true,
}: RightPageProps) {
  const [newTag, setNewTag] = useState("");

  const wc = wordCount(draft.content);
  const entryTags = normalizeTags(entry.tags);
  const draftTags = normalizeTags(draft.tags);

  /** Commit "+ tag" field into draft — Enter, blur, or Save */
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
    /* Outer shell ignores pointer hits — same 3-D hit-testing rationale as `LeftPage`. */
    <div
      className="journal-page-face"
      style={{
      width: "var(--page-w, 360px)", height: "var(--page-h, 540px)",
      minWidth: 0,
      position: "relative",
      background: JOURNAL_PAGE_RIGHT_BG,
      borderRadius: "0 4px 4px 0",
      boxShadow: JOURNAL_PAGE_INSET_SHADOW_RIGHT,
      flexShrink: 0, overflow: "hidden",
      pointerEvents: "none",
    }}>
      {/* Ruled lines */}
      <div style={journalRuledLinesLayerStyle} />
      {/* Left curl shadow toward coil seam */}
      <div
        className="spread-seam-curl-right"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      <div style={{
        position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", pointerEvents: "auto",
        /* ANTI-FLASH: hide real content during flip — see file header comment */
        visibility: isFlipping ? "hidden" : "visible",
      }}>
        {/* Page number */}
        <div style={journalPageNumberStyle}>
          — {pageNumber} —
        </div>

        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", padding: "2px 24px 12px",
        }}>
          {/* Date header — always index 0, whether entering read or write mode */}
          <div style={{ flexShrink: 0 }}>
            <div
              {...journalStaggerRowProps(0, {
                style: {
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  fontFamily: "'IM Fell English',serif", fontSize: "11px",
                  color: JOURNAL_INK_META, marginBottom: "2px",
                },
              })}
            >
              <span>{entry.entryDate}</span>
              <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: JOURNAL_INK_META }}>
                {entry.weekday}
              </span>
            </div>
          </div>

          {isWriting ? (
            /* ── WRITE MODE — flex column so editor scrolls; tags/footer stay pinned ── */
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <input
                value={draft.title}
                onChange={e => onDraftChange("title", e.target.value)}
                placeholder="Title your entry…"
                style={{
                  fontFamily: "'Playfair Display',serif", fontStyle: "italic",
                  fontSize: "21px", color: JOURNAL_INK_HEADING,
                  background: "transparent", border: "none", outline: "none",
                  width: "100%", lineHeight: 1.2, margin: "6px 0 8px",
                }}
              />
              <div style={{ height: "1px", background: JOURNAL_DIVIDER_GRADIENT, marginBottom: "10px", flexShrink: 0 }} />

              {/* md+ pickers; mobile uses footer meta — hidden via .journal-write-pickers in globals.css */}
              <div className="journal-write-pickers">
                <MiniLabel>Mood</MiniLabel>
                <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", marginBottom: "6px" }}>
                  {MOODS.map(m => (
                    <RippleButton key={m} type="button" onClick={() => onDraftChange("mood", m)} style={{
                      fontSize: "13px", background: "none", border: "none", cursor: "pointer",
                      padding: "2px", borderRadius: "4px",
                      opacity: draft.mood === m ? 1 : 0.38,
                      transform: draft.mood === m ? "scale(1.15)" : "scale(1)",
                      transition: "all .15s",
                    }}>{m}</RippleButton>
                  ))}
                </div>

                <MiniLabel>Weather</MiniLabel>
                <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {WEATHERS.map(w => (
                    <RippleButton key={w} type="button" onClick={() => onDraftChange("weather", w)} style={{
                      fontSize: "13px", background: "none", border: "none", cursor: "pointer",
                      padding: "2px", borderRadius: "4px",
                      opacity: draft.weather === w ? 1 : 0.38,
                      transform: draft.weather === w ? "scale(1.15)" : "scale(1)",
                      transition: "all .15s",
                    }}>{w}</RippleButton>
                  ))}
                </div>
              </div>

              <JournalEditor
                content={draft.content}
                onChange={(html) => onDraftChange("content", html)}
                placeholder="Write what's on your mind today…"
                autoFocus
              />

              {isAiThinking && (
                <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: "11px", color: JOURNAL_INK_BODY, marginTop: "4px" }}>
                  Writing…
                </div>
              )}

              <MiniLabel>Tags</MiniLabel>
              {/* Editable pills — × removes; "+ tag" adds; Backspace on empty input pops last */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px", marginBottom: "8px", flexShrink: 0 }}>
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
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={handleTagKey}
                  onBlur={commitPendingTag}
                  placeholder="+ tag"
                  style={{
                    fontFamily: "'Lora',serif", fontSize: "10px",
                    background: JOURNAL_TAG_INPUT_BG, border: `1px solid ${JOURNAL_TAG_INPUT_BORDER}`,
                    borderRadius: "20px", padding: "2px 9px", outline: "none",
                    color: JOURNAL_TAG_INPUT_COLOR, width: "70px",
                  }}
                />
              </div>

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
              />
            </div>
          ) : (
            /* ── READ MODE — journal-stagger-row entrance replays on every mount AND every
               flip via BookSpread's Fragment `key={entryStaggerKey}` ── */
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
            }}>
              {/* Title */}
              <div
                {...journalStaggerRowProps(1, {
                  style: {
                    fontFamily: "'Playfair Display',serif", fontStyle: "italic",
                    fontSize: "22px", color: JOURNAL_INK_HEADING, lineHeight: 1.2,
                    margin: "6px 0 8px",
                  },
                })}
              >
                {entry.title}
              </div>

              {/* Divider — shares the title's index so it fades in with it */}
              <div
                {...journalStaggerRowProps(1, {
                  style: { height: "1px", background: JOURNAL_DIVIDER_GRADIENT, marginBottom: "12px", flexShrink: 0 },
                })}
              />

              {/* Body — minHeight:0 lets long entries scroll; tags/footer stay visible */}
              <div
                {...journalStaggerRowProps(2, {
                  style: {
                    fontFamily: "'Lora',serif", fontSize: "13px", lineHeight: 1.92,
                    color: JOURNAL_INK_BODY, flex: 1, minHeight: 0, overflowY: "auto",
                    scrollbarWidth: "none",
                  },
                })}
              >
                {entry.content
                  ? <div className="journal-prose" dangerouslySetInnerHTML={{ __html: entry.content }} />
                  : (
                    <div style={{ textAlign: "center", paddingTop: "28px" }}>
                      <span style={{ fontSize: "28px", display: "block", color: JOURNAL_INK_ORNAMENT, marginBottom: "10px" }}>✒</span>
                      <span style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: "12px", color: JOURNAL_INK_PLACEHOLDER }}>
                        This page awaits your words…
                      </span>
                    </div>
                  )}
              </div>

              {entryTags.length > 0 && (
                <div
                  {...journalStaggerRowProps(3, {
                    className: "journal-entry-tags",
                    style: {
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                      marginTop: "10px",
                      flexShrink: 0,
                    },
                  })}
                >
                  <JournalEntryTags tags={entryTags} />
                </div>
              )}

              <div {...journalStaggerRowProps(4, { style: { flexShrink: 0 } })}>
                <JournalReadFooter
                  entry={entry}
                  onStartWriting={onStartWriting}
                  onDeleteEntry={onDeleteEntry}
                  canDeleteEntry={canDeleteEntry}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={journalMiniLabelStyle}>
      {children}
    </div>
  );
}
