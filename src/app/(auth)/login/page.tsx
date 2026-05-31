import { LoginForm } from "@/components/forms/LoginForm";
import { isGoogleOAuthEnabled } from "@/lib/auth/is-google-enabled";

export const dynamic = "force-dynamic";

/**
 * Login page — server reads OAuth config; interactive form stays client-side.
 */
export default function LoginPage() {
  const googleEnabled = isGoogleOAuthEnabled();

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
          margin: "0 0 20px",
          lineHeight: 1.2,
        }}
      >
        Open your journal
      </h2>
      <LoginForm googleEnabled={googleEnabled} />
    </>
  );
}
