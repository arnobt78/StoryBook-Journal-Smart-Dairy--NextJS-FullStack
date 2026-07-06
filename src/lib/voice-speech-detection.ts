/**
 * @file lib/voice-speech-detection.ts
 *
 * Lightweight RMS speech monitor for Private mode — skips silent MediaRecorder
 * timeslices without running WASM decode. Uses AnalyserNode polling only.
 */
import {
  VOICE_SPEECH_POLL_MS,
  VOICE_SPEECH_RMS_THRESHOLD,
} from "@/lib/voice-input";

/** RMS from AnalyserNode time-domain bytes (0–255, center 128) */
export function computeRmsFromTimeDomain(data: Uint8Array): number {
  if (data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = (data[i] - 128) / 128;
    sum += normalized * normalized;
  }
  return Math.sqrt(sum / data.length);
}

/** True when RMS meets or exceeds speech threshold */
export function isSpeechRms(rms: number, threshold = VOICE_SPEECH_RMS_THRESHOLD): boolean {
  return rms >= threshold;
}

export interface SpeechMonitor {
  /** Whether speech was detected since last call; resets the interval flag */
  hadSpeechInInterval(): boolean;
  dispose(): void;
}

/** Poll mic stream RMS — call hadSpeechInInterval() on each MediaRecorder timeslice */
export function createSpeechMonitor(
  stream: MediaStream,
  threshold = VOICE_SPEECH_RMS_THRESHOLD,
  pollMs = VOICE_SPEECH_POLL_MS,
): SpeechMonitor {
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  const timeDomain = new Uint8Array(analyser.fftSize);
  let speechInInterval = false;

  const intervalId = window.setInterval(() => {
    analyser.getByteTimeDomainData(timeDomain);
    if (isSpeechRms(computeRmsFromTimeDomain(timeDomain), threshold)) {
      speechInInterval = true;
    }
  }, pollMs);

  return {
    hadSpeechInInterval() {
      const had = speechInInterval;
      speechInInterval = false;
      return had;
    },
    dispose() {
      window.clearInterval(intervalId);
      source.disconnect();
      void audioCtx.close();
    },
  };
}
