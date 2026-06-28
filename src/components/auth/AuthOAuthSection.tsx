"use client";

/**
 * Shared OAuth block for login/register — placed AFTER the primary CTA.
 * OR divider and Google button are separate stagger rows (explicit indices from parent form).
 */
import { AuthOrSeparator } from "@/components/auth/AuthOrSeparator";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { authStaggerRowProps } from "@/lib/auth-stagger";

type AuthOAuthSectionProps = {
  googleEnabled: boolean;
  disabled?: boolean;
  variant?: "login" | "register";
  orStaggerIndex: number;
  googleStaggerIndex: number;
};

export function AuthOAuthSection({
  googleEnabled,
  disabled = false,
  variant = "login",
  orStaggerIndex,
  googleStaggerIndex,
}: AuthOAuthSectionProps) {
  if (!googleEnabled) return null;

  const label =
    variant === "register" ? "Continue with Gmail" : "Open with Gmail";

  return (
    <>
      <div {...authStaggerRowProps(orStaggerIndex, { style: { marginTop: "14px" } })}>
        <AuthOrSeparator label="or" compact />
      </div>
      <div {...authStaggerRowProps(googleStaggerIndex)}>
        <GoogleSignInButton disabled={disabled} label={label} />
      </div>
    </>
  );
}
