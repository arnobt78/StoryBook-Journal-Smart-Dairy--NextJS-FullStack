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
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
