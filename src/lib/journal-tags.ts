/**
 * Tag helpers — pending "+ tag" input must merge into draft before PATCH.
 */

/** Merge uncommitted tag input; skips empty and duplicate values */
export function mergePendingTag(tags: string[], pendingInput: string): string[] {
  const pending = pendingInput.trim();
  if (!pending) return tags;
  if (tags.includes(pending)) return tags;
  return [...tags, pending];
}
