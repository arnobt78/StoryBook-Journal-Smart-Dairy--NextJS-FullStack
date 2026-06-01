/**
 * Landing route (/) — Server Component gate before the 3D book cover.
 * Logged-in users skip marketing and go straight to the shelf.
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingCover } from "@/components/journal/BookCover";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  /* LandingCover: client 3D hinge animation — click opens auth funnel */
  return <LandingCover />;
}
