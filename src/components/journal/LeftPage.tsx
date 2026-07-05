"use client";

/**
 * LeftPage — left half of the open book spread.
 *
 * Shows:
 *  • Previous entry preview (title, excerpt, mood/weather/word count).
 *  • Entry list TOC with staggered animation after page flip.
 *  • Clickable entries navigate via the parent onNavigate callback.
 *
 * Sizing: controlled by CSS custom properties --page-w / --page-h.
 *
 * ── WALKTHROUGH: page flip companion (left leaf) ──
 *  This page does NOT run the flip animation — it stays static while `PageFlipOverlay`
 *  (mounted in BookSpread) rotates over the right page. Entry list clicks call
 *  `onNavigate(idx)` which triggers flip-then-focus in the parent.
 *  3D hit-testing: outer shell is `pointerEvents: none`; scrollable inner stack is `auto`.
 *
 * ── ANTI-FLASH (mirrors AuthBookShell's contentReady technique) ──
 *  `PageFlipOverlay` only covers the right page — the left leaf has no overlay of its
 *  own. `isFlipping` hides this content-stack via `visibility` (never `display`, so no
 *  layout shift) for the whole 650ms+80ms flip, same as auth's `contentReady` gate.
 *  Only the static paper shell above (ruled lines, margin, seam curl) stays visible,
 *  so no stale/jumping text is ever painted mid-turn. `BookSpread` also remounts this
 *  (`key={entryStaggerKey}` on BookSpread's Fragment wrapper) once per flip so `journalStaggerRowProps` rows
 *  replay their entrance wave in sync with `RightPage` once the flip reveals it.
 *
 * ── ROW STAGGER (mount only) ──
 *  Preview block rows use `journalStaggerRowProps(0..4)`; "All Entries" label is
 *  index 5; entry list rows continue at `Math.min(6 + i, 16)` (clamped so a long
 *  list doesn't push the wave out for seconds — mirrors the shelf-stagger cap
 *  pattern). This local counter runs in lockstep with BookSpreadHeader (0..2) and
 *  RightPage (0..4) — all three restart at 0 and share the same 60ms step, so
 *  corresponding rows across header/left/right fire together on every mount
 *  (shelf click or hard refresh), matching the auth login/register page effect.
 *  Fires once per BookSpread mount only — entries keep stable `key={e.id}` so
 *  subsequent same-book navigation does not replay this entrance.
 */
import type { JournalEntry } from "@/types";
import {
  JOURNAL_BORDER_SUBTLE,
  JOURNAL_DOT_ACTIVE,
  JOURNAL_DOT_INACTIVE,
  JOURNAL_INK_BODY,
  JOURNAL_INK_LIST_TITLE,
  JOURNAL_INK_META,
  JOURNAL_INK_ORNAMENT,
  JOURNAL_INK_PLACEHOLDER,
  JOURNAL_INK_PREVIEW_BODY,
  JOURNAL_INK_PREVIEW_TITLE,
  JOURNAL_PAGE_INSET_SHADOW_LEFT,
  JOURNAL_PAGE_LEFT_BG,
  journalMarginLineLayerStyle,
  journalPageNumberStyle,
  journalRuledLinesLayerStyle,
  journalSectionLabelStyle,
} from "@/lib/journal-page-styles";
import { journalStaggerRowProps } from "@/lib/journal-stagger";
import { stripHtml } from "@/lib/utils";

/** Entry list rows continue the left-page counter but clamp so long lists don't stretch the wave out. */
const ENTRY_LIST_STAGGER_START = 6;
const ENTRY_LIST_STAGGER_CAP = 16;

interface LeftPageProps {
  currentEntry: JournalEntry;
  prevEntry: JournalEntry | null;
  entries: JournalEntry[];
  currentIdx: number;
  pageNumber: number;
  onNavigate: (idx: number) => void;
  /** Hides real content via `visibility` for the flip duration — see ANTI-FLASH note above. */
  isFlipping: boolean;
}

export function LeftPage({ prevEntry, entries, currentIdx, pageNumber, onNavigate, isFlipping }: LeftPageProps) {
  return (
    /* Outer shell ignores pointer hits (see `BookSpread` comment): 3-D AABB can overlap sibling page. */
    <div
      className="journal-page-face"
      style={{
      width: "var(--page-w, 360px)", height: "var(--page-h, 540px)",
      position: "relative",
      background: JOURNAL_PAGE_LEFT_BG,
      borderRadius: "4px 0 0 4px",
      boxShadow: JOURNAL_PAGE_INSET_SHADOW_LEFT,
      flexShrink: 0, overflow: "hidden",
      pointerEvents: "none",
    }}>
      {/* Ruled lines + margin */}
      <div style={journalRuledLinesLayerStyle} />
      <div style={journalMarginLineLayerStyle} />
      {/* Right curl shadow toward coil seam */}
      <div
        className="spread-seam-curl-left"
        style={{
          position: "absolute",
          right: 0,
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

        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 22px 12px" }}>
          {/* Previous entry preview */}
          {prevEntry ? (
            <div style={{ marginTop: "10px" }}>
              <SectionLabel index={0}>Previous</SectionLabel>
              <div
                {...journalStaggerRowProps(1, {
                  style: { fontFamily: "'IM Fell English', serif", fontSize: "11px", color: JOURNAL_INK_META, marginBottom: "4px" },
                })}
              >
                {prevEntry.entryDate}
              </div>
              <div
                {...journalStaggerRowProps(2, {
                  style: {
                    fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                    fontSize: "17px", color: JOURNAL_INK_PREVIEW_TITLE, lineHeight: 1.25, marginBottom: "8px",
                  },
                })}
              >
                {prevEntry.title}
              </div>
              <div
                {...journalStaggerRowProps(3, {
                  style: {
                    fontFamily: "'Lora', serif", fontStyle: "italic",
                    fontSize: "11.5px", lineHeight: 1.85, color: JOURNAL_INK_PREVIEW_BODY,
                  },
                })}
              >
                {stripHtml(prevEntry.content).slice(0, 180) || "No words written yet."}
                {stripHtml(prevEntry.content).length > 180 ? "…" : ""}
              </div>
              <div
                {...journalStaggerRowProps(4, {
                  style: {
                    display: "flex", alignItems: "center", gap: "6px",
                    marginTop: "10px", paddingTop: "8px",
                    borderTop: `1px solid ${JOURNAL_BORDER_SUBTLE}`,
                  },
                })}
              >
                <span style={{ fontSize: "13px" }}>{prevEntry.mood}</span>
                <span style={{ fontSize: "13px" }}>{prevEntry.weather}</span>
                <span style={{ fontFamily: "'Lora', serif", fontSize: "10px", color: JOURNAL_INK_BODY, marginLeft: "auto" }}>
                  {prevEntry.wordCount} words
                </span>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <SectionLabel index={0}>Journal</SectionLabel>
              <div
                {...journalStaggerRowProps(1, {
                  style: { textAlign: "center", margin: "8px 0" },
                })}
              >
                {/* Nested span — ornament uses theme accent, not fixed opacity (Wave 31 dark-theme parity) */}
                <span style={{ fontSize: "16px", color: JOURNAL_INK_ORNAMENT, letterSpacing: "0.35em" }}>✦ ✦ ✦</span>
              </div>
              <div
                {...journalStaggerRowProps(2, {
                  style: {
                    fontFamily: "'Lora', serif", fontStyle: "italic",
                    fontSize: "12px", color: JOURNAL_INK_BODY, lineHeight: 1.9,
                  },
                })}
              >
                Every great story begins somewhere. This is where yours begins.
              </div>
            </div>
          )}

          {/* ── PAGE FLIP: entry list re-staggers after parent flip completes ── */}
          {/* Entry list — mount-only row stagger continues the left-page counter (index 5+) */}
          <div style={{ marginTop: "20px" }}>
            <SectionLabel index={5}>All Entries</SectionLabel>
            {entries.length === 0 ? (
              <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "11px", color: JOURNAL_INK_PLACEHOLDER }}>
                No entries yet
              </div>
            ) : (
              <div>
                {entries.map((e, i) => (
                  <div
                    key={e.id}
                    onClick={() => onNavigate(i)}
                    {...journalStaggerRowProps(
                      Math.min(ENTRY_LIST_STAGGER_START + i, ENTRY_LIST_STAGGER_CAP),
                      {
                        style: {
                          padding: "7px 0", borderBottom: `1px solid ${JOURNAL_BORDER_SUBTLE}`,
                          cursor: "pointer",
                        },
                      },
                    )}
                  >
                    {/* Dimming for non-current rows lives on this nested wrapper — kept separate from
                        the parent's entrance animation so its final opacity:1 fill doesn't clobber it. */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      opacity: i === currentIdx ? 1 : 0.7,
                      transition: "opacity .15s",
                    }}>
                      <span style={{ fontSize: "12px", flexShrink: 0 }}>{e.mood}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Playfair Display', serif", fontSize: "11px",
                          color: JOURNAL_INK_LIST_TITLE, whiteSpace: "nowrap",
                          overflow: "hidden", textOverflow: "ellipsis",
                        }}>{e.title}</div>
                        <div style={{ fontFamily: "'Lora', serif", fontSize: "9.5px", color: JOURNAL_INK_META }}>
                          {e.entryDate}
                        </div>
                      </div>
                      <div style={{
                        width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                        background: i === currentIdx ? JOURNAL_DOT_ACTIVE : JOURNAL_DOT_INACTIVE,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <div
      {...journalStaggerRowProps(index, {
        style: {
          ...journalSectionLabelStyle,
          display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px",
        },
      })}
    >
      {children}
      <div style={{ flex: 1, height: "1px", background: JOURNAL_BORDER_SUBTLE }} />
    </div>
  );
}
