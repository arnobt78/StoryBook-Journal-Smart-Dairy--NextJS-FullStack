/**
 * Book spread themes — single source of truth for page backgrounds and ink tokens.
 * Consumed by `bookThemeCssVars()` → CSS custom properties on the spread wrapper.
 */
export type BookThemeId =
  | "warm-paper"
  | "dark-academia"
  | "midnight-journal"
  | "soft-minimal"
  | "vintage-diary";

export type BookThemeTokens = {
  id: BookThemeId;
  label: string;
  pageLeft: string;
  pageRight: string;
  /** Primary body ink — also aliased to `--theme-ink` for prose/editor */
  ink: string;
  inkMuted: string;
  accent: string;
  inkHeading: string;
  inkBody: string;
  inkLabel: string;
  inkMeta: string;
  inkPlaceholder: string;
  inkPreviewTitle: string;
  inkPreviewBody: string;
  inkListTitle: string;
  inkTag: string;
  inkTagBg: string;
  inkTagBorder: string;
  ruleLine: string;
  marginLine: string;
  borderSubtle: string;
  dividerGradient: string;
  dotActive: string;
  dotInactive: string;
  paperActionColor: string;
  paperActionBorder: string;
  paperActionHover: string;
  paperActionDestructiveColor: string;
  paperActionDestructiveBorder: string;
  paperActionDestructiveHover: string;
  tagInputBg: string;
  tagInputBorder: string;
  tagInputColor: string;
  pageInsetShadowLeft: string;
  pageInsetShadowRight: string;
  proseBlockquoteBorder: string;
  prosePlaceholder: string;
  proseCodeBg: string;
  prosePreBg: string;
  /** PageFlipOverlay — left seam strip on turning sheet */
  flipSeamEdge: string;
  /** PageFlipOverlay — box-shadow at flip start/end */
  flipShadowRest: string;
  /** PageFlipOverlay — box-shadow at mid-turn seam lift */
  flipShadowMid: string;
};

/** Warm-paper surface tokens — baseline for light themes and CSS var fallbacks */
const WARM_PAPER_SURFACE = {
  inkHeading: "rgba(35,14,3,.88)",
  inkBody: "rgba(100,55,20,.55)",
  inkLabel: "rgba(100,55,20,.45)",
  inkMeta: "rgba(100,55,20,.55)",
  inkPlaceholder: "rgba(100,55,20,.45)",
  inkPreviewTitle: "rgba(45,20,5,.72)",
  inkPreviewBody: "rgba(55,28,8,.55)",
  inkListTitle: "rgba(45,20,5,.78)",
  inkTag: "rgba(110,60,22,.72)",
  inkTagBg: "rgba(120,70,20,.09)",
  inkTagBorder: "rgba(120,70,20,.22)",
  ruleLine: "rgba(120,80,30,.1)",
  marginLine: "rgba(220,100,80,.18)",
  borderSubtle: "rgba(120,70,20,.12)",
  dividerGradient: "linear-gradient(to right,rgba(120,70,20,.25),transparent)",
  dotActive: "rgba(170,90,30,.75)",
  dotInactive: "rgba(120,70,20,.2)",
  paperActionColor: "rgba(100,55,20,.55)",
  paperActionBorder: "rgba(120,70,20,.2)",
  paperActionHover: "rgba(35,14,3,.88)",
  paperActionDestructiveColor: "rgba(140,50,30,.6)",
  paperActionDestructiveBorder: "rgba(140,50,30,.25)",
  paperActionDestructiveHover: "rgba(90,25,15,.92)",
  tagInputBg: "rgba(120,70,20,.07)",
  tagInputBorder: "rgba(120,70,20,.18)",
  tagInputColor: "rgba(45,20,5,.75)",
  pageInsetShadowLeft: "inset -10px 0 24px rgba(120,70,20,.12), inset 3px 0 8px rgba(200,160,100,.08)",
  pageInsetShadowRight: "inset 10px 0 24px rgba(120,70,20,.1)",
  proseBlockquoteBorder: "rgba(120,70,20,.3)",
  prosePlaceholder: "rgba(100,55,20,.28)",
  proseCodeBg: "rgba(120,70,20,.08)",
  prosePreBg: "rgba(35,14,3,.06)",
  flipSeamEdge:
    "linear-gradient(to right, rgba(90,45,10,.14) 0%, rgba(100,50,10,.06) 40%, transparent 100%)",
  flipShadowRest: "2px 0 10px rgba(80,40,10,.10)",
  flipShadowMid: "-5px 0 16px rgba(40,20,5,.16)",
} as const;

const DARK_ACADEMIA_SURFACE = {
  inkHeading: "rgba(230,210,170,.95)",
  inkBody: "rgba(200,180,140,.78)",
  inkLabel: "rgba(180,150,100,.58)",
  inkMeta: "rgba(180,150,100,.68)",
  inkPlaceholder: "rgba(160,130,90,.52)",
  inkPreviewTitle: "rgba(230,210,170,.9)",
  inkPreviewBody: "rgba(200,175,130,.68)",
  inkListTitle: "rgba(230,210,170,.88)",
  inkTag: "rgba(210,180,130,.82)",
  inkTagBg: "rgba(200,160,80,.14)",
  inkTagBorder: "rgba(200,160,80,.28)",
  ruleLine: "rgba(200,160,80,.14)",
  marginLine: "rgba(220,120,80,.24)",
  borderSubtle: "rgba(200,160,80,.16)",
  dividerGradient: "linear-gradient(to right,rgba(200,160,80,.38),transparent)",
  dotActive: "rgba(200,160,80,.88)",
  dotInactive: "rgba(180,150,100,.28)",
  paperActionColor: "rgba(200,170,120,.72)",
  paperActionBorder: "rgba(200,160,80,.32)",
  paperActionHover: "rgba(245,230,190,.96)",
  paperActionDestructiveColor: "rgba(230,140,100,.78)",
  paperActionDestructiveBorder: "rgba(200,100,80,.38)",
  paperActionDestructiveHover: "rgba(255,190,150,.96)",
  tagInputBg: "rgba(200,160,80,.12)",
  tagInputBorder: "rgba(200,160,80,.28)",
  tagInputColor: "rgba(230,210,170,.88)",
  pageInsetShadowLeft: "inset -10px 0 24px rgba(0,0,0,.38), inset 3px 0 8px rgba(200,160,80,.1)",
  pageInsetShadowRight: "inset 10px 0 24px rgba(0,0,0,.32)",
  proseBlockquoteBorder: "rgba(200,160,80,.35)",
  prosePlaceholder: "rgba(180,150,100,.4)",
  proseCodeBg: "rgba(200,160,80,.12)",
  prosePreBg: "rgba(0,0,0,.22)",
  flipSeamEdge:
    "linear-gradient(to right, rgba(200,160,80,.22) 0%, rgba(160,120,60,.08) 40%, transparent 100%)",
  flipShadowRest: "2px 0 10px rgba(0,0,0,.28)",
  flipShadowMid: "-5px 0 16px rgba(0,0,0,.42)",
} as const;

const MIDNIGHT_SURFACE = {
  inkHeading: "rgba(220,220,240,.94)",
  inkBody: "rgba(180,180,210,.78)",
  inkLabel: "rgba(160,160,200,.58)",
  inkMeta: "rgba(160,160,200,.68)",
  inkPlaceholder: "rgba(140,140,180,.52)",
  inkPreviewTitle: "rgba(220,220,240,.9)",
  inkPreviewBody: "rgba(170,170,210,.68)",
  inkListTitle: "rgba(220,220,240,.88)",
  inkTag: "rgba(190,195,230,.82)",
  inkTagBg: "rgba(140,160,255,.14)",
  inkTagBorder: "rgba(140,160,255,.28)",
  ruleLine: "rgba(140,160,255,.14)",
  marginLine: "rgba(160,140,220,.24)",
  borderSubtle: "rgba(140,160,255,.16)",
  dividerGradient: "linear-gradient(to right,rgba(140,160,255,.38),transparent)",
  dotActive: "rgba(140,160,255,.88)",
  dotInactive: "rgba(160,160,200,.28)",
  paperActionColor: "rgba(180,185,220,.72)",
  paperActionBorder: "rgba(140,160,255,.32)",
  paperActionHover: "rgba(240,240,255,.96)",
  paperActionDestructiveColor: "rgba(230,150,180,.78)",
  paperActionDestructiveBorder: "rgba(200,100,140,.38)",
  paperActionDestructiveHover: "rgba(255,200,220,.96)",
  tagInputBg: "rgba(140,160,255,.12)",
  tagInputBorder: "rgba(140,160,255,.28)",
  tagInputColor: "rgba(220,220,240,.88)",
  pageInsetShadowLeft: "inset -10px 0 24px rgba(0,0,0,.42), inset 3px 0 8px rgba(140,160,255,.1)",
  pageInsetShadowRight: "inset 10px 0 24px rgba(0,0,0,.36)",
  proseBlockquoteBorder: "rgba(140,160,255,.35)",
  prosePlaceholder: "rgba(160,160,200,.4)",
  proseCodeBg: "rgba(140,160,255,.12)",
  prosePreBg: "rgba(0,0,0,.28)",
  flipSeamEdge:
    "linear-gradient(to right, rgba(140,160,255,.22) 0%, rgba(100,120,200,.08) 40%, transparent 100%)",
  flipShadowRest: "2px 0 10px rgba(0,0,0,.32)",
  flipShadowMid: "-5px 0 16px rgba(0,0,0,.48)",
} as const;

const SOFT_MINIMAL_SURFACE = {
  ...WARM_PAPER_SURFACE,
  inkHeading: "rgba(40,40,45,.88)",
  inkBody: "rgba(80,80,90,.58)",
  inkLabel: "rgba(100,100,110,.45)",
  inkMeta: "rgba(100,100,110,.55)",
  inkPlaceholder: "rgba(100,100,110,.42)",
  inkPreviewTitle: "rgba(45,45,50,.75)",
  inkPreviewBody: "rgba(70,70,78,.55)",
  inkListTitle: "rgba(45,45,50,.8)",
  inkTag: "rgba(70,70,80,.72)",
  inkTagBg: "rgba(80,80,90,.08)",
  inkTagBorder: "rgba(80,80,90,.2)",
  ruleLine: "rgba(100,100,110,.1)",
  marginLine: "rgba(180,100,90,.16)",
  borderSubtle: "rgba(80,80,90,.12)",
  dividerGradient: "linear-gradient(to right,rgba(80,80,90,.22),transparent)",
  dotActive: "rgba(80,80,90,.7)",
  dotInactive: "rgba(100,100,110,.18)",
  paperActionColor: "rgba(80,80,90,.55)",
  paperActionBorder: "rgba(80,80,90,.2)",
  paperActionHover: "rgba(40,40,45,.88)",
  tagInputColor: "rgba(45,45,50,.75)",
  pageInsetShadowLeft: "inset -10px 0 24px rgba(80,80,90,.1), inset 3px 0 8px rgba(200,200,205,.08)",
  pageInsetShadowRight: "inset 10px 0 24px rgba(80,80,90,.08)",
  flipSeamEdge:
    "linear-gradient(to right, rgba(80,80,90,.12) 0%, rgba(100,100,110,.05) 40%, transparent 100%)",
  flipShadowRest: "2px 0 10px rgba(60,60,65,.08)",
  flipShadowMid: "-5px 0 16px rgba(40,40,45,.14)",
} as const;

const VINTAGE_DIARY_SURFACE = {
  ...WARM_PAPER_SURFACE,
  inkHeading: "rgba(55,30,10,.86)",
  inkBody: "rgba(120,80,40,.55)",
  inkLabel: "rgba(120,80,40,.45)",
  inkMeta: "rgba(120,80,40,.55)",
  inkPreviewTitle: "rgba(55,30,10,.74)",
  inkPreviewBody: "rgba(90,55,25,.55)",
  inkListTitle: "rgba(55,30,10,.8)",
  inkTag: "rgba(130,85,40,.72)",
  dotActive: "rgba(150,90,40,.75)",
  flipSeamEdge:
    "linear-gradient(to right, rgba(150,90,40,.16) 0%, rgba(120,70,20,.06) 40%, transparent 100%)",
  flipShadowRest: "2px 0 10px rgba(90,55,25,.10)",
  flipShadowMid: "-5px 0 16px rgba(55,30,10,.16)",
} as const;

export const BOOK_THEMES: BookThemeTokens[] = [
  {
    id: "warm-paper",
    label: "Warm Paper",
    pageLeft: "linear-gradient(to right,#ede1cc 0%,#f4ecda 60%,#ede0c8 100%)",
    pageRight: "linear-gradient(to left,#e8dcc9 0%,#f4ecda 60%,#ede0c8 100%)",
    ink: "rgba(35,14,3,.82)",
    inkMuted: "rgba(100,55,20,.45)",
    accent: "rgba(170,95,35,.55)",
    ...WARM_PAPER_SURFACE,
  },
  {
    id: "dark-academia",
    label: "Dark Academia",
    pageLeft: "linear-gradient(to right,#2a2418 0%,#3d3528 60%,#2e281c 100%)",
    pageRight: "linear-gradient(to left,#252018 0%,#353028 60%,#2a2418 100%)",
    ink: "rgba(230,210,170,.9)",
    inkMuted: "rgba(180,150,100,.55)",
    accent: "rgba(200,160,80,.6)",
    ...DARK_ACADEMIA_SURFACE,
  },
  {
    id: "midnight-journal",
    label: "Midnight Journal",
    pageLeft: "linear-gradient(to right,#1a1a2e 0%,#252540 60%,#1e1e32 100%)",
    pageRight: "linear-gradient(to left,#161628 0%,#222238 60%,#1a1a2e 100%)",
    ink: "rgba(220,220,240,.88)",
    inkMuted: "rgba(160,160,200,.55)",
    accent: "rgba(140,160,255,.55)",
    ...MIDNIGHT_SURFACE,
  },
  {
    id: "soft-minimal",
    label: "Soft Minimal",
    pageLeft: "linear-gradient(to right,#f5f5f0 0%,#fafaf8 60%,#f0f0eb 100%)",
    pageRight: "linear-gradient(to left,#ecece8 0%,#f8f8f5 60%,#f0f0eb 100%)",
    ink: "rgba(40,40,45,.85)",
    inkMuted: "rgba(100,100,110,.4)",
    accent: "rgba(80,80,90,.35)",
    ...SOFT_MINIMAL_SURFACE,
  },
  {
    id: "vintage-diary",
    label: "Vintage Diary",
    pageLeft: "linear-gradient(to right,#e8d5b5 0%,#f0e4cc 60%,#e5d4b0 100%)",
    pageRight: "linear-gradient(to left,#e0cbb0 0%,#ede0c4 60%,#e5d4b0 100%)",
    ink: "rgba(55,30,10,.8)",
    inkMuted: "rgba(120,80,40,.42)",
    accent: "rgba(150,90,40,.5)",
    ...VINTAGE_DIARY_SURFACE,
  },
];

export function getBookTheme(id: string): BookThemeTokens {
  return BOOK_THEMES.find((t) => t.id === id) ?? BOOK_THEMES[0]!;
}

/** CSS custom property names emitted by `bookThemeCssVars` — used in tests */
export const BOOK_THEME_CSS_VAR_KEYS = [
  "--theme-page-left",
  "--theme-page-right",
  "--theme-ink",
  "--theme-ink-muted",
  "--theme-accent",
  "--theme-ink-heading",
  "--theme-ink-body",
  "--theme-ink-label",
  "--theme-ink-meta",
  "--theme-ink-placeholder",
  "--theme-ink-preview-title",
  "--theme-ink-preview-body",
  "--theme-ink-list-title",
  "--theme-ink-tag",
  "--theme-ink-tag-bg",
  "--theme-ink-tag-border",
  "--theme-rule-line",
  "--theme-margin-line",
  "--theme-border-subtle",
  "--theme-divider-gradient",
  "--theme-dot-active",
  "--theme-dot-inactive",
  "--theme-paper-action-color",
  "--theme-paper-action-border",
  "--theme-paper-action-hover",
  "--theme-paper-action-destructive-color",
  "--theme-paper-action-destructive-border",
  "--theme-paper-action-destructive-hover",
  "--theme-tag-input-bg",
  "--theme-tag-input-border",
  "--theme-tag-input-color",
  "--theme-page-inset-shadow-left",
  "--theme-page-inset-shadow-right",
  "--theme-prose-blockquote-border",
  "--theme-prose-placeholder",
  "--theme-prose-code-bg",
  "--theme-prose-pre-bg",
  "--theme-flip-seam-edge",
  "--theme-flip-shadow-rest",
  "--theme-flip-shadow-mid",
  "--ink-primary",
  "--ink-secondary",
] as const;
