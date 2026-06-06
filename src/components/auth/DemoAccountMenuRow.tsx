"use client";

/**
 * Shared demo dropdown row — equal min-height for Test User and Clear Section.
 */
import type { CSSProperties, ReactNode } from "react";
import { RippleButton } from "@/components/ui/ripple-button";
import { cn } from "@/lib/utils";

type DemoAccountMenuRowProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  withBorderBottom?: boolean;
};

export function DemoAccountMenuRow({
  children,
  onClick,
  disabled = false,
  className,
  style,
  withBorderBottom = false,
}: DemoAccountMenuRowProps) {
  return (
    <RippleButton
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={cn("demo-menu-row", className)}
      style={{
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        borderBottom: withBorderBottom ? "1px solid rgba(120,70,20,.1)" : undefined,
        color: "rgba(35,14,3,.8)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = "rgba(120,70,20,.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
      }}
    >
      {children}
    </RippleButton>
  );
}
