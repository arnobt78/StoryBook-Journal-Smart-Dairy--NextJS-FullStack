import { describe, expect, it } from "vitest";
import {
  AUTH_STAGGER_ROW_CLASS,
  authStaggerRowProps,
} from "@/lib/auth-stagger";

describe("authStaggerRowProps", () => {
  it("returns row class and CSS variable index", () => {
    const props = authStaggerRowProps(3);
    expect(props.className).toBe(AUTH_STAGGER_ROW_CLASS);
    expect(props.style).toEqual({ "--auth-stagger-i": 3 });
  });

  it("uses index 0 for first row", () => {
    expect(authStaggerRowProps(0).style).toEqual({ "--auth-stagger-i": 0 });
  });
});
