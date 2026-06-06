import { describe, it, expect } from "vitest";
import { searchQuerySchema } from "@/lib/search";

describe("searchQuerySchema", () => {
  it("parses minimal query", () => {
    const r = searchQuerySchema.safeParse({ q: "morning" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(20);
  });

  it("rejects empty q", () => {
    expect(searchQuerySchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("accepts optional mood and coerced limit", () => {
    const r = searchQuerySchema.safeParse({
      q: "tea",
      mood: "☕",
      limit: "5",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(5);
  });
});
