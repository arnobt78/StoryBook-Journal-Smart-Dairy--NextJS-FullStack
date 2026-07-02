import { describe, it, expect } from "vitest";
import {
  LOGOUT_TOTAL_MS,
  LOGOUT_ORBIT_DELAY_MS,
  LOGOUT_ORBIT_MS,
  LOGOUT_HOLD_MS,
  resolveLogoutDisplayName,
} from "@/lib/logout-book-close";

describe("resolveLogoutDisplayName", () => {
  it("prefers display name", () => {
    expect(resolveLogoutDisplayName({ name: "Jane Doe", email: "j@x.com" })).toBe(
      "Jane Doe",
    );
  });

  it("falls back to email local part", () => {
    expect(resolveLogoutDisplayName({ name: null, email: "writer@example.com" })).toBe(
      "writer",
    );
  });

  it("defaults to Reader", () => {
    expect(resolveLogoutDisplayName({})).toBe("Reader");
  });
});

describe("LOGOUT_TOTAL_MS", () => {
  it("waits through orbit phase after hinge completes", () => {
    expect(LOGOUT_TOTAL_MS).toBe(LOGOUT_ORBIT_DELAY_MS + LOGOUT_ORBIT_MS + LOGOUT_HOLD_MS);
    expect(LOGOUT_TOTAL_MS).toBeGreaterThan(2500);
  });
});
