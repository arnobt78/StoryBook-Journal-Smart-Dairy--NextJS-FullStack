/**
 * Maps `BOOK_THEMES` tokens to CSS custom properties on the journal spread wrapper.
 * Shared by `useBookTheme` (live reader) and `BookThemePreview` (editor dialog).
 */
import type { CSSProperties } from "react";
import { getBookTheme, type BookThemeId } from "@/constants/themes";

export type BookThemeCssProps = {
  "data-book-theme": BookThemeId;
  style: CSSProperties;
};

/** Pure helper — SSR-safe; no hooks */
export function bookThemeCssVars(themeId: string): BookThemeCssProps {
  const theme = getBookTheme(themeId);

  return {
    "data-book-theme": theme.id,
    style: {
      ["--theme-page-left" as string]: theme.pageLeft,
      ["--theme-page-right" as string]: theme.pageRight,
      ["--theme-ink" as string]: theme.ink,
      ["--theme-ink-muted" as string]: theme.inkMuted,
      ["--theme-accent" as string]: theme.accent,
      ["--theme-ink-heading" as string]: theme.inkHeading,
      ["--theme-ink-body" as string]: theme.inkBody,
      ["--theme-ink-label" as string]: theme.inkLabel,
      ["--theme-ink-meta" as string]: theme.inkMeta,
      ["--theme-ink-placeholder" as string]: theme.inkPlaceholder,
      ["--theme-ink-preview-title" as string]: theme.inkPreviewTitle,
      ["--theme-ink-preview-body" as string]: theme.inkPreviewBody,
      ["--theme-ink-list-title" as string]: theme.inkListTitle,
      ["--theme-ink-tag" as string]: theme.inkTag,
      ["--theme-ink-tag-bg" as string]: theme.inkTagBg,
      ["--theme-ink-tag-border" as string]: theme.inkTagBorder,
      ["--theme-rule-line" as string]: theme.ruleLine,
      ["--theme-margin-line" as string]: theme.marginLine,
      ["--theme-border-subtle" as string]: theme.borderSubtle,
      ["--theme-divider-gradient" as string]: theme.dividerGradient,
      ["--theme-dot-active" as string]: theme.dotActive,
      ["--theme-dot-inactive" as string]: theme.dotInactive,
      ["--theme-paper-action-color" as string]: theme.paperActionColor,
      ["--theme-paper-action-border" as string]: theme.paperActionBorder,
      ["--theme-paper-action-hover" as string]: theme.paperActionHover,
      ["--theme-paper-action-destructive-color" as string]: theme.paperActionDestructiveColor,
      ["--theme-paper-action-destructive-border" as string]: theme.paperActionDestructiveBorder,
      ["--theme-paper-action-destructive-hover" as string]: theme.paperActionDestructiveHover,
      ["--theme-tag-input-bg" as string]: theme.tagInputBg,
      ["--theme-tag-input-border" as string]: theme.tagInputBorder,
      ["--theme-tag-input-color" as string]: theme.tagInputColor,
      ["--theme-page-inset-shadow-left" as string]: theme.pageInsetShadowLeft,
      ["--theme-page-inset-shadow-right" as string]: theme.pageInsetShadowRight,
      ["--theme-prose-blockquote-border" as string]: theme.proseBlockquoteBorder,
      ["--theme-prose-placeholder" as string]: theme.prosePlaceholder,
      ["--theme-prose-code-bg" as string]: theme.proseCodeBg,
      ["--theme-prose-pre-bg" as string]: theme.prosePreBg,
      ["--theme-flip-seam-edge" as string]: theme.flipSeamEdge,
      ["--theme-flip-shadow-rest" as string]: theme.flipShadowRest,
      ["--theme-flip-shadow-mid" as string]: theme.flipShadowMid,
      /* ProseMirror reads :root --ink-*; alias here so editor inherits spread theme */
      ["--ink-primary" as string]: theme.ink,
      ["--ink-secondary" as string]: theme.inkMuted,
    } as CSSProperties,
  };
}
