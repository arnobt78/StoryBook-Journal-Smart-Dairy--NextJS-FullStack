"use client";

/**
 * Live preview of selected page theme — mini spread using shared `bookThemeCssVars`.
 */
import { bookThemeCssVars } from "@/lib/book-theme-vars";
import { getBookTheme } from "@/constants/themes";

type BookThemePreviewProps = {
  themeId: string;
};

export function BookThemePreview({ themeId }: BookThemePreviewProps) {
  const theme = getBookTheme(themeId);
  const themeProps = bookThemeCssVars(themeId);

  return (
    <div
      className="journal-theme-preview"
      aria-label={`${theme.label} preview`}
      data-book-theme={themeProps["data-book-theme"]}
      style={themeProps.style}
    >
      <div className="journal-theme-preview-spread">
        <div
          className="journal-theme-preview-page journal-theme-preview-page--left"
          style={{
            background: "var(--theme-page-left)",
            borderRight: "1px solid var(--theme-accent)",
          }}
        >
          The morning light fell softly across the page…
        </div>
        <div
          className="journal-theme-preview-page journal-theme-preview-page--right"
          style={{ background: "var(--theme-page-right)" }}
        >
          …and every word felt worth keeping.
        </div>
      </div>
    </div>
  );
}
