import { describe, expect, it } from "vitest";
import {
  authBrandStaggerKey,
  authStaggerRemountKey,
} from "@/hooks/useAuthBookNavigation";

describe("authStaggerRemountKey", () => {
  it("uses destination pathname when content is ready", () => {
    expect(authStaggerRemountKey(true, "/register", "/login")).toBe("/register");
  });

  it("uses flip source while content is hidden", () => {
    expect(authStaggerRemountKey(false, "/register", "/login")).toBe("/login");
  });

  it("falls back to pathname when no flip source", () => {
    expect(authStaggerRemountKey(false, "/login", null)).toBe("/login");
  });

  it("changes key on ready transition even if pathname already updated (fast RSC)", () => {
    const hiddenKey = authStaggerRemountKey(false, "/register", "/login");
    const readyKey = authStaggerRemountKey(true, "/register", "/login");
    expect(hiddenKey).toBe("/login");
    expect(readyKey).toBe("/register");
    expect(hiddenKey).not.toBe(readyKey);
  });
});

describe("authBrandStaggerKey", () => {
  it("holds stable key during flip", () => {
    expect(authBrandStaggerKey(false, "/register")).toBe("auth-brand-hold");
    expect(authBrandStaggerKey(false, "/login")).toBe("auth-brand-hold");
  });

  it("uses pathname when content is ready", () => {
    expect(authBrandStaggerKey(true, "/register")).toBe("/register");
  });
});
