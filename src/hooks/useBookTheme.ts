"use client";

/**
 * Applies book theme tokens as CSS variables on the spread wrapper.
 */
import { useMemo } from "react";
import { bookThemeCssVars } from "@/lib/book-theme-vars";

export function useBookTheme(themeId: string) {
  return useMemo(() => bookThemeCssVars(themeId), [themeId]);
}
