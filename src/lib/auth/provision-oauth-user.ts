/**
 * Creates or updates a Prisma User for Google OAuth sign-in.
 * JWT sessions do not persist OAuth users automatically — this callback ensures
 * user.id is our database cuid (required for book/entry ownership filters).
 */
import { prisma } from "@/lib/db";
import { formatEntryDate, slugify, stringifyTags } from "@/lib/utils";

export type ProvisionedOAuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export async function provisionOAuthUser(params: {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}): Promise<ProvisionedOAuthUser> {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        lastLoginAt: new Date(),
        displayName: params.displayName ?? existing.displayName,
        avatarUrl: params.avatarUrl ?? existing.avatarUrl,
      },
    });
    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      avatarUrl: updated.avatarUrl,
    };
  }

  const { entryDate, weekday } = formatEntryDate();

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: params.email,
        displayName: params.displayName ?? params.email.split("@")[0],
        avatarUrl: params.avatarUrl ?? null,
        lastLoginAt: new Date(),
      },
    });

    const bookSlug = slugify("My Journal", user.id.slice(-6));
    const book = await tx.journalBook.create({
      data: {
        userId: user.id,
        title: "My Journal",
        slug: bookSlug,
        coverColor: "#8b4513",
        coverEmoji: "📖",
        description: "A place for my thoughts.",
      },
    });

    await tx.journalEntry.create({
      data: {
        userId: user.id,
        bookId: book.id,
        title: "Welcome to StoryBook",
        slug: "welcome-to-storybook",
        content:
          "<p>Your journal begins here. Write what's on your mind, capture memories, and let your story unfold — one page at a time.</p>",
        mood: "✨",
        weather: "☀️",
        tags: stringifyTags(["welcome", "beginning"]),
        wordCount: 24,
        readingTime: 1,
        entryDate,
        weekday,
      },
    });

    return user;
  });

  return {
    id: created.id,
    email: created.email,
    displayName: created.displayName,
    avatarUrl: created.avatarUrl,
  };
}
