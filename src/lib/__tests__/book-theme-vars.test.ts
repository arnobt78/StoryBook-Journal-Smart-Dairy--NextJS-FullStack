import { describe, it, expect } from "vitest";
import { BOOK_THEME_CSS_VAR_KEYS, BOOK_THEMES } from "@/constants/themes";
import { bookThemeCssVars } from "@/lib/book-theme-vars";

/** Parse rgba() alpha channel — crude luminance proxy for contrast tests */
function rgbaAlpha(color: string): number {
  const m = color.match(/rgba?\([^)]+\)/);
  if (!m) return 1;
  const parts = m[0].replace(/rgba?\(|\)/g, "").split(",").map((s) => s.trim());
  return parts.length >= 4 ? parseFloat(parts[3]!) : 1;
}

function rgbaRedChannel(color: string): number {
  const m = color.match(/rgba?\([^)]+\)/);
  if (!m) return 0;
  const parts = m[0].replace(/rgba?\(|\)/g, "").split(",").map((s) => s.trim());
  return parseFloat(parts[0]!);
}

describe("bookThemeCssVars", () => {
  it("emits all required CSS custom properties for every theme", () => {
    for (const theme of BOOK_THEMES) {
      const props = bookThemeCssVars(theme.id);
      expect(props["data-book-theme"]).toBe(theme.id);
      for (const key of BOOK_THEME_CSS_VAR_KEYS) {
        expect(props.style[key as keyof typeof props.style]).toBeDefined();
      }
    }
  });

  it("warm-paper keeps dark ink (regression)", () => {
    const { style } = bookThemeCssVars("warm-paper");
    expect(style["--theme-ink-heading" as keyof typeof style]).toBe("rgba(35,14,3,.88)");
    expect(rgbaRedChannel(String(style["--theme-ink" as keyof typeof style]))).toBeLessThan(80);
  });

  it("dark-academia uses light ink for headings and body", () => {
    const { style } = bookThemeCssVars("dark-academia");
    const heading = String(style["--theme-ink-heading" as keyof typeof style]);
    const body = String(style["--theme-ink-body" as keyof typeof style]);
    expect(rgbaRedChannel(heading)).toBeGreaterThan(150);
    expect(rgbaRedChannel(body)).toBeGreaterThan(120);
    expect(rgbaAlpha(heading)).toBeGreaterThan(0.8);
  });

  it("midnight-journal uses light ink for headings and body", () => {
    const { style } = bookThemeCssVars("midnight-journal");
    const heading = String(style["--theme-ink-heading" as keyof typeof style]);
    expect(rgbaRedChannel(heading)).toBeGreaterThan(180);
  });

  it("aliases ProseMirror --ink-primary to theme ink", () => {
    const theme = BOOK_THEMES.find((t) => t.id === "midnight-journal")!;
    const { style } = bookThemeCssVars("midnight-journal");
    expect(style["--ink-primary" as keyof typeof style]).toBe(theme.ink);
    expect(style["--ink-secondary" as keyof typeof style]).toBe(theme.inkMuted);
  });

  it("defaults unknown theme id to warm-paper tokens", () => {
    const warm = bookThemeCssVars("warm-paper");
    const unknown = bookThemeCssVars("not-a-theme");
    expect(unknown["data-book-theme"]).toBe("warm-paper");
    expect(unknown.style["--theme-ink-heading" as keyof typeof unknown.style]).toBe(
      warm.style["--theme-ink-heading" as keyof typeof warm.style],
    );
  });

  it("emits flip overlay shadow vars per theme", () => {
    const dark = bookThemeCssVars("dark-academia");
    const warm = bookThemeCssVars("warm-paper");
    expect(dark.style["--theme-flip-shadow-rest" as keyof typeof dark.style]).not.toBe(
      warm.style["--theme-flip-shadow-rest" as keyof typeof warm.style],
    );
    expect(String(dark.style["--theme-flip-seam-edge" as keyof typeof dark.style])).toContain(
      "gradient",
    );
  });
});
