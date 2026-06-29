import { describe, expect, it } from "vitest";
import {
  DEFAULT_COVER_ICON_ID,
  resolveCoverIconId,
  isAllowedCoverIcon,
} from "@/constants/cover-icons";

describe("resolveCoverIconId", () => {
  it("passes through valid slugs", () => {
    expect(resolveCoverIconId("feather")).toBe("feather");
    expect(resolveCoverIconId("book-open")).toBe("book-open");
  });

  it("maps legacy emoji to slug", () => {
    expect(resolveCoverIconId("📖")).toBe("book-open");
    expect(resolveCoverIconId("✈️")).toBe("plane");
  });

  it("falls back to default for unknown values", () => {
    expect(resolveCoverIconId("not-an-icon")).toBe(DEFAULT_COVER_ICON_ID);
    expect(resolveCoverIconId("")).toBe(DEFAULT_COVER_ICON_ID);
  });
});

describe("isAllowedCoverIcon", () => {
  it("accepts slugs and legacy emoji", () => {
    expect(isAllowedCoverIcon("moon")).toBe(true);
    expect(isAllowedCoverIcon("📖")).toBe(true);
  });

  it("rejects unknown strings", () => {
    expect(isAllowedCoverIcon("random")).toBe(false);
  });
});
