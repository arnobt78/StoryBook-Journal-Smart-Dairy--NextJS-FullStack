/**
 * @file api/entries/[entryId]/route.ts
 * @route PATCH, DELETE `/api/entries/[entryId]`
 *
 * WALKTHROUGH — Entry autosave + delete
 * ────────────────────────────────────
 * PATCH  — Partial update from `useAutoSave` (2s debounce) or manual Save.
 *          Recomputes wordCount/readingTime when content changes; syncs slug on title.
 * DELETE — Hard delete; BookSpread navigates to adjacent entry after success.
 *
 * Auth uses NextAuth v5 `auth()` wrapper so request cookies bind correctly in Route Handlers.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveUniqueEntrySlug } from "@/lib/journal-slug";
import { updateEntrySchema } from "@/lib/validations";
import { wordCount, readingTime, stringifyTags, parseTags } from "@/lib/utils";
import { afterJournalMutation } from "@/lib/journal-mutation";

export const PATCH = auth(async (req, ctx) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const session = req.auth;
  const { entryId } = await ctx.params;
  const body = await req.json();
  const parsed = updateEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: parsed.error.message }, { status: 400 });
  }

  const { content, tags, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };

  if (content !== undefined) {
    const wc = wordCount(content);
    updateData.content = content;
    updateData.excerpt = content.slice(0, 200);
    updateData.wordCount = wc;
    updateData.readingTime = readingTime(wc);
  }

  if (tags !== undefined) {
    updateData.tags = stringifyTags(tags);
  }

  if (parsed.data.title !== undefined) {
    const existing = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId: session.user.id },
      select: { title: true, bookId: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
    }
    if (existing.title !== parsed.data.title) {
      updateData.slug = await resolveUniqueEntrySlug({
        title: parsed.data.title,
        bookId: existing.bookId,
        entryId,
        prisma,
      });
    }
  }

  const result = await prisma.journalEntry.updateMany({
    where: { id: entryId, userId: session.user.id },
    data: updateData,
  });

  if (result.count === 0) {
    return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
  }

  const updated = await prisma.journalEntry.findUnique({ where: { id: entryId } });
  if (updated) {
    await afterJournalMutation(session.user.id, "entry_updated", {
      bookId: updated.bookId,
      entryId: updated.id,
    });
  }
  return NextResponse.json({
    success: true,
    data: updated ? { ...updated, tags: parseTags(updated.tags) } : null,
  });
});

export const DELETE = auth(async (_req, ctx) => {
  if (!_req.auth?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const session = _req.auth;
  const { entryId } = await ctx.params;

  const existing = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId: session.user.id },
    select: { bookId: true },
  });
  if (!existing) {
    return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
  }

  const result = await prisma.journalEntry.deleteMany({
    where: { id: entryId, userId: session.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
  }

  await afterJournalMutation(session.user.id, "entry_deleted", {
    bookId: existing.bookId,
    entryId,
  });

  return NextResponse.json({ success: true, message: "Deleted" });
});
