/**
 * @file sitemap.ts
 * @route `/sitemap.xml` — public marketing/auth pages only (dashboard/journal are noindex).
 */
import type { MetadataRoute } from "next";
import { SITE_DEMO_URL } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = SITE_DEMO_URL;

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/register`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
