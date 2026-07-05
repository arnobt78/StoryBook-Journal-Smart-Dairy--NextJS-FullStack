import { describe, expect, it } from "vitest";
import {
  BOOK_SPREAD_DEFAULT_SPINE_PX,
  BOOK_SPREAD_3D_ROW_CLASS,
  BOOK_SPREAD_SCROLL_INNER_CLASS,
  BOOK_SPREAD_SCROLL_MAX_PX,
  BOOK_SPREAD_WIDTH_CSS,
  spreadWiderThanViewport,
} from "@/lib/book-spread-scroll";
import { AUTH_LEFT_PAGE_CONTENT_PADDING } from "@/lib/journal-page-styles";

describe("book-spread-scroll", () => {
  it("exports scroll breakpoint and width CSS expression", () => {
    expect(BOOK_SPREAD_SCROLL_MAX_PX).toBe(767);
    expect(BOOK_SPREAD_WIDTH_CSS).toContain("--page-w");
    expect(BOOK_SPREAD_WIDTH_CSS).toContain("--spine-w");
    expect(BOOK_SPREAD_SCROLL_INNER_CLASS).toBe("book-spread-scroll-inner");
    expect(BOOK_SPREAD_3D_ROW_CLASS).toBe("book-spread-3d-row");
  });

  it("auth left padding matches journal horizontal inset (Wave 33b)", () => {
    expect(AUTH_LEFT_PAGE_CONTENT_PADDING).toBe("28px 22px 32px 22px");
  });

  it("spreadWiderThanViewport — 375px phone with 240px pages overflows", () => {
    expect(spreadWiderThanViewport(375, 240)).toBe(true);
    expect(375).toBeLessThan(240 * 2 + BOOK_SPREAD_DEFAULT_SPINE_PX);
  });

  it("spreadWiderThanViewport — 768px tablet with 296px pages fits", () => {
    expect(spreadWiderThanViewport(768, 296)).toBe(false);
    expect(768).toBeGreaterThanOrEqual(296 * 2 + BOOK_SPREAD_DEFAULT_SPINE_PX);
  });

  it("spreadWiderThanViewport — custom spine width", () => {
    expect(spreadWiderThanViewport(500, 240, 30)).toBe(true);
    expect(spreadWiderThanViewport(520, 240, 30)).toBe(false);
  });
});
