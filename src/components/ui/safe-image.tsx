/**
 * @file components/ui/safe-image.tsx
 *
 * WALKTHROUGH — next/image with Robohash fallback chain
 * ─────────────────────────────────────────────────────
 * Tries optimizer → fallbackSrc → native img. Used by AvatarRing, demo picker.
 */
"use client";

/**
 * Remote image wrapper — next/image first, optional fallbackSrc (e.g. Robohash),
 * then native img when the optimizer fails.
 *
 * ── WALKTHROUGH: SafeImage fallback chain ──
 *  1. Render next/image with primary `src` (e.g. Google avatar URL).
 *  2. On error: if `fallbackSrc` set and not yet tried → swap to fallback (Robohash).
 *  3. If fallback also fails → `useNative` renders plain `<img>` (bypasses /_next/image).
 *  Used in DashboardNav: `src={user.image}` + `fallbackSrc={robohashUrl(seed)}`.
 */
import { cn } from "@/lib/utils";
import Image, { type ImageProps } from "next/image";
import { useCallback, useState, type SyntheticEvent } from "react";

type SafeImageProps = ImageProps & {
  /** Secondary URL when primary fails (Google avatar → Robohash) */
  fallbackSrc?: string;
};

export function SafeImage({
  alt,
  src,
  fallbackSrc,
  className,
  fill,
  width,
  height,
  onError,
  priority,
  loading,
  ...rest
}: SafeImageProps) {
  const [activeSrc, setActiveSrc] = useState<string | typeof src>(src);
  const [useNative, setUseNative] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const resolvedSrc = typeof activeSrc === "string" ? activeSrc : "";

  const handleError = useCallback(
    (e: SyntheticEvent<HTMLImageElement, Event>) => {
      onError?.(e);
      /* Step 2: try fallbackSrc once before giving up on next/image */
      if (fallbackSrc && !usedFallback && resolvedSrc !== fallbackSrc) {
        setUsedFallback(true);
        setActiveSrc(fallbackSrc);
        setUseNative(false);
        return;
      }
      /* Step 3: last resort — native img when optimizer or remote host blocks */
      if (resolvedSrc) setUseNative(true);
    },
    [fallbackSrc, onError, resolvedSrc, usedFallback],
  );

  const eager = Boolean(priority || loading === "eager");

  if (useNative && resolvedSrc) {
    /* Step 3 render path: native img bypasses next/image optimizer */
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- fallback when /_next/image fails
        <img
          alt={alt}
          src={resolvedSrc}
          className={cn("absolute inset-0 h-full w-full", className)}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          sizes={typeof rest.sizes === "string" ? rest.sizes : undefined}
          referrerPolicy={rest.referrerPolicy}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fallback when /_next/image fails
      <img
        alt={alt}
        src={resolvedSrc}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        className={cn(className)}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy={rest.referrerPolicy}
      />
    );
  }

  return (
    <Image
      {...rest}
      alt={alt}
      src={activeSrc}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      loading={loading}
      onError={handleError}
    />
  );
}
