import { describe, it, expect } from "vitest";
import { createBookSchema } from "@/lib/validations";

describe("createBookSchema", () => {
  it("accepts valid theme enum", () => {
    const r = createBookSchema.safeParse({
      title: "My Journal",
      theme: "dark-academia",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.theme).toBe("dark-academia");
  });

  it("defaults theme to warm-paper", () => {
    const r = createBookSchema.safeParse({ title: "Test" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.theme).toBe("warm-paper");
  });

  it("rejects invalid theme", () => {
    const r = createBookSchema.safeParse({
      title: "X",
      theme: "neon-punk",
    });
    expect(r.success).toBe(false);
  });
});
