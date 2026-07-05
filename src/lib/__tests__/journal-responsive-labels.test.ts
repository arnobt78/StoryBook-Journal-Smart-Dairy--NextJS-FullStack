import { describe, expect, it } from "vitest";
import {
  READ_PAGE_ACTION_LABEL,
  READ_REMOVE_LABEL_FULL,
  WRITE_AI_LABEL_FULL,
  WRITE_CANCEL_LABEL_FULL,
  WRITE_SAVE_LABEL_FULL,
} from "@/lib/journal-responsive-labels";

describe("journal-responsive-labels", () => {
  it("read page action uses short Page label", () => {
    expect(READ_PAGE_ACTION_LABEL).toBe("Page");
  });

  it("read remove full label for md+ footer", () => {
    expect(READ_REMOVE_LABEL_FULL).toBe("Remove page");
  });

  it("write footer full labels match UI copy", () => {
    expect(WRITE_AI_LABEL_FULL).toBe("AI Assist");
    expect(WRITE_CANCEL_LABEL_FULL).toBe("Cancel");
    expect(WRITE_SAVE_LABEL_FULL).toBe("Save");
  });
});
