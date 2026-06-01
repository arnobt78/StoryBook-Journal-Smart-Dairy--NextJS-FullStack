"use client";

/**
 * Shared OAuth block for login/register — placed AFTER the primary CTA
 * (Open My Journal / Begin My Story): "or" divider, then Google button.
 *
 * ── WALKTHROUGH: OAuth placement in auth forms ──
 *  Primary CTA (credentials submit) always comes first for accessibility and flow.
 *  This block renders only when server passes `googleEnabled` (env vars present).
 */
import { AuthOrSeparator } from "@/components/auth/AuthOrSeparator";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

type AuthOAuthSectionProps = {
  googleEnabled: boolean;
  disabled?: boolean;
  /** Login vs register copy on the Google CTA */
  variant?: "login" | "register";
};

export function AuthOAuthSection({
  googleEnabled,
  disabled = false,
  variant = "login",
}: AuthOAuthSectionProps) {
  if (!googleEnabled) return null;

  const label =
    variant === "register" ? "Continue with Gmail" : "Open with Gmail";

  return (
    <div style={{ marginTop: "14px" }}>
      <AuthOrSeparator label="or" compact />
      <GoogleSignInButton disabled={disabled} label={label} />
    </div>
  );
}
