import { describe, expect, it } from "vitest";
import { isDemoAccountSelected } from "@/lib/auth/demo-account";
import {
  TEST_ACCOUNT_EMAIL,
  TEST_ACCOUNT_PASSWORD,
} from "@/constants/auth";

describe("isDemoAccountSelected", () => {
  it("is false when both fields are empty", () => {
    expect(isDemoAccountSelected("", "")).toBe(false);
  });

  it("is false when only email matches", () => {
    expect(isDemoAccountSelected(TEST_ACCOUNT_EMAIL, "")).toBe(false);
  });

  it("is true when email and password match demo creds", () => {
    expect(isDemoAccountSelected(TEST_ACCOUNT_EMAIL, TEST_ACCOUNT_PASSWORD)).toBe(
      true,
    );
  });
});
