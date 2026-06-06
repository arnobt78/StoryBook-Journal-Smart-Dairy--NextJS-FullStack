import { describe, it, expect } from "vitest";
import { getNextBookThemeId, getBookThemeLabel } from "@/lib/book-theme-cycle";
import { BOOK_THEMES } from "@/constants/themes";

describe("getNextBookThemeId", () => {
  it("cycles through BOOK_THEMES in order", () => {
    const first = BOOK_THEMES[0]!.id;
    const second = BOOK_THEMES[1]!.id;
    expect(getNextBookThemeId(first)).toBe(second);
  });

  it("wraps from last theme to first", () => {
    const last = BOOK_THEMES[BOOK_THEMES.length - 1]!.id;
    expect(getNextBookThemeId(last)).toBe(BOOK_THEMES[0]!.id);
  });

  it("defaults unknown id to first theme", () => {
    expect(getNextBookThemeId("unknown")).toBe(BOOK_THEMES[0]!.id);
  });
});

describe("getBookThemeLabel", () => {
  it("returns label for known theme", () => {
    expect(getBookThemeLabel("warm-paper")).toBe("Warm Paper");
  });
});
