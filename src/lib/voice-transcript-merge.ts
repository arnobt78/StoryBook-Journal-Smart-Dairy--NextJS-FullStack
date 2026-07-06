/**
 * @file lib/voice-transcript-merge.ts
 *
 * Dedupes incremental Whisper chunks — trims suffix/prefix overlap before
 * appending to the editor so repeated phrases are not inserted twice.
 */

/** Return only the new portion of `newText` relative to recent editor tail */
export function mergeTranscriptDelta(previousTail: string, newText: string): string {
  const prev = previousTail.trim();
  const next = newText.trim();
  if (!next) return "";
  if (!prev) return next;
  if (prev.endsWith(next)) return "";

  const maxOverlap = Math.min(prev.length, next.length);
  for (let overlap = maxOverlap; overlap > 0; overlap--) {
    if (prev.slice(-overlap) === next.slice(0, overlap)) {
      const delta = next.slice(overlap).trimStart();
      return delta;
    }
  }

  return next;
}
