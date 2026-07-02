"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { BookOpen } from "lucide-react";
import { TypewriterText } from "@/components/animations/TypewriterText";
import { LOGOUT_ANIMATION_VARS } from "@/lib/logout-book-close";

/**
 * Sign-out overlay — hinge close + orbit; page stack + cover-back (stable, no fold layer).
 */
type LogoutBookCloseOverlayProps = {
  active: boolean;
};

export function LogoutBookCloseOverlay({ active }: LogoutBookCloseOverlayProps) {
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  if (!active) return null;

  return (
    <div
      className="book-close-overlay logout-book-close-overlay landing-cover-viewport logout-cover-viewport"
      style={LOGOUT_ANIMATION_VARS as CSSProperties}
      aria-hidden
    >
      <div className="logout-ambient-glow" />
      <div className="logout-book-spotlight" />

      <div className="logout-book-column">
        <div className="logout-book-stage">
          <div className="logout-book-orbit">
            <div className="logout-book-body">
              <div className="logout-book-spine-fixed" aria-hidden />

              <div className="logout-book-leather-shell" aria-hidden>
                <div className="logout-cover-leather-texture" aria-hidden />
              </div>

              <div className="logout-page-stack">
                <div className="logout-page-ruled" aria-hidden />
                <div className="logout-right-page-inner">
                  <p className="logout-right-date">{todayLabel}</p>
                  <span className="logout-right-ornament" aria-hidden>
                    ✦
                  </span>
                  <p className="logout-right-headline">Your story begins today</p>
                  <p className="logout-right-body">
                    Every great story begins with a single word. Open your heart — let the pages
                    speak.
                  </p>
                </div>
              </div>

              <div className="logout-cover-hinge">
                <div className="logout-cover-front">
                  <div className="logout-cover-gold-border" aria-hidden />
                  <div className="logout-cover-leather-texture" aria-hidden />
                  <div className="logout-cover-title-stack">
                    <BookOpen className="logout-cover-icon" strokeWidth={1.5} aria-hidden />
                    <span className="logout-cover-brand">StoryBook</span>
                    <span className="logout-cover-subtitle">Journal</span>
                    <div className="logout-cover-rule" />
                  </div>
                </div>
                <div className="logout-cover-back">
                  <div className="logout-cover-back-exterior" aria-hidden>
                    <div className="logout-cover-leather-texture" aria-hidden />
                  </div>
                  <div className="logout-page-ruled" aria-hidden />
                  <div className="logout-left-page-inner">
                    <BookOpen className="logout-left-icon" strokeWidth={1.5} aria-hidden />
                    <p className="logout-left-welcome">Welcome</p>
                    <p className="logout-left-quote">
                      &ldquo;Not all who wander are lost, but all who write are found.&rdquo;
                    </p>
                    <div className="logout-left-rule" aria-hidden />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="logout-hint-wrap">
          <div className="logout-hint-spotlight" aria-hidden />
          <TypewriterText
            text="Closing your journal…"
            style={{
              marginTop: 0,
              fontFamily: "'IM Fell English', serif",
              fontStyle: "italic",
              fontSize: "clamp(13px, 3.5vw, 16px)",
              minHeight: "1.4em",
            }}
          />
        </div>
      </div>
    </div>
  );
}
