/**
 * @file app/page.tsx
 * @route `/` — Marketing landing (3D leather book cover)
 *
 * WALKTHROUGH — Public entry point
 * ───────────────────────────────
 * Server Component: `auth()` → redirect logged-in users to `/dashboard`.
 * Client island: `LandingCover` (BookCover.tsx) — hinge animation, CTAs to login/register.
 * SEO: `metadata` uses absolute title from site-metadata.ts.
 */
/**
 * Landing route (/) — Server Component gate before the 3D book cover.
 * Logged-in users skip marketing and go straight to the shelf.
 */
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingCover } from "@/components/journal/BookCover";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site-metadata";

/** Landing page SEO — absolute title avoids duplicate "| StoryBook Journal" suffix */
export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  /* LandingCover: client 3D hinge animation — click opens auth funnel */
  return <LandingCover />;
}
