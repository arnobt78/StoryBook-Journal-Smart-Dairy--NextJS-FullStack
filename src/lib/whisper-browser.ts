/**
 * @file lib/whisper-browser.ts
 *
 * WALKTHROUGH — Browser-only Whisper loader (Transformers.js v4)
 * ───────────────────────────────────────────────────────────────
 * Centralizes ONNX pipeline init so Next.js can stub `onnxruntime-node`
 * on the client bundle. Uses WASM backend only; model cached via
 * default `env.useBrowserCache` (Cache API / OPFS).
 *
 * MediaRecorder timeslice blobs are WebM fragments — only a merged session
 * blob decodes. Incremental PCM is sliced by sample offset before ASR.
 * PCM decode stays on main thread; ONNX inference runs in whisper.worker.ts
 * when available, with inline main-thread fallback.
 */
import {
  VOICE_MIN_CHUNKS_BEFORE_DECODE,
  VOICE_MIN_MERGED_BYTES,
  WHISPER_DTYPE,
  WHISPER_LANGUAGE,
  WHISPER_MODEL_ID,
  WHISPER_SAMPLE_RATE,
} from "@/lib/voice-input";
import {
  createWhisperWorkerClient,
  type WhisperWorkerClient,
} from "@/lib/whisper-worker-client";

type WhisperEnv = Awaited<
  typeof import("@huggingface/transformers")
>["env"];

type WhisperPipeline = (
  audio: Float32Array,
  options?: { language?: string },
) => Promise<{ text?: string } | Array<{ text?: string }>>;

let inlinePipeline: WhisperPipeline | null = null;
let inlineLoadingPromise: Promise<void> | null = null;
let workerClient: WhisperWorkerClient | null | undefined;
let workerDisabled = false;
let sharedAudioCtx: AudioContext | null = null;

/** Non-isolated origins — single-thread WASM avoids SharedArrayBuffer worker failures */
function configureWhisperEnv(env: WhisperEnv): void {
  if (typeof window === "undefined") return;
  const onnxBackend = env.backends.onnx as {
    wasm?: { numThreads?: number };
  };
  if (!onnxBackend.wasm) {
    onnxBackend.wasm = {};
  }
  if (!window.crossOriginIsolated) {
    onnxBackend.wasm.numThreads = 1;
  }
}

function getWhisperWorkerClient(): WhisperWorkerClient | null {
  if (workerDisabled || typeof window === "undefined") return null;
  if (workerClient === undefined) {
    workerClient = createWhisperWorkerClient();
    if (!workerClient) workerDisabled = true;
  }
  return workerClient;
}

function getSharedAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioContext({ sampleRate: WHISPER_SAMPLE_RATE });
  }
  return sharedAudioCtx;
}

/** Clear pipeline + decode context so user can retry without hard refresh */
export function resetWhisperPipeline(): void {
  if (workerClient) {
    workerClient.reset();
    workerClient.terminate();
  }
  workerClient = undefined;
  workerDisabled = false;
  inlinePipeline = null;
  inlineLoadingPromise = null;
  if (sharedAudioCtx && sharedAudioCtx.state !== "closed") {
    void sharedAudioCtx.close();
  }
  sharedAudioCtx = null;
}

/** True when decode failed on a partial/tiny fragment — skip, do not abort session */
export function isSoftDecodeError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "EncodingError") return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /decodeAudio|EncodingError|Unable to decode/i.test(msg);
}

/** User-facing message — hides raw ONNX / CUDA stack traces */
export function sanitizeWhisperLoadError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/useCuda|onnxruntime-node|cuda/i.test(msg)) {
    return "Private mode unavailable — try Quick (Browser)";
  }
  if (/wasm|worker|session|SharedArrayBuffer|blob:/i.test(msg)) {
    return "On-device voice engine failed to start — try Quick (Browser)";
  }
  if (/AudioContext|decodeAudio/i.test(msg)) {
    return "Audio decoding unavailable in this browser.";
  }
  if (/fetch|network|Failed to fetch/i.test(msg)) {
    return "Could not download on-device model — check your connection.";
  }
  return "Failed to load on-device model — try Quick (Browser)";
}

/** Short user message for repeated transcribe failures */
export function sanitizeWhisperChunkError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/decodeAudio|AudioContext/i.test(msg)) {
    return "Could not decode audio chunk — try again.";
  }
  if (/not loaded/i.test(msg)) {
    return "On-device model not ready — tap Dictate again.";
  }
  return "Transcription chunk failed — try again.";
}

/** Merge MediaRecorder timeslice blobs into one decodable container */
export function mergeRecorderChunks(chunks: Blob[], mimeType: string): Blob {
  const type = mimeType || "audio/webm";
  return new Blob(chunks, { type });
}

/** Decode merged session blob to mono PCM at Whisper sample rate */
export async function decodeBlobToFloat32(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = getSharedAudioContext();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

  if (decoded.numberOfChannels === 2) {
    const scaling = Math.sqrt(2);
    const left = decoded.getChannelData(0);
    const right = decoded.getChannelData(1);
    const mono = new Float32Array(left.length);
    for (let i = 0; i < decoded.length; i++) {
      mono[i] = (scaling * (left[i] + right[i])) / 2;
    }
    return mono;
  }

  return decoded.getChannelData(0).slice();
}

/** Decode all session chunks (merged) — required for timeslice MediaRecorder */
export async function decodeMergedChunksToMono(
  chunks: Blob[],
  mimeType: string,
): Promise<Float32Array> {
  if (chunks.length === 0) return new Float32Array(0);
  return decodeBlobToFloat32(mergeRecorderChunks(chunks, mimeType));
}

async function loadInlinePipeline(onProgress: (pct: number) => void): Promise<void> {
  if (inlinePipeline) return;
  if (inlineLoadingPromise) return inlineLoadingPromise;

  inlineLoadingPromise = (async () => {
    try {
      const { pipeline, env } = await import("@huggingface/transformers");
      configureWhisperEnv(env);
      const pipe = await pipeline("automatic-speech-recognition", WHISPER_MODEL_ID, {
        dtype: WHISPER_DTYPE,
        device: "wasm",
        progress_callback: (info: { status: string; progress?: number }) => {
          if (info.status === "progress" && info.progress !== undefined) {
            onProgress(Math.round(info.progress));
          }
          if (info.status === "done") onProgress(100);
        },
      });
      inlinePipeline = pipe as unknown as WhisperPipeline;
    } catch (err) {
      resetWhisperPipeline();
      throw err;
    }
  })();

  return inlineLoadingPromise;
}

/** Lazy singleton — loads whisper-base once per session; resets on failure for retry */
export async function loadWhisperPipeline(onProgress: (pct: number) => void): Promise<void> {
  const client = getWhisperWorkerClient();
  if (client) {
    try {
      await client.load(onProgress);
      return;
    } catch {
      client.terminate();
      workerClient = null;
      workerDisabled = true;
    }
  }
  await loadInlinePipeline(onProgress);
}

/** Transcribe mono PCM samples; pipeline must be loaded first */
export async function transcribePcmSamples(samples: Float32Array): Promise<string> {
  if (samples.length === 0) return "";

  const client = getWhisperWorkerClient();
  if (client && !workerDisabled) {
    try {
      return await client.transcribe(samples);
    } catch {
      workerDisabled = true;
      client.terminate();
      workerClient = null;
    }
  }

  if (!inlinePipeline) {
    throw new Error("Whisper pipeline not loaded");
  }
  const result = await inlinePipeline(samples, { language: WHISPER_LANGUAGE });
  const text = Array.isArray(result) ? (result[0]?.text ?? "") : (result?.text ?? "");
  return text.trim();
}

/**
 * Incremental session transcribe: merge chunks, decode full PCM, slice new samples.
 * Returns transcribed text for the new window and updated sample offset.
 */
export async function transcribeIncrementalSession(
  chunks: Blob[],
  mimeType: string,
  processedSamples: number,
  minNewSamples: number,
  flush = false,
): Promise<{ text: string; processedSamples: number }> {
  if (!flush) {
    if (chunks.length < VOICE_MIN_CHUNKS_BEFORE_DECODE) {
      return { text: "", processedSamples };
    }
    const merged = mergeRecorderChunks(chunks, mimeType);
    if (merged.size < VOICE_MIN_MERGED_BYTES) {
      return { text: "", processedSamples };
    }
  }

  const pcm = await decodeMergedChunksToMono(chunks, mimeType);
  const newSamples = pcm.subarray(processedSamples);
  if (newSamples.length < minNewSamples) {
    return { text: "", processedSamples: pcm.length };
  }
  const text = await transcribePcmSamples(newSamples);
  return { text, processedSamples: pcm.length };
}
