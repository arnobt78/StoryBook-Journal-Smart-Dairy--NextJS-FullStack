/**
 * Leather-themed glassmorphism — maps docs/UI_STYLING_GUIDE.md patterns
 * (backdrop-blur, gradient overlays, colored shadows) to journal palette.
 */
import type { CSSProperties } from "react";

/** Tailwind class bundles for hybrid use with inline overrides */
export const LEATHER_GLASS_CLASS = {
  panel: "leather-glass-panel",
  buttonPrimary: "leather-glass-btn",
  /** Dark landing / ambient backgrounds — light gold label */
  buttonOutline: "leather-glass-btn-outline",
  /** Cream auth pages — dark leather label + visible border */
  buttonOutlinePaper: "leather-glass-btn-outline-paper",
  input: "leather-glass-input",
  avatarRing: "leather-avatar-ring",
  navPill: "leather-glass-nav-pill",
} as const;

export const LEATHER_GLASS: Record<
  | "panel"
  | "buttonPrimary"
  | "buttonOutline"
  | "buttonOutlinePaper"
  | "input"
  | "dropdown"
  | "avatarRing"
  | "navPill",
  CSSProperties
> = {
  panel: {
    background: "linear-gradient(135deg, rgba(244,236,218,.92), rgba(240,228,210,.88))",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255,160,60,.22)",
    boxShadow: "0 10px 30px rgba(139,69,19,.18)",
    borderRadius: "4px",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, rgba(90,40,10,.88), rgba(70,32,8,.82))",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    border: "1px solid rgba(255,160,60,.25)",
    boxShadow: "0 15px 35px rgba(90,40,10,.35)",
    color: "rgba(255,215,150,.92)",
  },
  buttonOutline: {
    background: "linear-gradient(135deg, rgba(120,70,20,.1), rgba(90,40,10,.04))",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    border: "1px solid rgba(255,160,60,.22)",
    boxShadow: "0 10px 30px rgba(139,69,19,.12)",
    color: "rgba(255,200,120,.92)",
  },
  input: {
    background: "rgba(255,250,242,.72)",
    border: "1px solid rgba(139,69,19,.32)",
    /* Outer glow only — no inset shadow */
    boxShadow:
      "0 4px 16px rgba(139,69,19,.14), 0 0 20px rgba(255,160,60,.1)",
  },
  buttonOutlinePaper: {
    background: "rgba(255,250,242,.55)",
    border: "1px solid rgba(139,69,19,.38)",
    boxShadow:
      "0 4px 16px rgba(139,69,19,.12), 0 0 18px rgba(255,160,60,.1)",
    color: "rgba(55,28,8,.85)",
  },
  dropdown: {
    background: "linear-gradient(135deg, rgba(244,236,218,.96), rgba(238,225,205,.94))",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255,160,60,.2)",
    boxShadow: "0 12px 36px rgba(139,69,19,.22)",
    borderRadius: "4px",
  },
  avatarRing: {
    border: "2px solid rgba(139,69,19,.55)",
    boxShadow: "0 0 12px rgba(255,160,60,.28), inset 0 0 8px rgba(90,40,10,.12)",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
  },
  navPill: {
    background: "rgba(16,6,1,.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,160,60,.12)",
    boxShadow: "0 10px 40px rgba(0,0,0,.45), 0 0 20px rgba(255,160,60,.06)",
  },
};
