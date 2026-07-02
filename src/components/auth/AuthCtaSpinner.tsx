import { Loader2 } from "lucide-react";

type AuthCtaSpinnerProps = {
  size?: number;
};

/** Inline spinner for auth primary + OAuth CTAs during redirect/navigation. */
export function AuthCtaSpinner({ size = 16 }: AuthCtaSpinnerProps) {
  return <Loader2 size={size} aria-hidden className="auth-cta-spinner" />;
}
