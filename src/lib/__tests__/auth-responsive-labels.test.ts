import { describe, expect, it } from "vitest";
import {
  DEMO_PICKER_LABEL_FULL,
  DEMO_PICKER_LABEL_SHORT,
  OAUTH_GMAIL_LABEL,
  OAUTH_GMAIL_REGISTER_LABEL_FULL,
} from "@/lib/auth-responsive-labels";

describe("auth-responsive-labels", () => {
  it("exports demo picker full and short labels", () => {
    expect(DEMO_PICKER_LABEL_FULL).toBe("Select Demo Account");
    expect(DEMO_PICKER_LABEL_SHORT).toBe("Demo account");
    expect(DEMO_PICKER_LABEL_SHORT.split(" ").length).toBe(2);
  });

  it("exports OAuth Gmail labels for register mobile parity", () => {
    expect(OAUTH_GMAIL_LABEL).toBe("Open with Gmail");
    expect(OAUTH_GMAIL_REGISTER_LABEL_FULL).toBe("Continue with Gmail");
  });
});
