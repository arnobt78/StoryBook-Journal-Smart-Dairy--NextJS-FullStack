import { describe, it, expect } from "vitest";
import { createBookSchema, voiceTranscribeSchema } from "@/lib/validations";
import { mergePendingTag } from "@/lib/journal-tags";
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

  it("defaults cover icon to book-open slug", () => {
    const r = createBookSchema.safeParse({ title: "Test" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.coverEmoji).toBe("book-open");
  });

  it("accepts cover icon slug and legacy emoji", () => {
    expect(createBookSchema.safeParse({ title: "A", coverEmoji: "feather" }).success).toBe(
      true,
    );
    expect(createBookSchema.safeParse({ title: "A", coverEmoji: "📖" }).success).toBe(
      true,
    );
  });

  it("rejects invalid cover icon", () => {
    const r = createBookSchema.safeParse({
      title: "X",
      coverEmoji: "invalid-icon",
    });
    expect(r.success).toBe(false);
  });
});

describe("voiceTranscribeSchema", () => {
  it("defaults provider to server-deepgram", () => {
    const r = voiceTranscribeSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.provider).toBe("server-deepgram");
  });

  it("rejects invalid provider", () => {
    const r = voiceTranscribeSchema.safeParse({ provider: "web-speech" });
    expect(r.success).toBe(false);
  });
});

describe("mergePendingTag", () => {
  it("appends uncommitted input on save", () => {
    expect(mergePendingTag([], "poetry")).toEqual(["poetry"]);
  });

  it("skips duplicate pending tag", () => {
    expect(mergePendingTag(["poetry"], "poetry")).toEqual(["poetry"]);
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
