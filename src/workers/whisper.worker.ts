/**
 * @file workers/whisper.worker.ts
 *
 * Dedicated module worker for Private-mode ONNX Whisper inference.
 * Main thread decodes MediaRecorder blobs to PCM; this worker runs ASR only.
 */
import {
  WHISPER_DTYPE,
  WHISPER_LANGUAGE,
  WHISPER_MODEL_ID,
} from "@/lib/voice-input";

type WhisperPipeline = (
  audio: Float32Array,
  options?: { language?: string },
) => Promise<{ text?: string } | Array<{ text?: string }>>;

type WorkerInMessage =
  | { type: "load" }
  | { type: "transcribe"; id: number; samples: Float32Array }
  | { type: "reset" };

type WorkerOutMessage =
  | { type: "load-progress"; pct: number }
  | { type: "load-done" }
  | { type: "load-error"; message: string }
  | { type: "transcribe-result"; id: number; text: string }
  | { type: "transcribe-error"; id: number; message: string };

let pipelineSingleton: WhisperPipeline | null = null;
let loadPromise: Promise<void> | null = null;

function configureWhisperEnv(
  env: Awaited<typeof import("@huggingface/transformers")>["env"],
): void {
  const onnxBackend = env.backends.onnx as { wasm?: { numThreads?: number } };
  if (!onnxBackend.wasm) {
    onnxBackend.wasm = {};
  }
  onnxBackend.wasm.numThreads = 1;
}

async function ensurePipeline(): Promise<WhisperPipeline> {
  if (pipelineSingleton) return pipelineSingleton;
  if (loadPromise) {
    await loadPromise;
    if (!pipelineSingleton) throw new Error("Whisper pipeline not loaded");
    return pipelineSingleton;
  }

  loadPromise = (async () => {
    const { pipeline, env } = await import("@huggingface/transformers");
    configureWhisperEnv(env);
    const pipe = await pipeline("automatic-speech-recognition", WHISPER_MODEL_ID, {
      dtype: WHISPER_DTYPE,
      device: "wasm",
      progress_callback: (info: { status: string; progress?: number }) => {
        if (info.status === "progress" && info.progress !== undefined) {
          post({ type: "load-progress", pct: Math.round(info.progress) });
        }
        if (info.status === "done") {
          post({ type: "load-progress", pct: 100 });
        }
      },
    });
    pipelineSingleton = pipe as unknown as WhisperPipeline;
  })();

  try {
    await loadPromise;
  } catch (err) {
    loadPromise = null;
    pipelineSingleton = null;
    throw err;
  }

  if (!pipelineSingleton) throw new Error("Whisper pipeline not loaded");
  return pipelineSingleton;
}

function post(msg: WorkerOutMessage): void {
  self.postMessage(msg);
}

self.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
  const data = event.data;
  try {
    if (data.type === "load") {
      await ensurePipeline();
      post({ type: "load-done" });
      return;
    }

    if (data.type === "reset") {
      pipelineSingleton = null;
      loadPromise = null;
      return;
    }

    if (data.type === "transcribe") {
      const pipe = await ensurePipeline();
      if (data.samples.length === 0) {
        post({ type: "transcribe-result", id: data.id, text: "" });
        return;
      }
      const result = await pipe(data.samples, { language: WHISPER_LANGUAGE });
      const text = Array.isArray(result)
        ? (result[0]?.text ?? "")
        : (result?.text ?? "");
      post({ type: "transcribe-result", id: data.id, text: text.trim() });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (data.type === "load") {
      post({ type: "load-error", message });
    } else if (data.type === "transcribe") {
      post({ type: "transcribe-error", id: data.id, message });
    }
  }
};
