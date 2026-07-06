/**
 * @file manifest.ts
 * @route `/manifest.webmanifest` — PWA-lite install metadata aligned with brand colors.
 */
import type { MetadataRoute } from "next";
import {
  SITE_DESCRIPTION,
  SITE_ICON,
  SITE_NAME,
  SITE_DEMO_URL,
} from "@/lib/site-metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    id: SITE_DEMO_URL,
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a0c05",
    theme_color: "#8b4513",
    lang: "en",
    categories: ["productivity", "lifestyle"],
    icons: [
      {
        src: SITE_ICON,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
