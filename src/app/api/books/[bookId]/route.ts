import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveUniqueBookSlug } from "@/lib/journal-slug";
import { updateBookSchema } from "@/lib/validations";
import { parseTags } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;

  const book = await prisma.journalBook.findFirst({
    where: { id: bookId, userId: session.user.id },
    include: {
      entries: {
        where: { isArchived: false },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!book) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  // Parse tags for each entry
  const bookWithParsedTags = {
    ...book,
    entries: book.entries.map((e) => ({
      ...e,
      tags: parseTags(e.tags),
    })),
  };

  return NextResponse.json({ success: true, data: bookWithParsedTags });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;
  const body = await req.json();
  const parsed = updateBookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: parsed.error.message }, { status: 400 });
  }

  const updateData: Prisma.JournalBookUpdateInput = { ...parsed.data };

  if (parsed.data.title !== undefined) {
    const existing = await prisma.journalBook.findFirst({
      where: { id: bookId, userId: session.user.id },
      select: { title: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }
    if (existing.title !== parsed.data.title) {
      updateData.slug = await resolveUniqueBookSlug({
        title: parsed.data.title,
        userId: session.user.id,
        bookId,
        prisma,
      });
    }
  }

  const book = await prisma.journalBook.updateMany({
    where: { id: bookId, userId: session.user.id },
    data: updateData,
  });

  if (book.count === 0) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Updated" });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;

  const result = await prisma.journalBook.deleteMany({
    where: { id: bookId, userId: session.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Deleted" });
}
