import { describe, expect, it } from "vitest";
import {
  BOOK_BRAND_DESC_INLINE_STYLE,
  BOOK_BRAND_GOLD_TEXT_STYLE,
  bookMetaNeedsTooltip,
  truncateBookMeta,
} from "@/lib/book-brand-styles";

describe("BOOK_BRAND_DESC_INLINE_STYLE", () => {
  it("uses the same font family as the golden title (auth parity)", () => {
    expect(BOOK_BRAND_DESC_INLINE_STYLE.fontFamily).toBe(
      BOOK_BRAND_GOLD_TEXT_STYLE.fontFamily,
    );
  });
});

describe("truncateBookMeta", () => {
  it("returns empty for null/blank", () => {
    expect(truncateBookMeta(null)).toBe("");
    expect(truncateBookMeta("   ")).toBe("");
  });

  it("returns full string when under max length", () => {
    expect(truncateBookMeta("Short note", 48)).toBe("Short note");
  });

  it("truncates with ellipsis when over max length", () => {
    const long = "A".repeat(60);
    expect(truncateBookMeta(long, 48)).toBe(`${"A".repeat(47)}…`);
  });
});

describe("bookMetaNeedsTooltip", () => {
  it("is false when title and description fit", () => {
    expect(bookMetaNeedsTooltip("Test", "Brief", 48)).toBe(false);
  });

  it("is true when description exceeds max", () => {
    expect(bookMetaNeedsTooltip("Test", "x".repeat(50), 48)).toBe(true);
  });

  it("is true when title exceeds max", () => {
    expect(bookMetaNeedsTooltip("x".repeat(50), "", 48)).toBe(true);
  });
});
