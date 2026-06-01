/**
 * OAuth user provisioning — database walkthrough
 * ----------------------------------------------
 * NextAuth JWT sessions store a token, not a Prisma row. Google sign-in gives
 * email/name/image from the provider, but our app scopes data by User.id (cuid).
 *
 * Called from auth.ts signIn callback after Google OAuth succeeds:
 *
 * Existing user (match by email):
 *   → update lastLoginAt, refresh displayName/avatarUrl if provider sent new values
 *   → return { id, email, ... } so JWT callback sets token.id = database id
 *
 * New user:
 *   → $transaction: create User, default JournalBook ("My Journal"), welcome Entry
 *   → same return shape; first login lands user with a ready-to-edit journal
 *
 * Without this step, session.user.id would be the OAuth subject string, and
 * book/entry queries filtered by userId would return nothing or wrong rows.
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
