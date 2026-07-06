import { describe, expect, it } from "vitest";
import { mergeTranscriptDelta } from "@/lib/voice-transcript-merge";

describe("mergeTranscriptDelta", () => {
  it("returns full text when no previous tail", () => {
    expect(mergeTranscriptDelta("", "hello world")).toBe("hello world");
  });

  it("returns empty when new text already at tail", () => {
    expect(mergeTranscriptDelta("how are you", "how are you")).toBe("");
  });

  it("trims overlapping prefix", () => {
    expect(mergeTranscriptDelta("how are you", "you doing")).toBe("doing");
  });

  it("returns empty for whitespace-only new text", () => {
    expect(mergeTranscriptDelta("hi", "   ")).toBe("");
  });
});
