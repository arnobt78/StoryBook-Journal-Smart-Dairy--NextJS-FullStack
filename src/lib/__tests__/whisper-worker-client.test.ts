import { describe, expect, it, vi } from "vitest";
import {
  bindWhisperWorkerClient,
  type WorkerInMessage,
  type WorkerOutMessage,
} from "@/lib/whisper-worker-client";

function createMockWorker() {
  let onmessage: ((event: MessageEvent<WorkerOutMessage>) => void) | null = null;
  const terminate = vi.fn();

  const worker = {
    get onmessage() {
      return onmessage;
    },
    set onmessage(handler: typeof onmessage) {
      onmessage = handler;
    },
    onerror: null as (() => void) | null,
    postMessage: vi.fn((msg: WorkerInMessage) => {
      if (msg.type === "load") {
        onmessage?.({ data: { type: "load-progress", pct: 50 } } as MessageEvent);
        onmessage?.({ data: { type: "load-done" } } as MessageEvent);
        return;
      }
      if (msg.type === "transcribe") {
        onmessage?.({
          data: { type: "transcribe-result", id: msg.id, text: "hello world" },
        } as MessageEvent);
        return;
      }
      if (msg.type === "reset") {
        return;
      }
    }),
    terminate,
  } as unknown as Worker;

  return { worker, terminate };
}

describe("bindWhisperWorkerClient", () => {
  it("resolves load after progress and done messages", async () => {
    const { worker } = createMockWorker();
    const client = bindWhisperWorkerClient(worker);
    const progress: number[] = [];

    await client.load((pct) => progress.push(pct));

    expect(progress).toEqual([50]);
    expect(worker.postMessage).toHaveBeenCalledWith({ type: "load" });
  });

  it("resolves transcribe with worker text", async () => {
    const { worker } = createMockWorker();
    const client = bindWhisperWorkerClient(worker);
    await client.load(() => {});

    const text = await client.transcribe(new Float32Array([0.1, 0.2, 0.3]));

    expect(text).toBe("hello world");
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "transcribe", id: 1 }),
      expect.any(Array),
    );
  });

  it("reset posts reset and terminate calls worker.terminate", async () => {
    const { worker, terminate } = createMockWorker();
    const client = bindWhisperWorkerClient(worker);
    await client.load(() => {});

    client.reset();
    client.terminate();

    expect(worker.postMessage).toHaveBeenCalledWith({ type: "reset" });
    expect(terminate).toHaveBeenCalled();
  });

  it("rejects load on load-error message", async () => {
    const { worker } = createMockWorker();
    (worker.postMessage as ReturnType<typeof vi.fn>).mockImplementation((msg: WorkerInMessage) => {
      if (msg.type === "load") {
        worker.onmessage?.({
          data: { type: "load-error", message: "boom" },
        } as MessageEvent);
      }
    });
    const client = bindWhisperWorkerClient(worker);

    await expect(client.load(() => {})).rejects.toThrow("boom");
  });
});
