"use client";

/**
 * One-click Google OAuth via NextAuth.
 * Sets localStorage flags BEFORE redirect (AUTH_UI_IMPLEMENTATION_GUIDE) so the
 * dashboard nav does not flash "Sign in" while the session cookie settles.
 */
import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  AUTH_STATE_KEY,
  OAUTH_CALLBACK_URL,
  OAUTH_PENDING_KEY,
} from "@/constants/auth";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

type GoogleSignInButtonProps = {
  disabled?: boolean;
  label?: string;
};

export function GoogleSignInButton({
  disabled = false,
  label = "Open with Gmail",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STATE_KEY, "true");
        localStorage.setItem(OAUTH_PENDING_KEY, "true");
      }
      await signIn("google", {
        callbackUrl: OAUTH_CALLBACK_URL,
        redirect: true,
      });
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STATE_KEY);
        localStorage.removeItem(OAUTH_PENDING_KEY);
      }
      toast.error("Could not open Google sign-in. Please try again.");
      setLoading(false);
    }
  }, [disabled, loading]);

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleGoogleSignIn}
      aria-label={label}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        fontFamily: "'Lora',serif",
        fontSize: "11px",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        background: "rgba(120,70,20,.06)",
        color: "rgba(35,14,3,.78)",
        border: "1px solid rgba(120,70,20,.22)",
        padding: "11px 14px",
        borderRadius: "4px",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.65 : 1,
        boxSizing: "border-box",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = "rgba(120,70,20,.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(120,70,20,.06)";
      }}
    >
      <GoogleIcon size={18} />
      <span>{loading ? "Redirecting…" : label}</span>
    </button>
  );
}
