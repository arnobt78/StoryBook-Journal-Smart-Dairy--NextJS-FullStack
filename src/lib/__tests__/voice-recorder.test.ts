import { describe, expect, it } from "vitest";
import { getPreferredRecorderMimeType } from "@/lib/voice-input";
import { mergeRecorderChunks, transcribeIncrementalSession } from "@/lib/whisper-browser";

describe("voice recorder helpers", () => {
  it("mergeRecorderChunks uses mime type on merged blob", () => {
    const chunks = [new Blob(["a"]), new Blob(["b"])];
    const merged = mergeRecorderChunks(chunks, "audio/webm;codecs=opus");
    expect(merged.type).toBe("audio/webm;codecs=opus");
    expect(merged.size).toBeGreaterThan(0);
  });

  it("mergeRecorderChunks defaults to audio/webm when mime empty", () => {
    const merged = mergeRecorderChunks([new Blob(["x"])], "");
    expect(merged.type).toBe("audio/webm");
  });

  it("getPreferredRecorderMimeType returns a string", () => {
    expect(typeof getPreferredRecorderMimeType()).toBe("string");
  });

  it("transcribeIncrementalSession skips decode when chunks < MIN", async () => {
    const result = await transcribeIncrementalSession(
      [new Blob(["x"], { type: "audio/webm" })],
      "audio/webm",
      0,
      8000,
      false,
    );
    expect(result).toEqual({ text: "", processedSamples: 0 });
  });

  it("transcribeIncrementalSession skips decode when merged bytes < MIN", async () => {
    const result = await transcribeIncrementalSession(
      [new Blob(["a"]), new Blob(["b"])],
      "audio/webm",
      0,
      8000,
      false,
    );
    expect(result.text).toBe("");
    expect(result.processedSamples).toBe(0);
  });
});
