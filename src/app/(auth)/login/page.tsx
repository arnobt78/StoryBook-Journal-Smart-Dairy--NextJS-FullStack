import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";
import { getAuthPageConfig } from "@/lib/auth/get-auth-page-config";
import { SITE_NAME } from "@/lib/site-metadata";

// Always evaluate env at request time so OAuth flags reflect current deployment config
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to ${SITE_NAME} — open your leather-bound digital journal and continue writing.`,
};

/**
 * @file (auth)/login/page.tsx
 * @route `/login` — right-hand page of the auth book spread.
 *
 * **SSR vs client:** Server Component reads `getAuthPageConfig()` (env-backed OAuth flags);
 * interactive credentials/OAuth UI lives in client `LoginForm`.
 */
/**
 * Login page — server reads OAuth config; interactive form stays client-side.
 */
export default function LoginPage() {
  // Server-side: which sign-in methods to show (no secrets passed to client)
  const { googleEnabled, demoLoginEnabled } = getAuthPageConfig();

  return (
    <>
      <div
        style={{
          fontFamily: "'IM Fell English',serif",
          fontSize: "10px",
          color: "rgba(100,60,25,.4)",
          textAlign: "center",
          paddingBottom: "8px",
          flexShrink: 0,
        }}
      >
        — Sign in —
      </div>
      <h2
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "20px",
          color: "rgba(35,14,3,.85)",
          margin: "0 0 12px",
          lineHeight: 1.2,
        }}
      >
        Open your journal
      </h2>
      <LoginForm googleEnabled={googleEnabled} demoLoginEnabled={demoLoginEnabled} />
    </>
  );
}
