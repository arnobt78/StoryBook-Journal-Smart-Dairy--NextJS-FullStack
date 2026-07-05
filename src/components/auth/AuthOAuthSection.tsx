"use client";

/**
 * Shared OAuth block for login/register — placed AFTER the primary CTA.
 * OR divider and Google button are separate stagger rows (explicit indices from parent form).
 */
import { AuthOrSeparator } from "@/components/auth/AuthOrSeparator";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { authStaggerRowProps } from "@/lib/auth-stagger";
import {
  OAUTH_GMAIL_LABEL,
  OAUTH_GMAIL_REGISTER_LABEL_FULL,
} from "@/lib/auth-responsive-labels";

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
    variant === "register" ? OAUTH_GMAIL_REGISTER_LABEL_FULL : OAUTH_GMAIL_LABEL;
  const labelShort =
    variant === "register" ? OAUTH_GMAIL_LABEL : undefined;

  return (
    <>
      <div
        {...authStaggerRowProps(orStaggerIndex, {
          style: { marginTop: "14px" },
        })}
      >
        <AuthOrSeparator label="or" compact />
      </div>
      <div {...authStaggerRowProps(googleStaggerIndex)}>
        <GoogleSignInButton
          disabled={disabled}
          label={label}
          labelShort={labelShort}
          variant={variant}
        />
      </div>
    </>
  );
}
