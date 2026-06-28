"use client";

/**
 * PageFlipOverlay — 3-D page-turn effect.
 *
 * Renders as a direct sibling of LeftPage and RightPage inside the flex +
 * preserve-3d container so it inherits the correct perspective context.
 *
 * Front face = right-page paper (the page being turned away).
 * Back face  = left-page paper (reverse side visible mid-turn).
 *
 * Both faces carry ruled-line + margin-line textures for realism.
 * Depth cue is a static `box-shadow` on the flip root only — animating `filter` on
 * the same layer as `transform` caused post-flip edge shimmer / “vibration” next to
 * real pages once the overlay unmounted (especially under a parent `filter`).
 *
 * Width matches --page-w CSS variable; falls back to 360px.
 *
 * ── WALKTHROUGH: how page flip works ──
 *  1. Parent calls `triggerFlip(dir, onComplete)` from `usePageFlip` hook.
 *  2. This overlay mounts with `flip-fwd` or `flip-bwd` keyframe (rotateY 0 → ±180°).
 *  3. `transform-origin: left center` pivots on the spine edge of the right page.
 *  4. Front face = right paper; back face = left paper (pre-rotated rotateY(180deg)).
 *  5. On animation end, hook unmounts overlay and runs onComplete (swap entry / router.push).
 */
import type { FlipDirection } from "@/types";

interface PageFlipProps {
  direction: FlipDirection;
}

/** Ruled lines + red margin line applied to both faces of the flip sheet */
function RuledLinesTexture() {
  return (
    <>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(transparent,transparent 27px,rgba(120,80,30,.08) 27px,rgba(120,80,30,.08) 28px)",
        backgroundPosition: "0 52px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", left: "58px", top: 0, bottom: 0, width: "1px",
        background: "rgba(220,100,80,.12)", pointerEvents: "none",
      }} />
    </>
  );
}

export function PageFlipOverlay({ direction }: PageFlipProps) {
  return (
    <>
      <style>{`
        /* ── PAGE FLIP keyframes: rotateY on spine edge (see file header) ── */
        @keyframes flipFwd {
          0%   { transform: rotateY(0deg);   box-shadow: 2px 0 8px rgba(80,40,10,.08); }
          50%  { transform: rotateY(-90deg); box-shadow: -8px 0 24px rgba(40,20,5,.22), 4px 0 12px rgba(80,40,10,.14); }
          100% { transform: rotateY(-180deg); box-shadow: 2px 0 8px rgba(80,40,10,.08); }
        }
        @keyframes flipBwd {
          0%   { transform: rotateY(-180deg); box-shadow: 2px 0 8px rgba(80,40,10,.08); }
          50%  { transform: rotateY(-90deg);  box-shadow: -8px 0 24px rgba(40,20,5,.22), 4px 0 12px rgba(80,40,10,.14); }
          100% { transform: rotateY(0deg);    box-shadow: 2px 0 8px rgba(80,40,10,.08); }
        }
        .flip-fwd { animation: flipFwd .65s cubic-bezier(.45,.05,.25,1) forwards; }
        .flip-bwd { animation: flipBwd .65s cubic-bezier(.45,.05,.25,1) forwards; }
      `}</style>
      <div
        className={direction === "fwd" ? "flip-fwd" : "flip-bwd"}
        style={{
          position: "absolute", top: 0, right: 0,
          width: "var(--page-w, 360px)", height: "var(--page-h, 540px)",
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          pointerEvents: "none", zIndex: 30,
        }}
      >
        {/* Left seam edge — blends with SpreadCoilBinding during mid-turn */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "14px",
            background:
              "linear-gradient(to right, rgba(90,45,10,.14) 0%, rgba(100,50,10,.06) 40%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 3,
            transform: "translateZ(1px)",
          }}
        />
        {/* Front face — right-page paper */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          borderRadius: "0 4px 4px 0",
          background: "linear-gradient(to left, #e8dcc9 0%, #f4ecda 60%, #ede0c8 100%)",
          boxShadow: "inset 10px 0 24px rgba(120,70,20,.1)",
          overflow: "hidden",
        }}>
          <RuledLinesTexture />
        </div>
        {/* Back face — left-page paper */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          borderRadius: "4px 0 0 4px",
          background: "linear-gradient(to right, #ede1cc 0%, #f4ecda 60%, #ede0c8 100%)",
          overflow: "hidden",
        }}>
          <RuledLinesTexture />
        </div>
      </div>
    </>
  );
}
