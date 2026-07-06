/**
 * @file components/ui/ripple-button.tsx
 *
 * WALKTHROUGH — Click ripple + optional shine radius
 * ────────────────────────────────────────────────
 * Used across auth CTAs, shelf spines, journal nav. `shineRadius` only when set
 * so `rounded-full` avatars are not forced to 4px radius.
 */
"use client";

/**
 * RippleButton — water-splash click effect per docs/RIPPLE_BUTTON_EFFECT.md.
 * Optional Lucide icon + configurable shine radius (fixes pill-stretch on inline CTAs).
 * Border radius only applied when shine/shineRadius set — preserves rounded-full avatars.
 */
import {
  forwardRef,
  useCallback,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
} from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RippleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Wrap in cta-shine-wrap for auto-playing shine sweep on primary CTAs */
  shine?: boolean;
  /** Border radius for shine wrap + button — omit to let className (e.g. rounded-full) win */
  shineRadius?: string | number;
  /** Optional Lucide icon rendered before/after label */
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconSize?: number;
};

function toRadius(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  function RippleButton(
    {
      className,
      style,
      onClick,
      children,
      shine = false,
      shineRadius,
      icon: Icon,
      iconPosition = "left",
      iconSize = 16,
      type = "button",
      ...props
    },
    ref,
  ) {
    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const ripple = document.createElement("span");
        ripple.className = "ripple-effect";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
        onClick?.(e);
      },
      [onClick],
    );

    const hasExplicitRadius =
      shineRadius !== undefined ||
      shine ||
      style?.borderRadius !== undefined;

    const radius = hasExplicitRadius
      ? toRadius(
          shineRadius ??
            (style?.borderRadius as string | number | undefined) ??
            "4px",
        )
      : undefined;

    const isFullWidth = className?.includes("w-full") || style?.width === "100%";

    const buttonStyle: CSSProperties = {
      position: "relative",
      overflow: "hidden",
      display: "inline-flex",
      flexDirection: "row",
      flexWrap: Icon ? "nowrap" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: Icon ? "8px" : undefined,
      flexShrink: 0,
      ...(radius !== undefined ? { borderRadius: radius } : {}),
      ...style,
    };

    const button = (
      <button
        ref={ref}
        type={type}
        className={cn("relative overflow-hidden", shine && "cta-shine-button", className)}
        style={buttonStyle}
        onClick={handleClick}
        {...props}
      >
        {Icon && iconPosition === "left" && (
          <Icon size={iconSize} strokeWidth={2} aria-hidden className="shrink-0" />
        )}
        {children}
        {Icon && iconPosition === "right" && (
          <Icon size={iconSize} strokeWidth={2} aria-hidden className="shrink-0" />
        )}
      </button>
    );

    if (shine) {
      const wrapStyle: CSSProperties = {
        position: "relative",
        display: isFullWidth ? "block" : "inline-flex",
        width: isFullWidth ? "100%" : "fit-content",
        overflow: "hidden",
        borderRadius: radius ?? "4px",
        flexShrink: 0,
      };
      return (
        <span className="cta-shine-wrap" style={wrapStyle}>
          {button}
        </span>
      );
    }

    return button;
  },
);
