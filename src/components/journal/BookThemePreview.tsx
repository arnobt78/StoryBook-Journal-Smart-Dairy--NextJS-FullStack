"use client";

/**
 * Live preview of selected page theme — mini spread using BOOK_THEMES tokens.
 */
import { getBookTheme } from "@/constants/themes";

type BookThemePreviewProps = {
  themeId: string;
};

export function BookThemePreview({ themeId }: BookThemePreviewProps) {
  const theme = getBookTheme(themeId);

  return (
    <div className="journal-theme-preview" aria-label={`${theme.label} preview`}>
      <div className="journal-theme-preview-spread">
        <div
          className="journal-theme-preview-page"
          style={{
            background: theme.pageLeft,
            color: theme.ink,
            borderRight: `1px solid ${theme.accent}`,
          }}
        >
          The morning light fell softly across the page…
        </div>
        <div
          className="journal-theme-preview-page"
          style={{
            background: theme.pageRight,
            color: theme.inkMuted,
          }}
        >
          …and every word felt worth keeping.
        </div>
      </div>
    </div>
  );
}
