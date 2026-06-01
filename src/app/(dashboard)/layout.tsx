import type { Metadata } from "next";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { OAuthReturnSync } from "@/components/auth/OAuthReturnSync";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Authenticated app shell — noindex to limit bot crawl on private journal UI */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="dashboard-scroll">
      <OAuthReturnSync />
      <DashboardNav user={session.user} />
      <main>{children}</main>
    </div>
  );
}
