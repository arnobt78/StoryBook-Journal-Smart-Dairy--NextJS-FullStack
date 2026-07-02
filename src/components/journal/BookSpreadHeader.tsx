"use client";

/**
 * Golden branding row above the open journal spread — mirrors auth "StoryBook · …"
 * layout with cover icon, title, and truncated description. Full meta on hover via Tooltip.
 */
import { CoverIcon } from "@/components/journal/CoverIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BOOK_BRAND_GOLD_TEXT_STYLE,
  BOOK_BRAND_SEPARATOR_STYLE,
  BOOK_BRAND_SUBTITLE_STYLE,
  bookMetaNeedsTooltip,
  truncateBookMeta,
} from "@/lib/book-brand-styles";

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
      <span className="book-spread-header-icon">
        <CoverIcon id={coverEmoji} size={18} />
      </span>
      <span style={BOOK_BRAND_GOLD_TEXT_STYLE}>{trimmedTitle}</span>
      {displayDesc ? (
        <>
          <span style={BOOK_BRAND_SEPARATOR_STYLE} aria-hidden>
            ·
          </span>
          <span className="book-spread-header-desc" style={BOOK_BRAND_SUBTITLE_STYLE}>
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
