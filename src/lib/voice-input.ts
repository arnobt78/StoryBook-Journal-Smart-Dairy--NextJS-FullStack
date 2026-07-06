/**
 * @file lib/voice-input.ts
 *
 * WALKTHROUGH — Voice input utilities and provider detection
 * ──────────────────────────────────────────────────────────
 * SSR-safe feature detection (all checks guard `typeof window`).
 * Provider priority:
 *   1. web-speech — SpeechRecognition available (Chrome, Edge, FF 141+)
 *   2. server-deepgram — NEXT_PUBLIC_VOICE_PROVIDER=server-deepgram set
 *   3. server-assemblyai — NEXT_PUBLIC_VOICE_PROVIDER=server-assemblyai set
 *   4. browser-whisper — user opts in or Web Speech unavailable
 * Provider preference persisted in localStorage key "voice_provider".
 *
 * Phase 2 Whisper expects mono PCM at 16 kHz — decode on main thread; ASR in Web Worker.
 */
import type { SttProvider } from "@/types/voice";

/** Human-readable labels for provider picker UI */
export const VOICE_PROVIDER_LABELS: Record<SttProvider, string> = {
  "web-speech": "Quick (Browser)",
  "browser-whisper": "Private (On-Device)",
  "server-deepgram": "Cloud (Deepgram)",
  "server-assemblyai": "Cloud (AssemblyAI)",
};

/** localStorage key for persisting the user's provider choice */
export const VOICE_PROVIDER_STORAGE_KEY = "voice_provider";

/** MediaRecorder chunk interval (ms) for Phase 3 chunked upload */
export const VOICE_CHUNK_INTERVAL_MS = 3000;

/** MediaRecorder chunk interval (ms) for Private Whisper — longer = fewer idle cycles */
export const WHISPER_CHUNK_INTERVAL_MS = 5000;

/** RMS threshold for AnalyserNode speech detection (skip silent timeslices) */
export const VOICE_SPEECH_RMS_THRESHOLD = 0.015;

/** Poll interval (ms) for speech monitor while recording */
export const VOICE_SPEECH_POLL_MS = 100;

/** Max decoded PCM window (seconds) before rolling trim on long sessions */
export const WHISPER_MAX_SESSION_SECONDS = 45;

/** Phase 2 Whisper model — whisper-base balances size (~136MB) and accuracy */
export const WHISPER_MODEL_ID = "onnx-community/whisper-base";

/** Phase 2 model quantization: int8 reduces size with minimal accuracy loss */
export const WHISPER_DTYPE = "q4" as const;

/** Whisper ASR input sample rate (mono PCM) */
export const WHISPER_SAMPLE_RATE = 16000;

/** Whisper language — avoids "No language specified" console default */
export const WHISPER_LANGUAGE = "en";

/** Post-Stop drain banner while queued decode/transcribe or in-flight cloud chunk finishes */
export const VOICE_PROCESSING_INTERIM = "Processing…";

/** Min new PCM samples before running Whisper (~0.75s @ 16 kHz) */
export const WHISPER_MIN_NEW_SAMPLES = 12000;

/** Min timeslice count before merged WebM is decodable */
export const VOICE_MIN_CHUNKS_BEFORE_DECODE = 2;

/** Min merged blob bytes before attempting decode */
export const VOICE_MIN_MERGED_BYTES = 4096;

/** Interim banner while mic is open and waiting for speech */
export const VOICE_LISTENING_INTERIM = "Listening…";

/** MediaRecorder mime candidates — first supported wins */
const RECORDER_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "",
] as const;

/** Best MediaRecorder mime for this browser (empty = browser default) */
export function getPreferredRecorderMimeType(): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "";
  }
  for (const mime of RECORDER_MIME_CANDIDATES) {
    if (!mime || MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

/** Phase 3 server route path */
export const VOICE_TRANSCRIBE_PATH = "/api/voice/transcribe";

/** True if the browser natively supports SpeechRecognition (Phase 1) */
export function hasSpeechRecognition(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  );
}

/** True if MediaRecorder is available (required for Phase 2 and Phase 3) */
export function hasMediaRecorder(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.MediaRecorder !== "undefined";
}

/** True if any voice input is available on this device */
export function hasAnyVoiceSupport(): boolean {
  return hasSpeechRecognition() || hasMediaRecorder();
}

/** All providers with a server STT key configured client-side */
export function getConfiguredServerProviders(): SttProvider[] {
  const v = process.env.NEXT_PUBLIC_VOICE_PROVIDER;
  if (v === "server-deepgram") return ["server-deepgram"];
  if (v === "server-assemblyai") return ["server-assemblyai"];
  return [];
}

/**
 * Detect the best default provider for this device/config.
 * Web Speech wins if available (zero setup, instant) — user can change in picker.
 */
export function detectPreferredProvider(): SttProvider {
  if (typeof window === "undefined") return "web-speech"; // SSR default
  const saved = localStorage.getItem(VOICE_PROVIDER_STORAGE_KEY) as SttProvider | null;
  if (saved && isValidProvider(saved)) return saved;
  if (hasSpeechRecognition()) return "web-speech";
  const server = getConfiguredServerProviders();
  if (server.length) return server[0];
  return "browser-whisper";
}

/** Persist user-selected provider */
export function saveProviderPreference(provider: SttProvider): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VOICE_PROVIDER_STORAGE_KEY, provider);
  } catch {
    // localStorage unavailable (private browsing) — ignore
  }
}

/** Guard against stale/invalid stored values */
function isValidProvider(value: string): value is SttProvider {
  return ["web-speech", "browser-whisper", "server-deepgram", "server-assemblyai"].includes(
    value,
  );
}

/**
 * List all providers available on this device (for the picker dropdown).
 * browser-whisper always available if MediaRecorder present (model downloads lazily).
 */
export function getAvailableProviders(): SttProvider[] {
  const providers: SttProvider[] = [];
  if (hasSpeechRecognition()) providers.push("web-speech");
  if (hasMediaRecorder()) providers.push("browser-whisper");
  providers.push(...getConfiguredServerProviders());
  return providers;
}
