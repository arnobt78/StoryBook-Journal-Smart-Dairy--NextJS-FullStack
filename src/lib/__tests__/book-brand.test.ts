import { describe, expect, it } from "vitest";
import {
  bookMetaNeedsTooltip,
  truncateBookMeta,
} from "@/lib/book-brand-styles";

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
