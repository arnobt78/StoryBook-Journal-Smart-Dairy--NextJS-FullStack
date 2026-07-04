import { describe, expect, it } from "vitest";
import {
  JOURNAL_STAGGER_ROW_CLASS,
  journalStaggerRowProps,
} from "@/lib/journal-stagger";

describe("journalStaggerRowProps", () => {
  it("returns row class and CSS variable index", () => {
    const props = journalStaggerRowProps(3);
    expect(props.className).toBe(JOURNAL_STAGGER_ROW_CLASS);
    expect(props.style).toEqual({ "--journal-stagger-i": 3 });
  });

  it("uses index 0 for first row", () => {
    expect(journalStaggerRowProps(0).style).toEqual({ "--journal-stagger-i": 0 });
  });

  it("merges optional className and style", () => {
    const props = journalStaggerRowProps(2, {
      className: "journal-field",
      style: { marginBottom: "12px" },
    });
    expect(props.className).toBe("journal-stagger-row journal-field");
    expect(props.style).toEqual({
      "--journal-stagger-i": 2,
      marginBottom: "12px",
    });
  });
});
