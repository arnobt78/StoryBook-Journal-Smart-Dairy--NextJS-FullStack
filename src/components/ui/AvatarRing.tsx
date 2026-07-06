/**
 * @file components/ui/AvatarRing.tsx
 *
 * WALKTHROUGH — Leather-glass glow ring around profile/demo avatars
 * ────────────────────────────────────────────────────────────────
 */
"use client";

/**
 * Robohash / avatar inside a leather glass ring — used in nav and demo picker.
 */
import { SafeImage } from "@/components/ui/safe-image";
import { robohashUrl } from "@/lib/robohash";
import { cn } from "@/lib/utils";

type AvatarRingProps = {
  src?: string | null;
  seed: string;
  size: number;
  alt?: string;
  className?: string;
  unoptimized?: boolean;
};

export function AvatarRing({
  src,
  seed,
  size,
  alt = "",
  className,
  unoptimized = false,
}: AvatarRingProps) {
  const imageSrc = src ?? robohashUrl(seed, size * 2);
  const fallback = src ? robohashUrl(seed, size * 2) : undefined;

  return (
    <span
      className={cn("leather-avatar-ring", className)}
      style={{ width: size, height: size }}
    >
      <SafeImage
        src={imageSrc}
        fallbackSrc={fallback}
        alt={alt}
        width={size}
        height={size}
        unoptimized={unoptimized}
        referrerPolicy="no-referrer"
        className="h-full w-full rounded-full object-cover"
        style={{ borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
    </span>
  );
}
