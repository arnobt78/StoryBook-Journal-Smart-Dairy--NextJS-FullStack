import type { NextConfig } from "next";

/**
 * Security + cache headers mirror docs/VERCEL_PRODUCTION_GUARDRAILS.md.
 * Vercel Dashboard: enable Bot Protection + AI Bots manually on deploy.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "robohash.org", pathname: "/**" },
    ],
  },
  async headers() {
    /* Immutable static caching is production-only — in dev it breaks Turbopack HMR
       (stale lucide chunks → "module factory is not available" after icon refactors). */
    const routes: { source: string; headers: { key: string; value: string }[] }[] = [
      { source: "/(.*)", headers: securityHeaders },
    ];
    if (process.env.NODE_ENV === "production") {
      routes.unshift({
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      });
    }
    return routes;
  },
};

export default nextConfig;
