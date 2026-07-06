/**
 * @file lib/journal-mutation.ts
 *
 * WALKTHROUGH — Server post-write realtime fanout
 * ──────────────────────────────────────────────
 * Call `afterJournalMutation(userId, type, ids?)` at the end of every books/entries
 * API write. It publishes a Redis event so other tabs receive SSE → client invalidates
 * `journalSubtree` via `useJournalRealtime`. Fire-and-forget; never blocks the HTTP response.
 */
/**
 * Server-side post-mutation hook — publish realtime event after Prisma write.
 * Client tabs receive via SSE and invalidate journalSubtree.
 */
import {
  publishJournalEvent,
  type JournalSyncEventType,
} from "@/lib/journal-pubsub";

export async function afterJournalMutation(
  userId: string,
  type: JournalSyncEventType,
  ids?: { bookId?: string; entryId?: string },
): Promise<void> {
  await publishJournalEvent(userId, {
    type,
    bookId: ids?.bookId,
    entryId: ids?.entryId,
  });
}
