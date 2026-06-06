/**
 * Shared inline styles for login/register forms — keeps control heights and
 * CTA shapes consistent. Pairs with `.leather-glass-*` classes from globals.css.
 */
import type { CSSProperties } from "react";
import { LEATHER_GLASS, LEATHER_GLASS_CLASS } from "@/lib/leather-glass-styles";

/** Matches `.auth-control` in globals.css — same height as email/password inputs */
export const AUTH_CONTROL_HEIGHT = "var(--auth-control-h, 42px)";

export const inputClassName = `auth-control ${LEATHER_GLASS_CLASS.input}`;

export const inputStyle: CSSProperties = {
  width: "100%",
  fontFamily: "'Lora', serif",
  fontSize: "13px",
  borderRadius: "4px",
  padding: "10px 12px",
  outline: "none",
  color: "rgba(35,14,3,.8)",
  boxSizing: "border-box",
  minHeight: AUTH_CONTROL_HEIGHT,
  ...LEATHER_GLASS.input,
};

/** Demo picker trigger — same visual height as credential inputs */
export const authControlClassName = `auth-control ${LEATHER_GLASS_CLASS.input}`;

export const authControlStyle: CSSProperties = {
  width: "100%",
  fontFamily: "'Lora', serif",
  fontSize: "13px",
  color: "rgba(100,55,20,.65)",
  borderRadius: "4px",
  padding: "10px 12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  minHeight: AUTH_CONTROL_HEIGHT,
  ...LEATHER_GLASS.input,
};

export const primaryCtaClassName = LEATHER_GLASS_CLASS.buttonPrimary;

export const primaryCtaStyle: CSSProperties = {
  width: "100%",
  fontFamily: "'Lora', serif",
  fontSize: "11px",
  letterSpacing: "2px",
  textTransform: "uppercase",
  border: "none",
  padding: "12px",
  borderRadius: "4px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  minHeight: AUTH_CONTROL_HEIGHT,
  ...LEATHER_GLASS.buttonPrimary,
};

export const outlineCtaClassName = LEATHER_GLASS_CLASS.buttonOutline;

export const outlineCtaStyle: CSSProperties = {
  width: "100%",
  fontFamily: "'Lora', serif",
  fontSize: "11px",
  letterSpacing: "2px",
  textTransform: "uppercase",
  padding: "11px 14px",
  borderRadius: "4px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  boxSizing: "border-box",
  minHeight: AUTH_CONTROL_HEIGHT,
  ...LEATHER_GLASS.buttonOutline,
};

export const fieldLabelStyle: CSSProperties = {
  display: "block",
  fontFamily: "'Lora', serif",
  fontSize: "10px",
  letterSpacing: "2px",
  textTransform: "uppercase",
  color: "rgba(100,55,20,.55)",
  marginBottom: "6px",
};
