"use client";

/**
 * One-click Google OAuth via NextAuth.
 * Matches primary auth CTA height/radius for visual consistency on login/register.
 */
import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { appToast } from "@/lib/app-toast";
import { oauthCtaClassName, oauthCtaStyle } from "@/lib/auth-form-styles";
import {
  AUTH_STATE_KEY,
  OAUTH_CALLBACK_URL,
  OAUTH_PENDING_KEY,
  OAUTH_VARIANT_KEY,
  type OAuthAuthVariant,
} from "@/constants/auth";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { AuthCtaSpinner } from "@/components/auth/AuthCtaSpinner";
import { RippleButton } from "@/components/ui/ripple-button";

type GoogleSignInButtonProps = {
  disabled?: boolean;
  label?: string;
  /** login → welcomeBack toast; register → registered toast after OAuth return */
  variant?: OAuthAuthVariant;
};

export function GoogleSignInButton({
  disabled = false,
  label = "Open with Gmail",
  variant = "login",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STATE_KEY, "true");
        localStorage.setItem(OAUTH_PENDING_KEY, "true");
        localStorage.setItem(OAUTH_VARIANT_KEY, variant);
      }
      await signIn("google", {
        callbackUrl: OAUTH_CALLBACK_URL,
        redirect: true,
      });
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STATE_KEY);
        localStorage.removeItem(OAUTH_PENDING_KEY);
        localStorage.removeItem(OAUTH_VARIANT_KEY);
      }
      appToast.auth.googleError();
      setLoading(false);
    }
  }, [disabled, loading, variant]);

  return (
    <RippleButton
      type="button"
      disabled={disabled || loading}
      onClick={handleGoogleSignIn}
      aria-label={label}
      className={`w-full auth-control ${oauthCtaClassName}`}
      style={{
        ...oauthCtaStyle,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.65 : 1,
      }}
    >
      {loading ? <AuthCtaSpinner size={18} /> : <GoogleIcon size={18} />}
      <span style={{ letterSpacing: "1.5px" }}>{loading ? "Redirecting…" : label}</span>
    </RippleButton>
  );
}
