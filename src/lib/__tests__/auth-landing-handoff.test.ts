import { describe, expect, it, beforeEach } from "vitest";
import {
  AUTH_LANDING_CSS_VARS,
  AUTH_LANDING_DATASET,
  AUTH_LANDING_HANDOFF_KEY,
  AUTH_LANDING_ENTER_MS,
  AUTH_LANDING_MAX_ROWS,
  AUTH_LANDING_ROW_ANIM_MS,
  AUTH_LANDING_SHELL_MS,
  AUTH_LANDING_STAGGER_START_MS,
  AUTH_LANDING_STAGGER_STEP_MS,
  AUTH_LANDING_TOTAL_MS,
  applyAuthLandingCssVars,
  clearAuthLandingCssVars,
  clearAuthLandingHandoff,
  consumeAuthLandingHandoff,
  hasAuthLandingHandoff,
  setAuthLandingHandoff,
} from "@/lib/auth-landing-handoff";

describe("auth-landing-handoff", () => {
  beforeEach(() => {
    sessionStorage.clear();
    delete document.documentElement.dataset[AUTH_LANDING_DATASET];
    clearAuthLandingCssVars();
  });

  it("consume returns true once after set, then false", () => {
    setAuthLandingHandoff();
    expect(consumeAuthLandingHandoff()).toBe(true);
    expect(consumeAuthLandingHandoff()).toBe(false);
  });

  it("consume returns false when flag was never set", () => {
    expect(consumeAuthLandingHandoff()).toBe(false);
  });

  it("set stores sessionStorage and html dataset", () => {
    setAuthLandingHandoff();
    expect(sessionStorage.getItem(AUTH_LANDING_HANDOFF_KEY)).toBe("1");
    expect(document.documentElement.dataset[AUTH_LANDING_DATASET]).toBe("1");
  });

  it("hasAuthLandingHandoff detects either storage or dataset", () => {
    document.documentElement.dataset[AUTH_LANDING_DATASET] = "1";
    expect(hasAuthLandingHandoff()).toBe(true);
  });

  it("clearAuthLandingHandoff removes storage and dataset", () => {
    setAuthLandingHandoff();
    clearAuthLandingHandoff();
    expect(hasAuthLandingHandoff()).toBe(false);
  });

  it("AUTH_LANDING_ENTER_MS matches shell duration", () => {
    expect(AUTH_LANDING_ENTER_MS).toBe(900);
    expect(AUTH_LANDING_SHELL_MS).toBe(900);
  });

  it("AUTH_LANDING_TOTAL_MS covers parallel stagger choreography", () => {
    const expected =
      AUTH_LANDING_SHELL_MS +
      AUTH_LANDING_STAGGER_START_MS +
      AUTH_LANDING_MAX_ROWS * AUTH_LANDING_STAGGER_STEP_MS +
      AUTH_LANDING_ROW_ANIM_MS;
    expect(AUTH_LANDING_TOTAL_MS).toBe(expected);
    expect(AUTH_LANDING_TOTAL_MS).toBe(2050);
  });

  it("applyAuthLandingCssVars sets parallel stagger custom properties", () => {
    applyAuthLandingCssVars();
    const root = document.documentElement;
    for (const [key, value] of Object.entries(AUTH_LANDING_CSS_VARS)) {
      expect(root.style.getPropertyValue(key)).toBe(value);
    }
    clearAuthLandingCssVars();
    for (const key of Object.keys(AUTH_LANDING_CSS_VARS)) {
      expect(root.style.getPropertyValue(key)).toBe("");
    }
  });

  it("setAuthLandingHandoff applies CSS vars", () => {
    setAuthLandingHandoff();
    expect(
      document.documentElement.style.getPropertyValue(
        "--auth-landing-stagger-start-ms",
      ),
    ).toBe("100ms");
  });
});
