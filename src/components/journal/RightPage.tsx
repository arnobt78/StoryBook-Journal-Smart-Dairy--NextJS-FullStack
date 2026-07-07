"use client";

/**
 * RightPage — the journal entry view/edit panel.
 *
 * READ mode:  Renders HTML content via dangerouslySetInnerHTML (TipTap output).
 *             Row entrance wave replays after every flip (see ROW STAGGER below).
 * WRITE mode: Delegated to `RightPageWritePanel` (mounts only while editing).
 *             Voice dictation hooks live in the write panel — zero read-mode overhead.
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
import { useEffect } from "react";
import type { JournalEntry, EntryDraft } from "@/types";
import {
  JOURNAL_DIVIDER_GRADIENT,
  JOURNAL_INK_BODY,
  JOURNAL_INK_HEADING,
  JOURNAL_INK_META,
  JOURNAL_INK_ORNAMENT,
  JOURNAL_INK_PLACEHOLDER,
  JOURNAL_PAGE_INSET_SHADOW_RIGHT,
  JOURNAL_PAGE_RIGHT_BG,
  journalPageNumberStyle,
  journalRuledLinesLayerStyle,
} from "@/lib/journal-page-styles";
import { journalStaggerRowProps } from "@/lib/journal-stagger";
import { normalizeTags } from "@/lib/utils";
import { JournalEntryTags } from "@/components/journal/JournalEntryTags";
import { JournalReadFooter } from "@/components/journal/JournalReadFooter";
import { RightPageWritePanel } from "@/components/journal/RightPageWritePanel";

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
  const entryTags = normalizeTags(entry.tags);

  /* Warm the lazy TipTap editor chunk while reading so the FIRST "Edit" click
     mounts instantly (no dynamic-import "Loading editor…" flash — the chunk is
     only fetched on first write otherwise). Idempotent: import() is cached. */
  useEffect(() => {
    if (isWriting) return;
    void import("@/components/editor/JournalEditor");
  }, [isWriting]);

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
            <RightPageWritePanel
              draft={draft}
              isSaving={isSaving}
              isAiThinking={isAiThinking}
              onDraftChange={onDraftChange}
              onSave={onSave}
              onCancel={onCancel}
              onAiAssist={onAiAssist}
            />
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
