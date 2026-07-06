/**
 * @file lib/voice-session-trim.ts
 *
 * Rolling window for Private Whisper sessions — drops oldest recorder blobs
 * when decoded PCM exceeds max duration so long monologues stay responsive.
 */
import { WHISPER_MAX_SESSION_SECONDS, WHISPER_SAMPLE_RATE } from "@/lib/voice-input";

export interface TrimSessionResult {
  chunks: Blob[];
  processedSamples: number;
}

/**
 * When PCM offset exceeds cap, keep the newer half of blobs and reset offset
 * so decode stays bounded. Stop-time flush still processes the retained tail.
 */
export function trimSessionChunksIfNeeded(
  chunks: Blob[],
  processedSamples: number,
  maxSeconds = WHISPER_MAX_SESSION_SECONDS,
  sampleRate = WHISPER_SAMPLE_RATE,
): TrimSessionResult {
  const maxSamples = maxSeconds * sampleRate;
  if (processedSamples <= maxSamples || chunks.length <= 2) {
    return { chunks, processedSamples };
  }

  const keepFrom = Math.floor(chunks.length / 2);
  return {
    chunks: chunks.slice(keepFrom),
    processedSamples: 0,
  };
}
