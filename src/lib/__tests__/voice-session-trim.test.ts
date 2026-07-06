import { describe, expect, it } from "vitest";
import { trimSessionChunksIfNeeded } from "@/lib/voice-session-trim";
import { WHISPER_MAX_SESSION_SECONDS, WHISPER_SAMPLE_RATE } from "@/lib/voice-input";

describe("trimSessionChunksIfNeeded", () => {
  it("returns unchanged when under max duration", () => {
    const chunks = [new Blob(["a"]), new Blob(["b"])];
    const result = trimSessionChunksIfNeeded(chunks, 1000);
    expect(result.chunks).toBe(chunks);
    expect(result.processedSamples).toBe(1000);
  });

  it("trims oldest half when over max samples", () => {
    const chunks = [new Blob(["1"]), new Blob(["2"]), new Blob(["3"]), new Blob(["4"])];
    const maxSamples = WHISPER_MAX_SESSION_SECONDS * WHISPER_SAMPLE_RATE + 1;
    const result = trimSessionChunksIfNeeded(chunks, maxSamples);
    expect(result.chunks).toHaveLength(2);
    expect(result.processedSamples).toBe(0);
  });

  it("keeps at least two chunks when under length threshold", () => {
    const chunks = [new Blob(["a"]), new Blob(["b"])];
    const maxSamples = WHISPER_MAX_SESSION_SECONDS * WHISPER_SAMPLE_RATE + 1;
    const result = trimSessionChunksIfNeeded(chunks, maxSamples);
    expect(result.chunks).toHaveLength(2);
  });
});
