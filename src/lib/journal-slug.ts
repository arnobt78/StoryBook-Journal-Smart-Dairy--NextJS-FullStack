import type { PrismaClient } from "@prisma/client";
import { slugify } from "@/lib/utils";

type PrismaLike = Pick<PrismaClient, "journalBook" | "journalEntry">;

/** Resolve a unique book slug when title changes (@@unique([userId, slug])). */
export async function resolveUniqueBookSlug(params: {
  title: string;
  userId: string;
  bookId: string;
  prisma: PrismaLike;
}): Promise<string> {
  const { title, userId, bookId, prisma } = params;
  let slug = slugify(title, bookId.slice(-6));

  const collision = await prisma.journalBook.findFirst({
    where: { userId, slug, NOT: { id: bookId } },
    select: { id: true },
  });

  if (collision) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return slug;
}

/** Resolve a unique entry slug when title changes (@@unique([bookId, slug])). */
export async function resolveUniqueEntrySlug(params: {
  title: string;
  bookId: string;
  entryId: string;
  prisma: PrismaLike;
}): Promise<string> {
  const { title, bookId, entryId, prisma } = params;
  let slug = slugify(title, entryId.slice(-6));

  const collision = await prisma.journalEntry.findFirst({
    where: { bookId, slug, NOT: { id: entryId } },
    select: { id: true },
  });

  if (collision) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return slug;
}
