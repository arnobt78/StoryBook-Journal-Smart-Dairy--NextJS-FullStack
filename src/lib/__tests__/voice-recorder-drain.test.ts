import { describe, expect, it } from "vitest";
import { createVoiceProcessingQueue } from "@/lib/voice-recorder-drain";

describe("createVoiceProcessingQueue", () => {
  it("runs queued jobs sequentially after in-flight work", async () => {
    const queue = createVoiceProcessingQueue();
    const order: string[] = [];

    const first = queue.enqueue(async () => {
      await new Promise((r) => setTimeout(r, 30));
      order.push("first");
    });

    const second = queue.enqueue(async () => {
      order.push("second");
    });

    await Promise.all([first, second]);
    expect(order).toEqual(["first", "second"]);
  });

  it("flush job runs after in-flight chunk job (no skip)", async () => {
    const queue = createVoiceProcessingQueue();
    let inFlight = true;
    let flushed = false;

    const chunk = queue.enqueue(async () => {
      await new Promise((r) => setTimeout(r, 25));
      inFlight = false;
    });

    const flush = queue.enqueue(async () => {
      expect(inFlight).toBe(false);
      flushed = true;
    });

    await chunk;
    await flush;
    expect(flushed).toBe(true);
  });

  it("awaitIdle resolves when all jobs complete", async () => {
    const queue = createVoiceProcessingQueue();
    let done = false;

    void queue.enqueue(async () => {
      await new Promise((r) => setTimeout(r, 15));
      done = true;
    });

    await queue.awaitIdle();
    expect(done).toBe(true);
  });
});
