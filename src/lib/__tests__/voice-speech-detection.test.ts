import { describe, expect, it } from "vitest";
import {
  computeRmsFromTimeDomain,
  isSpeechRms,
} from "@/lib/voice-speech-detection";
import { VOICE_SPEECH_RMS_THRESHOLD } from "@/lib/voice-input";

describe("voice speech detection", () => {
  it("computeRmsFromTimeDomain is zero for silent center line", () => {
    const silent = new Uint8Array(128).fill(128);
    expect(computeRmsFromTimeDomain(silent)).toBe(0);
  });

  it("computeRmsFromTimeDomain rises with amplitude", () => {
    const loud = new Uint8Array(128);
    for (let i = 0; i < loud.length; i++) {
      loud[i] = i % 2 === 0 ? 200 : 56;
    }
    const quiet = new Uint8Array(128).fill(130);
    expect(computeRmsFromTimeDomain(loud)).toBeGreaterThan(computeRmsFromTimeDomain(quiet));
  });

  it("isSpeechRms respects threshold", () => {
    expect(isSpeechRms(0.02, VOICE_SPEECH_RMS_THRESHOLD)).toBe(true);
    expect(isSpeechRms(0.001, VOICE_SPEECH_RMS_THRESHOLD)).toBe(false);
  });
});
