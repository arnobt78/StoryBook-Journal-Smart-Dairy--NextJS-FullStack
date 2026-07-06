/**
 * @file lib/voice-recorder-drain.ts
 *
 * Serializes async voice chunk jobs so a Stop-time flush always runs
 * after any in-flight decode/transcribe (no early-return race).
 */
export function createVoiceProcessingQueue() {
  let tail: Promise<void> = Promise.resolve();

  function enqueue<T>(job: () => Promise<T>): Promise<T> {
    const next = tail.then(job);
    tail = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  /** Resolves when all queued jobs have settled */
  function awaitIdle(): Promise<void> {
    return tail;
  }

  return { enqueue, awaitIdle };
}
