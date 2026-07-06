/**
 * @file lib/whisper-worker-client.ts
 *
 * RPC client for whisper.worker.ts — load model, transcribe PCM, reset.
 * Returns null when Worker is unavailable so whisper-browser can fall back inline.
 */

type PendingLoad = {
  resolve: () => void;
  reject: (err: Error) => void;
  onProgress: (pct: number) => void;
};

type PendingTranscribe = {
  resolve: (text: string) => void;
  reject: (err: Error) => void;
};

export type WorkerInMessage =
  | { type: "load" }
  | { type: "transcribe"; id: number; samples: Float32Array }
  | { type: "reset" };

export type WorkerOutMessage =
  | { type: "load-progress"; pct: number }
  | { type: "load-done" }
  | { type: "load-error"; message: string }
  | { type: "transcribe-result"; id: number; text: string }
  | { type: "transcribe-error"; id: number; message: string };

export type WhisperWorkerClient = {
  load: (onProgress: (pct: number) => void) => Promise<void>;
  transcribe: (samples: Float32Array) => Promise<string>;
  reset: () => void;
  terminate: () => void;
};

/** Bind RPC handlers to an existing Worker instance (used in tests) */
export function bindWhisperWorkerClient(worker: Worker): WhisperWorkerClient {
  let nextId = 1;
  let loadPending: PendingLoad | null = null;
  const transcribePending = new Map<number, PendingTranscribe>();
  let loaded = false;

  worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
    const msg = event.data;
    switch (msg.type) {
      case "load-progress":
        loadPending?.onProgress(msg.pct);
        break;
      case "load-done":
        loaded = true;
        loadPending?.resolve();
        loadPending = null;
        break;
      case "load-error":
        loadPending?.reject(new Error(msg.message));
        loadPending = null;
        break;
      case "transcribe-result": {
        const pending = transcribePending.get(msg.id);
        transcribePending.delete(msg.id);
        pending?.resolve(msg.text);
        break;
      }
      case "transcribe-error": {
        const pending = transcribePending.get(msg.id);
        transcribePending.delete(msg.id);
        pending?.reject(new Error(msg.message));
        break;
      }
      default:
        break;
    }
  };

  worker.onerror = () => {
    loadPending?.reject(new Error("Whisper worker failed"));
    loadPending = null;
    for (const [, pending] of transcribePending) {
      pending.reject(new Error("Whisper worker failed"));
    }
    transcribePending.clear();
  };

  function post(message: WorkerInMessage, transfer?: Transferable[]): void {
    if (transfer?.length) {
      worker.postMessage(message, transfer);
    } else {
      worker.postMessage(message);
    }
  }

  return {
    load(onProgress) {
      if (loaded) {
        onProgress(100);
        return Promise.resolve();
      }
      if (loadPending) {
        return new Promise<void>((resolve, reject) => {
          const prior = loadPending!;
          loadPending = {
            onProgress: (pct) => {
              prior.onProgress(pct);
              onProgress(pct);
            },
            resolve: () => {
              prior.resolve();
              resolve();
            },
            reject: (err) => {
              prior.reject(err);
              reject(err);
            },
          };
        });
      }
      return new Promise<void>((resolve, reject) => {
        loadPending = { resolve, reject, onProgress };
        post({ type: "load" });
      });
    },

    transcribe(samples) {
      const id = nextId++;
      const copy = samples.slice();
      return new Promise<string>((resolve, reject) => {
        transcribePending.set(id, { resolve, reject });
        post({ type: "transcribe", id, samples: copy }, [copy.buffer]);
      });
    },

    reset() {
      loaded = false;
      loadPending = null;
      transcribePending.clear();
      post({ type: "reset" });
    },

    terminate() {
      loaded = false;
      loadPending = null;
      transcribePending.clear();
      worker.terminate();
    },
  };
}

/** Spawn worker client; null if Worker unsupported or constructor throws */
export function createWhisperWorkerClient(): WhisperWorkerClient | null {
  if (typeof Worker === "undefined") return null;

  try {
    const worker = new Worker(new URL("../workers/whisper.worker.ts", import.meta.url), {
      type: "module",
    });
    return bindWhisperWorkerClient(worker);
  } catch {
    return null;
  }
}
