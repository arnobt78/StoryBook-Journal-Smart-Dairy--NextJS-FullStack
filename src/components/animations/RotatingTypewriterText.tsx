"use client";

/**
 * RotatingTypewriterText — cycles through an array of phrases with a
 * type → hold → erase → next phrase animation loop.
 *
 * Visual behaviour:
 *   - `.text-shine` gold shimmer applies always (background-clip:text)
 *   - `.breathe` pulse applies during "holding" phase (matches TypewriterText contract)
 *   - Cursor `|` visible during "typing" and "erasing" phases
 *   - `aria-live="polite"` announces each completed phrase to screen readers
 *
 * Used on the landing cover hint and the auth page branding subtitle.
 */
import type { CSSProperties } from "react";
import { useRotatingTypewriter } from "@/hooks/useRotatingTypewriter";

type RotatingTypewriterTextProps = {
  /** Phrases to cycle through — must have at least one entry */
  texts: string[];
  /** When true, freeze on pausedText (e.g. cover is opening) */
  paused?: boolean;
  /** Static text shown while paused */
  pausedText?: string;
  style?: CSSProperties;
  className?: string;
  /** Hide the gold shimmer (useful for small subtitle variants) */
  noShine?: boolean;
};

export function RotatingTypewriterText({
  texts,
  paused = false,
  pausedText,
  style,
  className,
  noShine = false,
}: RotatingTypewriterTextProps) {
  const { display, phase } = useRotatingTypewriter(texts, {
    enabled: !paused,
  });

  const shown = paused ? (pausedText ?? texts[0] ?? "") : display;

  /* Cursor visible while actively typing or erasing */
  const showCursor = !paused && (phase === "typing" || phase === "erasing");

  /* breathe pulse while the phrase is fully shown (holding phase) */
  const isHolding = !paused && phase === "holding";

  return (
    <div
      className={[
        noShine ? "" : "text-shine",
        isHolding ? "breathe" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      /* Announce the visible phrase when it completes */
      aria-live="polite"
      aria-label={texts.join(", ")}
    >
      {shown}
      {showCursor && (
        <span className="typewriter-cursor" aria-hidden>
          |
        </span>
      )}
    </div>
  );
}
