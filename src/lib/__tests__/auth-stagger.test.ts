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

  it("merges optional className and style", () => {
    const props = authStaggerRowProps(2, {
      className: "auth-field",
      style: { marginBottom: "12px" },
    });
    expect(props.className).toBe("auth-stagger-row auth-field");
    expect(props.style).toEqual({
      "--auth-stagger-i": 2,
      marginBottom: "12px",
    });
  });
});
