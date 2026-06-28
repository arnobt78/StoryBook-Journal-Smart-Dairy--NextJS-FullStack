"use client";

/**
 * AuthBookShell — wraps /login and /register in a two-page open-book spread.
 *
 * Key design decisions:
 *  1. No opacity-driven intro wrapper. The old approach (`opacity: 0 → 1` via React
 *     state + useEffect) created a temporary stacking context (opacity < 1) that
 *     flattened the inner `preserve-3d` context on every page load. It's replaced
 *     with a pure-CSS `auth-shell-root` keyframe that completes in 500ms and
 *     produces no stacking context once finished.
 *
 *  2. Spread layout: **spine (cover edge) | left page | right page** — the brown strip is
 *     the outer binding on the left (like a closed cover edge), not a bar between the
 *     two leaves. The gutter is paper + inset shadows only. Row depth is a single soft
 *     `box-shadow` — no parent `filter` (avoids 3-D edge jitter).
 *
 *  3. Spread transform is `perspective` only (no rotateX/Y on the row): those tilts
 *     with `preserve-3d` caused sub-pixel “vibrating” strokes after the flip sheet
 *     unmounted. Pointer-events: `none` on page shells + `auto` on inner stacks (same
 *     pattern as dashboard). Row stagger via `.auth-stagger` / `.auth-right-stagger`.
 *
 *  4. Route push fires at flip START (prefetched); hold cover masks slow RSC; rows
 *     stagger in when `contentReady` (no post-flip source-page flash).
 *
 * ── WALKTHROUGH: auth book shell + page flip ──
 *  3D BOOK — spine | left marketing | right form; `preserve-3d` without row tilt.
 *  PAGE FLIP — login ↔ register uses same `PageFlipOverlay` as journal; `router.push`
 *    at flip start; `.auth-page-hold-cover` until pathname matches navTarget.
 *  AUTH FORMS — `{children}` is LoginForm or RegisterForm on the right page only.
 */
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Zap } from "lucide-react";
import { PageFlipOverlay } from "@/components/journal/PageFlip";
import { usePageFlip } from "@/hooks/usePageFlip";
import { RippleButton } from "@/components/ui/ripple-button";
import { RotatingTypewriterText } from "@/components/animations/RotatingTypewriterText";

/** Branding subtitle phrases — cycle beneath the "StoryBook" label above the open spread */
const AUTH_BRAND_PHRASES = [
  "Your story, your words",
  "Begin a new chapter",
  "Every memory preserved",
  "Write. Reflect. Remember.",
] as const;

/** Shared Dancing Script branding — title + inline rotating subtitle use identical size */
const AUTH_BRAND_TEXT_STYLE: CSSProperties = {
  fontFamily: "'Dancing Script', cursive",
  fontWeight: 700,
  fontStyle: "italic",
  fontSize: "20px",
  color: "rgba(255,205,120,.92)",
  letterSpacing: "0.02em",
  textShadow:
    "0 0 22px rgba(255,165,60,.5), 0 2px 8px rgba(0,0,0,.45)",
  lineHeight: 1.2,
};

/** Radial amber orb behind left-page Lucide icon — sibling blur, not on preserve-3d parent */
const AUTH_LEFT_ICON_SPOTLIGHT: CSSProperties = {
  position: "absolute",
  width: "52px",
  height: "52px",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background:
    "radial-gradient(ellipse at 50% 50%, rgba(255,165,55,.32) 0%, rgba(255,130,35,.14) 48%, transparent 72%)",
  filter: "blur(14px)",
  borderRadius: "50%",
  pointerEvents: "none",
};

const AUTH_LEFT_ICON_STYLE: CSSProperties = {
  width: 28,
  height: 28,
  color: "rgba(160,85,20,.82)",
  filter:
    "drop-shadow(0 0 10px rgba(255,155,50,.42)) drop-shadow(0 1px 5px rgba(120,60,10,.28))",
  display: "block",
  position: "relative",
  zIndex: 1,
};

const BOOK_COLOR = "#8b4513";

type AuthRoute = "/login" | "/register";

function normalizeAuthPath(p: string): string {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

export function AuthBookShell({ children }: { children: ReactNode }) {
  const pathname = normalizeAuthPath(usePathname());
  const router = useRouter();
  const { isFlipping, flipDir, triggerFlip } = usePageFlip();

  /** Destination route while cross-auth navigation is in flight */
  const [navTarget, setNavTarget] = useState<AuthRoute | null>(null);
  /** Source pathname for left-page copy during the flip animation */
  const [flipSourcePath, setFlipSourcePath] = useState<string | null>(null);

  /** Warm the opposite auth route so RSC payload is ready when the flip starts. */
  useEffect(() => {
    if (pathname === "/login") router.prefetch("/register");
    if (pathname === "/register") router.prefetch("/login");
  }, [pathname, router]);

  /** Clear nav lock once Next.js pathname matches the pushed destination */
  useEffect(() => {
    if (navTarget && pathname === navTarget) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- router pathname sync
      setNavTarget(null);
    }
  }, [pathname, navTarget]);

  /**
   * Navigate to /register (forward flip).
   * Push at flip start; hold cover + hidden content until RSC settles; then stagger in.
   */
  const goRegister = () => {
    if (pathname === "/register" || isFlipping) return;
    setFlipSourcePath(pathname);
    setNavTarget("/register");
    router.push("/register");
    triggerFlip("fwd", () => {
      setFlipSourcePath(null);
    });
  };

  /**
   * Navigate to /login (backward flip).
   * Same early-push + hold-cover pattern as goRegister.
   */
  const goLogin = () => {
    if (pathname === "/login" || isFlipping) return;
    setFlipSourcePath(pathname);
    setNavTarget("/login");
    router.push("/login");
    triggerFlip("bwd", () => {
      setFlipSourcePath(null);
    });
  };

  const awaitingRoute = navTarget !== null && pathname !== navTarget;
  const contentReady = !isFlipping && !awaitingRoute;
  const displayPath =
    isFlipping && flipSourcePath ? flipSourcePath : pathname;
  const leftIsRegister = displayPath === "/register";

  /* While a cross-auth navigation is in flight, keep footer controls idle. */
  const authNavBusy = isFlipping || awaitingRoute;

  /* Footer link shows the OPPOSITE of current pathname */
  const showRegisterLink = pathname === "/login";

  return (
    /* Render the book directly — no wrapper animation div.
       Any animated wrapper with animation-fill-mode:forwards retains a
       transform permanently after completion, creating a compositing layer
       that breaks pointer-event routing for preserve-3d descendants inside. */
    <div>
    {/* No `filter` here: parent filter + child `preserve-3d` repaints every frame and
        reads as edge “vibration” after the flip overlay unmounts; shadow lives on spread. */}
    <div style={{ position: "relative" }}>
          {/* Book branding block — StoryBook + rotating phrase inline on one row (wraps on narrow viewports) */}
          <div
            className="auth-stagger"
            key={pathname}
            style={{
              position: "absolute",
              top: "-48px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "0 8px",
              maxWidth:
                "min(96vw, calc(var(--page-w, 360px) * 2 + var(--spine-w, 22px) + 40px))",
              pointerEvents: "none",
            }}
          >
            <span style={AUTH_BRAND_TEXT_STYLE}>StoryBook</span>
            <span
              aria-hidden
              style={{ ...AUTH_BRAND_TEXT_STYLE, opacity: 0.5 }}
            >
              ·
            </span>
            {/* Inline rotating phrase — same 20px Dancing Script as title; minWidth limits layout shift */}
            <RotatingTypewriterText
              texts={[...AUTH_BRAND_PHRASES]}
              noShine
              style={{
                ...AUTH_BRAND_TEXT_STYLE,
                whiteSpace: "nowrap",
                minHeight: "1.2em",
                minWidth: "clamp(140px, 22vw, 240px)",
              }}
            />
          </div>

          {/* Center spotlight — radial leather glow behind and AROUND the open diary layout.
              Size exceeds book footprint by ~280px h / 200px v so the halo extends visibly
              beyond the book edges. zIndex:0 keeps it behind the spread (zIndex:1). */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "calc(var(--page-w, 360px) * 2 + var(--spine-w, 22px) + 280px)",
              height: "calc(var(--page-h, 540px) + 200px)",
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(139,69,19,.42) 0%, rgba(90,40,10,.24) 40%, transparent 65%)",
              filter: "blur(50px)",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Book spread: `pointer-events: none` on the 3-D row; order is spine | left | right
              so leather reads as the outer left binding, not a brown bar mid-spread.
              Perspective only — no rotateX/Y on this row. Inner page stacks use `auto`.
              auth-book-glow: adds ambient leather box-shadow around the outer layout. */}
          <div
            className="auth-book-glow"
            style={{
              display: "flex",
              alignItems: "stretch",
              transformStyle: "preserve-3d",
              transform: "perspective(2400px)",
              position: "relative",
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            {/* Outer spine / cover edge — left background strip (not center gutter). */}
            <div
              style={{
                width: "var(--spine-w, 22px)",
                flexShrink: 0,
                alignSelf: "stretch",
                zIndex: 6,
                pointerEvents: "none",
                borderRadius: "4px 0 0 4px",
                background: `linear-gradient(180deg,
                  color-mix(in srgb,${BOOK_COLOR} 30%,#000) 0%,
                  ${BOOK_COLOR} 50%,
                  color-mix(in srgb,${BOOK_COLOR} 30%,#000) 100%)`,
                boxShadow:
                  "inset 2px 0 4px rgba(0,0,0,.25), inset -2px 0 4px rgba(0,0,0,.25)",
              }}
            />

            {/* ── LEFT PAGE ── */}
            {/* `pointer-events: none` on this full-size shell: under `preserve-3d` + perspective,
                browsers use an axis-aligned bounding box for hit-testing each rotated page plane,
                which can grow past the visible card and steal clicks meant for the right page.
                Inner wrappers restore `auto` only where we need real interaction. */}
            <div
              style={{
                width: "var(--page-w, 360px)",
                height: "var(--page-h, 540px)",
                position: "relative",
                background:
                  "linear-gradient(to right, #ede1cc 0%, #f4ecda 60%, #ede0c8 100%)",
                borderRadius: "0",
                boxShadow:
                  "inset -12px 0 20px rgba(120,70,20,.14), inset 3px 0 8px rgba(200,160,100,.08)",
                flexShrink: 0,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              {/* Ruled lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(transparent,transparent 27px,rgba(120,80,30,.1) 27px,rgba(120,80,30,.1) 28px)",
                  backgroundPosition: "0 52px",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Margin line */}
              <div
                style={{
                  position: "absolute",
                  left: "58px",
                  top: 0,
                  bottom: 0,
                  width: "1px",
                  background: "rgba(220,100,80,.18)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Right curl shadow */}
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: "28px",
                  background:
                    "linear-gradient(to left,rgba(100,50,10,.12) 0%,transparent 100%)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  position: "relative",
                  /* Below the right-hand form column’s stacking for portaled menus (see globals). */
                  zIndex: 2,
                  height: "100%",
                  padding: "28px 24px 32px 72px",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  pointerEvents: "auto",
                }}
              >
                {/* Left marketing copy — row stagger when contentReady (translateY, not opacity-only) */}
                <div
                  className={contentReady ? "auth-stagger" : undefined}
                  key={pathname}
                  style={{
                    flex: "1 1 auto",
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    visibility: contentReady ? "visible" : "hidden",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'IM Fell English',serif",
                      fontSize: "10px",
                      letterSpacing: "3px",
                      color: "rgba(100,55,20,.45)",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {leftIsRegister ? "New chapter" : "Returning reader"}
                  </p>
                  {/* Left-page icon — Sparkles (register) / Zap (login) with amber spotlight orb */}
                  <div
                    style={{
                      position: "relative",
                      marginTop: "10px",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-hidden
                  >
                    <div style={AUTH_LEFT_ICON_SPOTLIGHT} />
                    {leftIsRegister ? (
                      <Sparkles
                        style={AUTH_LEFT_ICON_STYLE}
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Zap style={AUTH_LEFT_ICON_STYLE} strokeWidth={1.5} />
                    )}
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontStyle: "italic",
                      fontSize: "22px",
                      color: "rgba(35,14,3,.88)",
                      margin: "12px 0 0",
                      lineHeight: 1.2,
                    }}
                  >
                    {leftIsRegister ? "Your story awaits" : "Welcome back"}
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: "12px",
                      fontStyle: "italic",
                      color: "rgba(100,55,20,.55)",
                      marginTop: "12px",
                      lineHeight: 1.65,
                    }}
                  >
                    {leftIsRegister
                      ? "Every great story begins somewhere. Inscribe your name and step onto the first page."
                      : "Pick up where you left off — your shelves and entries rest quietly until you return."}
                  </p>
                  <div
                    style={{
                      marginTop: "18px",
                      fontSize: "11px",
                      color: "rgba(120,70,30,.3)",
                      letterSpacing: "6px",
                    }}
                    aria-hidden
                  >
                    ◆ ◆ ◆
                  </div>
                </div>

                {/* Footer navigation — outside stagger so it's never hidden during delay */}
                <div
                  style={{
                    flexShrink: 0,
                    paddingTop: "20px",
                    position: "relative",
                    zIndex: 8,
                    pointerEvents: "auto",
                  }}
                >
                  {showRegisterLink ? (
                    <p
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: "12px",
                        color: "rgba(100,55,20,.55)",
                        margin: 0,
                      }}
                    >
                      No account yet?{" "}
                      <RippleButton
                        type="button"
                        onClick={goRegister}
                        disabled={authNavBusy}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: authNavBusy ? "default" : "pointer",
                          color: "rgba(139,69,19,.85)",
                          textDecoration: "underline",
                          fontFamily: "'Lora',serif",
                          fontSize: "12px",
                        }}
                      >
                        Start your story
                      </RippleButton>
                    </p>
                  ) : (
                    <p
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: "12px",
                        color: "rgba(100,55,20,.55)",
                        margin: 0,
                      }}
                    >
                      Already have an account?{" "}
                      <RippleButton
                        type="button"
                        onClick={goLogin}
                        disabled={authNavBusy}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: authNavBusy ? "default" : "pointer",
                          color: "rgba(139,69,19,.85)",
                          textDecoration: "underline",
                          fontFamily: "'Lora',serif",
                          fontSize: "12px",
                        }}
                      >
                        Open your journal
                      </RippleButton>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT PAGE ── */}
            {/* Same hit-testing rationale as the left page shell (see comment above). */}
            <div
              style={{
                width: "var(--page-w, 360px)",
                height: "var(--page-h, 540px)",
                position: "relative",
                background:
                  "linear-gradient(to left, #e8dcc9 0%, #f4ecda 60%, #ede0c8 100%)",
                borderRadius: "0 4px 4px 0",
                boxShadow: "inset 10px 0 24px rgba(120,70,20,.1)",
                flexShrink: 0,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              {/* Ruled lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(transparent,transparent 27px,rgba(120,80,30,.1) 27px,rgba(120,80,30,.1) 28px)",
                  backgroundPosition: "0 52px",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Left curl */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "28px",
                  background:
                    "linear-gradient(to right,rgba(100,50,10,.1) 0%,transparent 100%)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              {/* Right-page content — explicit pointerEvents:auto ensures form fields
                  receive events regardless of any inherited pointer-events quirks.
                  Higher z-index than the left column so popovers are not covered by
                  the left page’s 3-D hit slab; `overflowY: visible` so fixed/absolute
                  menus from `LoginForm` are not clipped by this scrollport. */}
              <div
                style={{
                  position: "relative",
                  zIndex: 12,
                  height: "100%",
                  overflowY: "hidden",
                  overflowX: "hidden",
                  padding: "24px 28px 24px 24px",
                  boxSizing: "border-box",
                  pointerEvents: "auto",
                  scrollbarWidth: "none",
                }}
                className="auth-right-scroll"
              >
                <div
                  className={contentReady ? "auth-right-stagger" : undefined}
                  key={pathname}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    flex: 1,
                    visibility: contentReady ? "visible" : "hidden",
                  }}
                >
                  {children}
                </div>
              </div>
            </div>

            {/* Paper hold — masks right page until destination RSC renders after flip */}
            {awaitingRoute && !isFlipping && (
              <div aria-hidden className="auth-page-hold-cover" />
            )}

            {/* Page flip overlay — sibling of pages, same preserve-3d parent.
                position:relative on this container ensures top:0;right:0 lands
                on the right page's area, not the outer title/shadow wrapper. */}
            {/* ── PAGE FLIP: same overlay component as journal BookSpread ── */}
            {isFlipping && flipDir && <PageFlipOverlay direction={flipDir} />}
          </div>
    </div>
    </div>
  );
}
