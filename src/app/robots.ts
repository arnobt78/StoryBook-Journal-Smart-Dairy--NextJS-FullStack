import type { MetadataRoute } from "next";

/**
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
        disallow: ["/_next/", "/api/", "/dashboard/", "/journal/"],
      },
      {
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
