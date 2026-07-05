"use client";

/**
 * Auth spread header — icon + StoryBook + rotating phrase, journal chrome parity.
 * Wave 39: shared `.book-spread-header-*` classes + amber spotlight above open book.
 * Wave 40: rendered outside `auth-book-enter-shell` so fixed chrome never flashes on the book.
 * Positioning driven by `.auth-route-viewport` rules in globals.css.
 */
import Image from "next/image";
import { RotatingTypewriterText } from "@/components/animations/RotatingTypewriterText";
import {
  BOOK_BRAND_DESC_INLINE_STYLE,
  BOOK_BRAND_GOLD_TEXT_STYLE,
  BOOK_BRAND_SEPARATOR_STYLE,
} from "@/lib/book-brand-styles";
import { authStaggerRowProps } from "@/lib/auth-stagger";

/** Rotating subtitle phrases — login and register share one header row */
export const AUTH_BRAND_PHRASES = [
  "Your story, your words",
  "Begin a new chapter",
  "Every memory preserved",
  "Write. Reflect. Remember.",
] as const;

export function AuthSpreadHeader() {
  return (
    <div className="book-spread-header-wrap auth-spread-header-wrap">
      <div aria-hidden className="book-spread-header-spotlight" />
      <div className="book-spread-header-row">
        <div className="book-spread-header-title-row">
          <span
            {...authStaggerRowProps(0, { className: "book-spread-header-icon" })}
          >
            <Image
              src="/dairy-1.svg"
              alt=""
              width={20}
              height={20}
              unoptimized
              className="shrink-0 object-contain"
              style={{ width: 20, height: 20, display: "block" }}
              priority
            />
          </span>
          <span
            {...authStaggerRowProps(1, {
              className: "book-spread-header-title",
              style: BOOK_BRAND_GOLD_TEXT_STYLE,
            })}
          >
            StoryBook
          </span>
        </div>
        <span
          {...authStaggerRowProps(1, {
            className: "book-spread-header-sep",
            style: BOOK_BRAND_SEPARATOR_STYLE,
          })}
          aria-hidden
        >
          ·
        </span>
        <RotatingTypewriterText
          {...authStaggerRowProps(2, {
            className: "book-spread-header-desc auth-spread-header-phrase",
            style: {
              ...BOOK_BRAND_DESC_INLINE_STYLE,
              minHeight: "1.2em",
              minWidth: "clamp(120px, 28vw, 240px)",
            },
          })}
          texts={[...AUTH_BRAND_PHRASES]}
          noShine
        />
      </div>
    </div>
  );
}
