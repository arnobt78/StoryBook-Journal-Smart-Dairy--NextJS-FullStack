import { describe, it, expect } from "vitest";
import { createBookSchema } from "@/lib/validations";
import { normalizeTags } from "@/lib/utils";

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

describe("normalizeTags", () => {
  it("parses JSON string from Prisma", () => {
    expect(normalizeTags('["poems","night"]')).toEqual(["poems", "night"]);
  });

  it("passes through string arrays", () => {
    expect(normalizeTags(["welcome"])).toEqual(["welcome"]);
  });
});
