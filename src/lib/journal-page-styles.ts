/**
 * Journal spread ink tokens — read from `--theme-*` CSS vars set by `bookThemeCssVars`
 * on the spread wrapper. Fallbacks preserve warm-paper when vars are absent.
 */
import type { CSSProperties } from "react";

export const JOURNAL_INK_HEADING = "var(--theme-ink-heading, rgba(35,14,3,.88))";

export const JOURNAL_INK_BODY = "var(--theme-ink-body, rgba(100,55,20,.55))";

export const JOURNAL_INK_LABEL = "var(--theme-ink-label, rgba(100,55,20,.45))";

export const JOURNAL_INK_META = "var(--theme-ink-meta, rgba(100,55,20,.55))";

export const JOURNAL_INK_PLACEHOLDER = "var(--theme-ink-placeholder, rgba(100,55,20,.45))";

export const JOURNAL_INK_PREVIEW_TITLE = "var(--theme-ink-preview-title, rgba(45,20,5,.72))";

export const JOURNAL_INK_PREVIEW_BODY = "var(--theme-ink-preview-body, rgba(55,28,8,.55))";

export const JOURNAL_INK_LIST_TITLE = "var(--theme-ink-list-title, rgba(45,20,5,.78))";

export const JOURNAL_INK_TAG = "var(--theme-ink-tag, rgba(110,60,22,.72))";

export const JOURNAL_INK_TAG_BORDER = "var(--theme-ink-tag-border, rgba(120,70,20,.22))";

export const JOURNAL_INK_TAG_BG = "var(--theme-ink-tag-bg, rgba(120,70,20,.09))";

export const JOURNAL_BORDER_SUBTLE = "var(--theme-border-subtle, rgba(120,70,20,.12))";

export const JOURNAL_DIVIDER_GRADIENT = "var(--theme-divider-gradient, linear-gradient(to right,rgba(120,70,20,.25),transparent))";

export const JOURNAL_RULE_LINE = "var(--theme-rule-line, rgba(120,80,30,.1))";

export const JOURNAL_MARGIN_LINE = "var(--theme-margin-line, rgba(220,100,80,.18))";

export const JOURNAL_DOT_ACTIVE = "var(--theme-dot-active, rgba(170,90,30,.75))";

export const JOURNAL_DOT_INACTIVE = "var(--theme-dot-inactive, rgba(120,70,20,.2))";

export const JOURNAL_TAG_INPUT_BG = "var(--theme-tag-input-bg, rgba(120,70,20,.07))";

export const JOURNAL_TAG_INPUT_BORDER = "var(--theme-tag-input-border, rgba(120,70,20,.18))";

export const JOURNAL_TAG_INPUT_COLOR = "var(--theme-tag-input-color, rgba(45,20,5,.75))";

/** Decorative spread ornaments (✦ row, empty-page ✒) — uses theme accent for dark-page parity */
export const JOURNAL_INK_ORNAMENT = "var(--theme-accent, rgba(170,95,35,.55))";

export const JOURNAL_PAGE_INSET_SHADOW_LEFT =
  "var(--theme-page-inset-shadow-left, inset -10px 0 24px rgba(120,70,20,.12), inset 3px 0 8px rgba(200,160,100,.08))";

export const JOURNAL_PAGE_INSET_SHADOW_RIGHT =
  "var(--theme-page-inset-shadow-right, inset 10px 0 24px rgba(120,70,20,.1))";

/** PageFlipOverlay — left seam strip on the turning sheet */
export const JOURNAL_FLIP_SEAM_EDGE =
  "var(--theme-flip-seam-edge, linear-gradient(to right, rgba(90,45,10,.14) 0%, rgba(100,50,10,.06) 40%, transparent 100%))";

export const JOURNAL_PAGE_LEFT_BG =
  "var(--theme-page-left, linear-gradient(to right, #ede1cc 0%, #f4ecda 60%, #ede0c8 100%))";

export const JOURNAL_PAGE_RIGHT_BG =
  "var(--theme-page-right, linear-gradient(to left, #e8dcc9 0%, #f4ecda 60%, #ede0c8 100%))";

/** Ruled-line repeating gradient — shared by LeftPage, RightPage, PageFlipOverlay */
export function journalPageRuledLinesBackground(): string {
  return `repeating-linear-gradient(transparent,transparent 27px,${JOURNAL_RULE_LINE} 27px,${JOURNAL_RULE_LINE} 28px)`;
}

/** Absolute ruled-line layer — mount inside page shell */
export const journalRuledLinesLayerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage: journalPageRuledLinesBackground(),
  backgroundPosition: "0 52px",
  pointerEvents: "none",
  zIndex: 0,
};

/** Left-page margin line — omitted on RightPage and flip back face optional */
export const journalMarginLineLayerStyle: CSSProperties = {
  position: "absolute",
  left: "58px",
  top: 0,
  bottom: 0,
  width: "1px",
  background: JOURNAL_MARGIN_LINE,
  pointerEvents: "none",
  zIndex: 0,
};

/** Shared uppercase section label (LeftPage SectionLabel, RightPage MiniLabel) */
export const journalSectionLabelStyle: CSSProperties = {
  fontFamily: "'Lora', serif",
  fontSize: "8px",
  letterSpacing: "3.5px",
  textTransform: "uppercase",
  color: JOURNAL_INK_LABEL,
};

/** Mini label variant — slightly tighter tracking for write-mode fields */
export const journalMiniLabelStyle: CSSProperties = {
  fontFamily: "'Lora', serif",
  fontSize: "8px",
  letterSpacing: "2.5px",
  textTransform: "uppercase",
  color: JOURNAL_INK_LABEL,
  marginBottom: "3px",
};

/** Page number row (IM Fell English) */
export const journalPageNumberStyle: CSSProperties = {
  fontFamily: "'IM Fell English', serif",
  fontSize: "10px",
  color: JOURNAL_INK_META,
  textAlign: "center",
  padding: "8px 0 3px",
  flexShrink: 0,
};
