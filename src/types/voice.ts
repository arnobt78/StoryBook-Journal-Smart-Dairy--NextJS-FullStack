/**
 * @file types/voice.ts
 *
 * WALKTHROUGH — Voice dictation / STT shared TypeScript contracts
 * ───────────────────────────────────────────────────────────────
 * Three providers:
 *   - "web-speech"     : Phase 1 — browser SpeechRecognition API (free, instant, Chrome/Edge)
 *   - "browser-whisper": Phase 2 — decode on main thread; ONNX ASR in dedicated Web Worker
 *   - "server-deepgram": Phase 3 — chunked audio POST to /api/voice/transcribe → Deepgram Nova
 *   - "server-assemblyai": Phase 3 alt → AssemblyAI streaming
 *
 * VoiceInputStatus state machine:
 *   idle → recording → (transcribing on Phase 2/3) → idle
 *              ↘ error ↗
 */

/** Which STT provider is active */
export type SttProvider =
  | "web-speech"
  | "browser-whisper"
  | "server-deepgram"
  | "server-assemblyai";

/** Current mic/transcription lifecycle state */
export type VoiceInputStatus =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "transcribing"
  | "error";

/** Shape returned by useVoiceInput and sub-hooks */
export interface VoiceInputState {
  status: VoiceInputStatus;
  /** Live preview text from Web Speech interimResults or Phase 2 partial output */
  interim: string;
  /** Human-readable error message when status === "error" */
  error: string | null;
  /** Phase 2 model download progress 0–100; null when not applicable */
  modelProgress: number | null;
  /** Post-Stop drain — Processing banner only (not while mic is on) */
  isVoiceDraining?: boolean;
  /** Internal: chunk or drain in flight */
  isVoiceProcessing?: boolean;
  /** Mic session active (any provider) — reliable stop toggle + mic UI */
  isMicActive?: boolean;
}

/**
 * Full public interface from useVoiceInput.
 * `onTranscript` is called for every final chunk — caller inserts into TipTap.
 */
export interface UseVoiceInputReturn extends VoiceInputState {
  provider: SttProvider;
  setProvider: (p: SttProvider) => void;
  isSupported: boolean;
  toggle: () => void;
}
