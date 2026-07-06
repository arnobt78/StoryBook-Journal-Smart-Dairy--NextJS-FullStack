/**
 * @file hooks/usePageFlip.ts
 *
 * WALKTHROUGH — usePageFlip
 *
 * Hook lifecycle:
 *   mount → idle (`isFlipping=false`, `flipDir=null`)
 *   triggerFlip(dir) → ref guard + state → CSS overlay animates FLIP_MS
 *   onComplete at FLIP_MS; overlay unmounts after SETTLE_MS for seam handoff
 *   resetFlip() → abort timer if route unmounts mid-animation
 *
 * usePageFlip — shared page-flip state for BookSpread and AuthBookShell.
 *
 * Uses a synchronous `flippingRef` as the re-entrancy guard rather than reading
 * `isFlipping` state, which can lag one frame under React 18/19 batching.
 * This prevents double-flip on rapid clicks or Strict-Mode double-invoke.
 *
 * FLIP_MS must stay in sync with the CSS keyframe duration in PageFlipOverlay.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import type { FlipDirection } from "@/types";

interface UsePageFlipReturn {
  isFlipping: boolean;
  flipDir: FlipDirection | null;
  triggerFlip: (dir: FlipDirection, onComplete?: () => void) => void;
  resetFlip: () => void;
}

/** Must match the animation duration in PageFlip.tsx CSS keyframes. */
const FLIP_MS = 650;
/** Brief hold after animation so coil seam stays continuous before overlay unmounts. */
const SETTLE_MS = 80;

export function usePageFlip(): UsePageFlipReturn {
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<FlipDirection | null>(null);
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Synchronous ref guard — state reads inside closures can be stale
   * for an entire render cycle under React 19 concurrent batching.
   */
  const flippingRef = useRef(false);

  const triggerFlip = useCallback((dir: FlipDirection, onComplete?: () => void) => {
    /* Re-entrancy guard: second call while flip is in progress is a no-op */
    if (flippingRef.current) return;
    flippingRef.current = true;
    setFlipDir(dir);
    setIsFlipping(true);

    if (flipTimer.current) clearTimeout(flipTimer.current);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    flipTimer.current = setTimeout(() => {
      onComplete?.();
      settleTimer.current = setTimeout(() => {
        flippingRef.current = false;
        setIsFlipping(false);
        setFlipDir(null);
        flipTimer.current = null;
        settleTimer.current = null;
      }, SETTLE_MS);
    }, FLIP_MS);
  }, []);

  /** Force-reset if a navigation unmount cut the animation short. */
  const resetFlip = useCallback(() => {
    if (flipTimer.current) {
      clearTimeout(flipTimer.current);
      flipTimer.current = null;
    }
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    flippingRef.current = false;
    setIsFlipping(false);
    setFlipDir(null);
  }, []);

  return { isFlipping, flipDir, triggerFlip, resetFlip };
}
