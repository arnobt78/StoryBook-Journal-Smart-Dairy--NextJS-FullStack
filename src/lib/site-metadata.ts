/**
 * WALKTHROUGH — site-metadata.ts
 *
 * Central SEO + OpenGraph + Twitter metadata for root layout.
 * NEXTAUTH_URL drives metadataBase/canonical; dashboard layout overrides
 * robots to noindex for private journal routes.
 *
 * Export `siteMetadata` consumed by src/app/layout.tsx.
 */
import type { Metadata } from "next";
export const SITE_URL =
  process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "https://storybook-journal.vercel.app";

export const SITE_AUTHOR = {
  name: "Arnob Mahmud",
  url: "https://www.arnobmahmud.com",
  email: "contact@arnobmahmud.com",
} as const;

export const SITE_NAME = "StoryBook Journal";

/** Default document title — marketing / landing (README product name + positioning) */
export const SITE_TITLE =
  "StoryBook Journal — Premium Immersive Digital Diary & Writing App";

export const SITE_DESCRIPTION =
  "StoryBook Journal is a premium immersive journaling web app with realistic 3D page-flip animations, a leather book aesthetic, AI writing assistance, offline drafts, and secure auth. Write your story one page at a time.";

export const SITE_KEYWORDS = [
  "StoryBook Journal",
  "digital journal",
  "online diary",
  "journaling app",
  "page flip animation",
  "immersive writing",
  "AI writing assistant",
  "personal journal",
  "daily journal",
  "Next.js journal",
  "Arnob Mahmud",
] as const;

/** Brand mark from /public — used when no favicon.ico is present */
export const SITE_ICON = "/dairy-1.svg";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.url }],
  creator: SITE_AUTHOR.name,
  publisher: SITE_AUTHOR.name,
  keywords: [...SITE_KEYWORDS],
  category: "Productivity",
  icons: {
    icon: [{ url: SITE_ICON, type: "image/svg+xml" }],
    apple: [{ url: SITE_ICON, type: "image/svg+xml" }],
    shortcut: [SITE_ICON],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_ICON,
        width: 512,
        height: 512,
        alt: `${SITE_NAME} — leather diary icon`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_ICON],
    creator: "@arnobmahmud",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    "contact:email": SITE_AUTHOR.email,
    author: SITE_AUTHOR.name,
  },
};
