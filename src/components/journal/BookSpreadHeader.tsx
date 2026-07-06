/**
 * @file components/journal/BookSpreadHeader.tsx
 *
 * WALKTHROUGH — Golden branding row above open journal spread
 * ───────────────────────────────────────────────────────────
 * Icon + Dancing Script title + truncated description. Stagger indices 0–2
 * mirror AuthBookShell. Mobile: fixed z45 band; tooltip shows full meta.
 */
"use client";

/**
 * Golden branding row above the open journal spread — mirrors auth "StoryBook · …"
 * layout with cover icon, title, and truncated description. Full meta on hover via Tooltip.
 *
 * Row stagger: icon (0) · title (1) · separator (1) · description (2) — mirrors
 * AuthBookShell's "StoryBook · phrase" indices so this header cascades in lockstep
 * with LeftPage/RightPage on every mount (see journal-stagger.ts).
 *
 * Wave 35 mobile: icon + truncated title + · + truncated desc on one inline row
 * (see `.book-spread-header-wrap` in globals.css).
 * Wave 38 mobile journal: fixed positioning + z45 in CSS so spotlight bleeds through
 * transparent nav — no component logic; journal-route-viewport rules only.
 * Wave 39: vertically centered in chrome band between nav and book top edge.
 */
import { CoverIcon } from "@/components/journal/CoverIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BOOK_BRAND_DESC_INLINE_STYLE,
  BOOK_BRAND_GOLD_TEXT_STYLE,
  BOOK_BRAND_SEPARATOR_STYLE,
  bookMetaNeedsTooltip,
  truncateBookMeta,
} from "@/lib/book-brand-styles";
import { journalStaggerRowProps } from "@/lib/journal-stagger";

type BookSpreadHeaderProps = {
  coverEmoji: string;
  title: string;
  description?: string | null;
};

const DESC_MAX_LEN = 48;

export function BookSpreadHeader({
  coverEmoji,
  title,
  description,
}: BookSpreadHeaderProps) {
  const trimmedTitle = title.trim();
  const trimmedDesc = (description ?? "").trim();
  const displayDesc = truncateBookMeta(trimmedDesc, DESC_MAX_LEN);
  const showTooltip = bookMetaNeedsTooltip(trimmedTitle, trimmedDesc, DESC_MAX_LEN);

  const headerRow = (
    <div className="book-spread-header-row">
      <div className="book-spread-header-title-row">
        <span
          {...journalStaggerRowProps(0, { className: "book-spread-header-icon" })}
        >
          <CoverIcon id={coverEmoji} size={18} />
        </span>
        <span
          {...journalStaggerRowProps(1, {
            className: "book-spread-header-title",
            style: BOOK_BRAND_GOLD_TEXT_STYLE,
          })}
        >
          {trimmedTitle}
        </span>
      </div>
      {displayDesc ? (
        <>
          <span
            {...journalStaggerRowProps(1, {
              className: "book-spread-header-sep",
              style: BOOK_BRAND_SEPARATOR_STYLE,
            })}
            aria-hidden
          >
            ·
          </span>
          <span
            {...journalStaggerRowProps(2, {
              className: "book-spread-header-desc",
              style: BOOK_BRAND_DESC_INLINE_STYLE,
            })}
          >
            {displayDesc}
          </span>
        </>
      ) : null}
    </div>
  );

  return (
    <div className="book-spread-header-wrap">
      <div aria-hidden className="book-spread-header-spotlight" />
      {showTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              aria-label={`${trimmedTitle}${trimmedDesc ? `: ${trimmedDesc}` : ""}`}
            >
              {headerRow}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="journal-tooltip-title">{trimmedTitle}</div>
            {trimmedDesc ? (
              <div className="journal-tooltip-desc">{trimmedDesc}</div>
            ) : null}
          </TooltipContent>
        </Tooltip>
      ) : (
        headerRow
      )}
    </div>
  );
}
