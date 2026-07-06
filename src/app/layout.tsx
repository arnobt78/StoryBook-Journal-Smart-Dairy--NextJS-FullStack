/**
 * @file app/layout.tsx
 * @route Root layout — wraps every page in the app
 *
 * WALKTHROUGH — Application shell
 * ─────────────────────────────
 *  • `siteMetadata` — SEO/OpenGraph from `src/lib/site-metadata.ts`
 *  • `globals.css` — fonts, leather-glass tokens, journal animations
 *  • `<Providers>` — SessionProvider + TanStack Query + offline sync + toasts
 *  • Font preloads — Dancing Script / IM Fell / Playfair for landing LCP
 *  • Child route groups: `(auth)`, `(dashboard)`, `api/*` inherit this shell
 */
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { siteMetadata } from "@/lib/site-metadata";

/** Root SEO metadata — author, OG, Twitter, keywords; see src/lib/site-metadata.ts */
export const metadata: Metadata = siteMetadata;

/**
 * Root layout — injects global CSS (fonts, tokens, animations) and wraps all
 * routes in <Providers> (SessionProvider + QueryClientProvider + Sonner Toaster).
 *
 * `suppressHydrationWarning` on <html> and <body> silences mismatches when browser
 * extensions inject attributes before hydration (e.g. Grammarly, `cz-shortcut-listen`).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Critical font preloads — landing cover titles render before globals.css is parsed */}
        <link
          rel="preload"
          href="/fonts/dancing-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/imfell-400i.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/playfair-400i.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
