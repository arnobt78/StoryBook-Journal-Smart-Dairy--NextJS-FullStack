import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { BookShelf } from "@/components/journal/BookShelf";

/**
 * @file (dashboard)/dashboard/page.tsx
 * @route `/dashboard` — book shelf (list of user's journal books).
 *
 * **SSR vs client:** Async Server Component fetches books via Prisma on the server and
 * passes them as props to client `BookShelf` (hover prefetch, offline create, etc.).
 */
// Per-request auth + fresh book list (entries count included for shelf badges)
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Scoped to session user — never trust bookId from URL on this page
  const books = await prisma.journalBook.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { entries: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background:
          "radial-gradient(ellipse at 50% 30%, #2e160a 0%, #1a0c05 55%, #0e0603 100%)",
        padding: "48px 32px",
      }}
    >
      <BookShelf books={books} userName={session.user.name ?? "Friend"} />
    </div>
  );
}
