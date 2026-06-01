import type { MetadataRoute } from "next";

/**
 * @file robots.ts
 * @route `/robots.txt` — generated at build/request time via Next.js Metadata Route.
 *
 * **SSR vs client:** Server-only metadata route (no React). Crawlers fetch this
 * before indexing; rules here complement per-page `metadata.robots` on dashboard routes.
 *
 * Crawl scope for public marketing/auth pages only.
 * Authenticated routes (/dashboard, /journal) have no SEO value — disallow bots.
 * AI scrapers blocked explicitly (see VERCEL_PRODUCTION_GUARDRAILS.md).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private app surfaces — no search value; also keeps journal content out of indexes
        disallow: ["/_next/", "/api/", "/dashboard/", "/journal/"],
      },
      {
        // Block known LLM crawlers site-wide (defense in depth with Vercel Bot Protection)
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        disallow: "/",
      },
    ],
  };
}
