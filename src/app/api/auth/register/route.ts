/**
 * POST /api/auth/register — public account creation.
 *
 * HTTP: POST only.
 * Auth: none (open signup); returns 201 with userId on success.
 * Validation: registerSchema (Zod) — email, password, displayName.
 * Ownership: N/A; seeds default book + welcome entry for new userId.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { slugify, formatEntryDate, stringifyTags } from "@/lib/utils";

/**
 * POST /api/auth/register
 *
 * Creates a new user account, seeds a default journal book and welcome entry.
 * Also ensures the test@user.com demo account exists on every registration
 * call (idempotent — no-op if already present) so the test credentials
 * dropdown in LoginForm always works after a fresh DB migration.
 */

async function ensureTestUser() {
  const TEST_EMAIL = "test@user.com";
  const existing   = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (existing) return;

  const passwordHash = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.create({
    data: { email: TEST_EMAIL, passwordHash, displayName: "Test Reader" },
  });
  const { entryDate, weekday } = formatEntryDate();
  const book = await prisma.journalBook.create({
    data: {
      userId: user.id, title: "My Journal", slug: "my-journal",
      coverColor: "#8b4513", coverEmoji: "📖",
    },
  });
  await prisma.journalEntry.create({
    data: {
      userId: user.id, bookId: book.id,
      title: "Welcome to StoryBook", slug: "welcome-to-storybook",
      content: "<p>Your journal begins here. Write freely — one page at a time.</p>",
      mood: "✨", weather: "☀️",
      tags: stringifyTags(["welcome"]),
      wordCount: 12, readingTime: 1, entryDate, weekday,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    /* Zod validation — reject malformed signup payloads before DB touch. */
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", error: parsed.error.message },
        { status: 400 }
      );
    }

    const { email, password, displayName } = parsed.data;

    /* Prisma — duplicate email check (409 before hash/create). */
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    /* Prisma — create user row; book/entry seeding follows. */
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    /* Seed default journal book */
    const bookSlug = slugify("My Journal", user.id.slice(-6));
    const book = await prisma.journalBook.create({
      data: {
        userId: user.id, title: "My Journal", slug: bookSlug,
        coverColor: "#8b4513", coverEmoji: "📖",
        description: "A place for my thoughts.",
      },
    });

    /* Seed welcome entry */
    const { entryDate, weekday } = formatEntryDate();
    await prisma.journalEntry.create({
      data: {
        userId: user.id, bookId: book.id,
        title: "Welcome to StoryBook", slug: "welcome-to-storybook",
        content: "<p>Your journal begins here. Write what's on your mind, capture memories, and let your story unfold — one page at a time.</p>",
        mood: "✨", weather: "☀️",
        tags: stringifyTags(["welcome", "beginning"]),
        wordCount: 24, readingTime: 1, entryDate, weekday,
      },
    });

    /* Ensure the demo test account exists for the LoginForm dropdown */
    await ensureTestUser().catch(() => { /* non-fatal */ });

    return NextResponse.json(
      { success: true, message: "Account created successfully", data: { userId: user.id } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
