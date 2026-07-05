"use client";

/**
 * PageFlipOverlay — 3-D page-turn effect.
 *
 * Renders as a direct sibling of LeftPage and RightPage inside the flex +
 * preserve-3d container so it inherits the correct perspective context.
 *
 * Inherits all `--theme-*` CSS vars from the BookSpread wrapper (Wave 31/32) —
 * no theme props; flip sheet paper/lines/seam match the active Page Theme.
 *
 * Front face = right-page paper (the page being turned away).
 * Back face  = left-page paper (reverse side visible mid-turn).
 *
 * Both faces carry ruled-line + margin-line textures for realism.
 * Depth uses **dual animations** on the flip root: linear rotateY (even speed) +
 * ease-in-out box-shadow only (subtle lift at seam). Decoupling avoids the Wave 11
 * “kick” from 50% transform + eased rotation + coil pulse.
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
import {
  JOURNAL_FLIP_SEAM_EDGE,
  JOURNAL_PAGE_INSET_SHADOW_RIGHT,
  JOURNAL_PAGE_LEFT_BG,
  JOURNAL_PAGE_RIGHT_BG,
  journalMarginLineLayerStyle,
  journalRuledLinesLayerStyle,
} from "@/lib/journal-page-styles";

interface PageFlipProps {
  direction: FlipDirection;
}

/** Ruled lines + margin on flip faces — same layers as LeftPage */
function FlipPageTexture() {
  return (
    <>
      <div style={journalRuledLinesLayerStyle} />
      <div style={journalMarginLineLayerStyle} />
    </>
  );
}

export function PageFlipOverlay({ direction }: PageFlipProps) {
  return (
    <>
      {/* Rotation keyframes stay inline; shadow keyframes live in globals.css (theme vars) */}
      <style>{`
        @keyframes flipFwdRotate {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(-180deg); }
        }
        @keyframes flipBwdRotate {
          from { transform: rotateY(-180deg); }
          to   { transform: rotateY(0deg); }
        }
        .flip-fwd {
          animation:
            flipFwdRotate .65s linear forwards,
            flipFwdShadow .65s ease-in-out forwards;
        }
        .flip-bwd {
          animation:
            flipBwdRotate .65s linear forwards,
            flipBwdShadow .65s ease-in-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .flip-fwd {
            animation: flipFwdRotate .65s linear forwards;
            box-shadow: var(--theme-flip-shadow-rest, 2px 0 10px rgba(80,40,10,.10));
          }
          .flip-bwd {
            animation: flipBwdRotate .65s linear forwards;
            box-shadow: var(--theme-flip-shadow-rest, 2px 0 10px rgba(80,40,10,.10));
          }
        }
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
            background: JOURNAL_FLIP_SEAM_EDGE,
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
          background: JOURNAL_PAGE_RIGHT_BG,
          boxShadow: JOURNAL_PAGE_INSET_SHADOW_RIGHT,
          overflow: "hidden",
        }}>
          <FlipPageTexture />
        </div>
        {/* Back face — left-page paper */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          borderRadius: "4px 0 0 4px",
          background: JOURNAL_PAGE_LEFT_BG,
          overflow: "hidden",
        }}>
          <FlipPageTexture />
        </div>
      </div>
    </>
  );
}
