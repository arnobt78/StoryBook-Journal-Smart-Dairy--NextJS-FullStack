import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { getAuthPageConfig } from "@/lib/auth/get-auth-page-config";
import { SITE_NAME } from "@/lib/site-metadata";

// force-dynamic: register page must reflect live OAuth env (same as login)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Account",
  description: `Create your ${SITE_NAME} account — start a premium immersive digital diary with page-flip animations and AI writing assist.`,
};

/**
 * @file (auth)/register/page.tsx
 * @route `/register` — right-hand page; `/login` ↔ `/register` flip handled by `AuthBookShell`.
 *
 * **SSR vs client:** Server Component for metadata + OAuth flags; `RegisterForm` is client-side.
 */
/** Right-hand page content only; shell + left page live in `(auth)/layout` via `AuthBookShell`. */
export default function RegisterPage() {
  const { googleEnabled } = getAuthPageConfig();

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
        — Begin —
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
        Create your account
      </h2>
      <RegisterForm googleEnabled={googleEnabled} />
    </>
  );
}
