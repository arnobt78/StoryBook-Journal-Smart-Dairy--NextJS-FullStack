/**
 * Journal spread ink tokens — aligned with auth left-page readability
 * (`AUTH_LEFT_BODY_COLOR` in auth-form-styles.ts). Use these instead of
 * ad-hoc faint rgba() in LeftPage, RightPage, footers, and tag pills.
 */
import type { CSSProperties } from "react";
import { AUTH_LEFT_BODY_COLOR } from "@/lib/auth-form-styles";

/** Entry titles — matches auth h2 on cream paper */
export const JOURNAL_INK_HEADING = "rgba(35,14,3,.88)";

/** Body excerpts, word counts, list copy — same as auth marketing body */
export const JOURNAL_INK_BODY = AUTH_LEFT_BODY_COLOR;

/** Section labels (Previous, Journal, All Entries, Mood, Tags) */
export const JOURNAL_INK_LABEL = "rgba(100,55,20,.45)";

/** Dates, page numbers, weekday row, metadata */
export const JOURNAL_INK_META = "rgba(100,55,20,.55)";

/** Empty states, placeholders, editor loading */
export const JOURNAL_INK_PLACEHOLDER = "rgba(100,55,20,.45)";

/** Previous-entry preview title */
export const JOURNAL_INK_PREVIEW_TITLE = "rgba(45,20,5,.72)";

/** Previous-entry excerpt */
export const JOURNAL_INK_PREVIEW_BODY = "rgba(55,28,8,.55)";

/** Entry list title */
export const JOURNAL_INK_LIST_TITLE = "rgba(45,20,5,.78)";

/** Tag pill text */
export const JOURNAL_INK_TAG = "rgba(110,60,22,.72)";

/** Tag pill border */
export const JOURNAL_INK_TAG_BORDER = "rgba(120,70,20,.22)";

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
