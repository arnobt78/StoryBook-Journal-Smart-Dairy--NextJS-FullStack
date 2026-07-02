"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { RippleButton } from "@/components/ui/ripple-button";
import { AuthCtaSpinner } from "@/components/auth/AuthCtaSpinner";
import { primaryCtaClassName, primaryCtaStyle } from "@/lib/auth-form-styles";

type AuthFormSubmitButtonProps = {
  loading: boolean;
  idleLabel: string;
  pendingLabel: string;
  icon: LucideIcon;
  staggerProps?: { className: string; style: CSSProperties };
};

/** Primary login/register CTA — spinner + pending label while navigation is in flight. */
export function AuthFormSubmitButton({
  loading,
  idleLabel,
  pendingLabel,
  icon: Icon,
  staggerProps,
}: AuthFormSubmitButtonProps) {
  return (
    <RippleButton
      {...(staggerProps ?? {})}
      className={[staggerProps?.className, `w-full ${primaryCtaClassName}`].filter(Boolean).join(" ")}
      style={{
        ...primaryCtaStyle,
        ...staggerProps?.style,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
      type="submit"
      disabled={loading}
      icon={loading ? undefined : Icon}
      shine
      shineRadius={4}
    >
      {loading ? (
        <>
          <AuthCtaSpinner />
          {pendingLabel}
        </>
      ) : (
        idleLabel
      )}
    </RippleButton>
  );
}
