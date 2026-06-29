/**
 * Cover icon catalog — Lucide icons stored in JournalBook.coverEmoji as slug ids.
 * Legacy unicode emojis are mapped at runtime via resolveCoverIconId().
 */
import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  BookMarked,
  BookOpen,
  Camera,
  Coffee,
  Compass,
  Feather,
  Flame,
  Flower2,
  Gem,
  Globe,
  Heart,
  Leaf,
  Mountain,
  Music,
  Palette,
  PenLine,
  Plane,
  Rainbow,
  Scroll,
  Sparkles,
  Star,
  Sun,
  TreePine,
  Waves,
  Zap,
  Moon,
} from "lucide-react";

export type CoverIconId =
  | "book-open"
  | "book-marked"
  | "feather"
  | "moon"
  | "flame"
  | "coffee"
  | "music"
  | "waves"
  | "heart"
  | "leaf"
  | "star"
  | "pen-line"
  | "compass"
  | "sparkles"
  | "sun"
  | "mountain"
  | "plane"
  | "camera"
  | "palette"
  | "globe"
  | "tree-pine"
  | "flower"
  | "zap"
  | "rainbow"
  | "anchor"
  | "gem"
  | "scroll";

export const DEFAULT_COVER_ICON_ID: CoverIconId = "book-open";

export type CoverIconDef = {
  id: CoverIconId;
  label: string;
  Icon: LucideIcon;
};

export const COVER_ICONS: CoverIconDef[] = [
  { id: "book-open", label: "Open book", Icon: BookOpen },
  { id: "book-marked", label: "Bookmarked", Icon: BookMarked },
  { id: "feather", label: "Feather", Icon: Feather },
  { id: "pen-line", label: "Pen", Icon: PenLine },
  { id: "scroll", label: "Scroll", Icon: Scroll },
  { id: "moon", label: "Moon", Icon: Moon },
  { id: "sun", label: "Sun", Icon: Sun },
  { id: "star", label: "Star", Icon: Star },
  { id: "sparkles", label: "Sparkles", Icon: Sparkles },
  { id: "flame", label: "Flame", Icon: Flame },
  { id: "heart", label: "Heart", Icon: Heart },
  { id: "leaf", label: "Leaf", Icon: Leaf },
  { id: "flower", label: "Flower", Icon: Flower2 },
  { id: "tree-pine", label: "Pine", Icon: TreePine },
  { id: "coffee", label: "Coffee", Icon: Coffee },
  { id: "music", label: "Music", Icon: Music },
  { id: "waves", label: "Waves", Icon: Waves },
  { id: "compass", label: "Compass", Icon: Compass },
  { id: "mountain", label: "Mountain", Icon: Mountain },
  { id: "plane", label: "Travel", Icon: Plane },
  { id: "camera", label: "Camera", Icon: Camera },
  { id: "palette", label: "Palette", Icon: Palette },
  { id: "globe", label: "Globe", Icon: Globe },
  { id: "zap", label: "Energy", Icon: Zap },
  { id: "rainbow", label: "Rainbow", Icon: Rainbow },
  { id: "anchor", label: "Anchor", Icon: Anchor },
  { id: "gem", label: "Gem", Icon: Gem },
];

const COVER_ICON_BY_ID = new Map(COVER_ICONS.map((c) => [c.id, c]));

/** Legacy emoji → slug (Prisma coverEmoji column may still hold unicode) */
const LEGACY_EMOJI_TO_ID: Record<string, CoverIconId> = {
  "📖": "book-open",
  "📔": "book-marked",
  "📒": "book-marked",
  "📓": "book-marked",
  "📕": "book-open",
  "📗": "book-open",
  "📘": "book-open",
  "📙": "book-open",
  "✨": "sparkles",
  "🌙": "moon",
  "🌿": "leaf",
  "❤️": "heart",
  "🔥": "flame",
  "☕": "coffee",
  "🎵": "music",
  "🌊": "waves",
  "✈️": "plane",
};

export function resolveCoverIconId(raw: string): CoverIconId {
  if (COVER_ICON_BY_ID.has(raw as CoverIconId)) {
    return raw as CoverIconId;
  }
  const mapped = LEGACY_EMOJI_TO_ID[raw];
  if (mapped) return mapped;
  return DEFAULT_COVER_ICON_ID;
}

export function getCoverIconDef(id: string): CoverIconDef {
  return COVER_ICON_BY_ID.get(resolveCoverIconId(id)) ?? COVER_ICONS[0];
}

export function isAllowedCoverIcon(raw: string): boolean {
  if (COVER_ICON_BY_ID.has(raw as CoverIconId)) return true;
  return raw in LEGACY_EMOJI_TO_ID;
}

export const COVER_ICON_IDS = COVER_ICONS.map((c) => c.id);
