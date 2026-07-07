/**
 * WALKTHROUGH — site-metadata.ts
 *
 * Central SEO + OpenGraph + Twitter metadata for root layout.
 * NEXTAUTH_URL drives metadataBase/canonical; dashboard layout overrides
 * robots to noindex for private journal routes.
 *
 * Live demo: https://storybook-journal.vercel.app (see README.md)
 * Export `siteMetadata` consumed by src/app/layout.tsx.
 */
import type { Metadata } from "next";

/** Production demo URL — falls back when NEXTAUTH_URL is unset (local dev) */
export const SITE_URL =
  process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
  "https://storybook-journal.vercel.app";

export const SITE_DEMO_URL = "https://storybook-journal.vercel.app";

export const SITE_AUTHOR = {
  name: "Arnob Mahmud",
  url: "https://www.arnobmahmud.com",
  email: "contact@arnobmahmud.com",
} as const;

export const SITE_NAME = "StoryBook Journal";

/**
 * Default document title — README product name + core positioning.
 * Template in layout adds "| StoryBook Journal" for child routes.
 */
export const SITE_TITLE =
  "StoryBook Journal — Premium Immersive Digital Diary with 3D Page Flip, Offline Sync & AI Writing Assist";

export const SITE_DESCRIPTION =
  "StoryBook Journal is a full-stack immersive journaling web app with realistic leather book UI, CSS 3D page-flip animations, mood and weather pickers, tags, autosave, IndexedDB offline drafts, TanStack Query sync, and optional AI writing assistance. Built with Next.js, TypeScript, PostgreSQL, and NextAuth. Write your story one page at a time.";

/** Primary SEO keywords — mirrored in README § Keywords & SEO */
export const SITE_KEYWORDS = [
  "StoryBook Journal",
  "digital journal",
  "online diary",
  "journaling app",
  "smart diary",
  "page flip animation",
  "immersive writing",
  "AI writing assistant",
  "personal journal",
  "daily journal",
  "offline journal",
  "IndexedDB sync",
  "Next.js journal",
  "React diary app",
  "Prisma PostgreSQL",
  "NextAuth",
  "TanStack Query",
  "TipTap editor",
  "leather book UI",
  "Arnob Mahmud",
] as const;

/** Brand mark from /public — journal bookmark SVG (in-app, Apple touch, OG, PWA) */
export const SITE_ICON = "/diary-1.svg";

/** Browser tab favicon — classic .ico; listed first so tabs prefer it over SVG */
export const SITE_FAVICON = "/favicon.ico";

/** Optional secondary image for richer social previews */
export const SITE_OG_IMAGE = "/book-stack-1.svg";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [
    { name: SITE_AUTHOR.name, url: SITE_AUTHOR.url },
    { name: SITE_AUTHOR.email, url: `mailto:${SITE_AUTHOR.email}` },
  ],
  creator: SITE_AUTHOR.name,
  publisher: SITE_AUTHOR.name,
  keywords: [...SITE_KEYWORDS],
  category: "Productivity",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: SITE_FAVICON, sizes: "any" }],
    apple: [{ url: SITE_ICON, type: "image/svg+xml" }],
    shortcut: [SITE_FAVICON],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_DEMO_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 512,
        height: 512,
        alt: `${SITE_NAME} — leather diary and journal stack illustration`,
      },
      {
        url: SITE_ICON,
        width: 256,
        height: 256,
        alt: `${SITE_NAME} — journal bookmark icon`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
    creator: "@arnobmahmud",
    site: "@arnobmahmud",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_DEMO_URL,
  },
  other: {
    "contact:email": SITE_AUTHOR.email,
    author: SITE_AUTHOR.name,
    "author:url": SITE_AUTHOR.url,
    "og:see_also": SITE_DEMO_URL,
  },
};
