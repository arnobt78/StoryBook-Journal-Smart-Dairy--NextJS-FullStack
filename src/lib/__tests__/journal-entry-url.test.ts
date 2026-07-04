import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  JOURNAL_ENTRY_QUERY_KEY,
  resolveInitialFocusedEntryId,
  syncEntryUrlParam,
} from "@/lib/journal-entry-url";

describe("resolveInitialFocusedEntryId", () => {
  const entryIds = ["e1", "e2", "e3"];

  it("keeps a valid string param", () => {
    expect(resolveInitialFocusedEntryId("e2", entryIds)).toBe("e2");
  });

  it("rejects an id that is not a real entry (stale/deleted bookmark)", () => {
    expect(resolveInitialFocusedEntryId("does-not-exist", entryIds)).toBeNull();
  });

  it("normalizes an array param by taking the first element", () => {
    expect(resolveInitialFocusedEntryId(["e3", "e1"], entryIds)).toBe("e3");
  });

  it("returns null for undefined param", () => {
    expect(resolveInitialFocusedEntryId(undefined, entryIds)).toBeNull();
  });

  it("returns null for empty entry list", () => {
    expect(resolveInitialFocusedEntryId("e1", [])).toBeNull();
  });
});

describe("syncEntryUrlParam", () => {
  const basePath = "/journal/book-1";

  beforeEach(() => {
    window.history.replaceState(null, "", basePath);
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("sets the ?entry= param when given an id", () => {
    syncEntryUrlParam("entry-1");
    expect(window.location.search).toBe(`?${JOURNAL_ENTRY_QUERY_KEY}=entry-1`);
  });

  it("updates the param when the id changes", () => {
    syncEntryUrlParam("entry-1");
    syncEntryUrlParam("entry-2");
    expect(window.location.search).toBe(`?${JOURNAL_ENTRY_QUERY_KEY}=entry-2`);
  });

  it("removes the param when given null", () => {
    syncEntryUrlParam("entry-1");
    syncEntryUrlParam(null);
    expect(window.location.search).toBe("");
  });

  it("is a no-op when the URL already matches (no redundant history write)", () => {
    syncEntryUrlParam("entry-1");
    const before = window.location.href;
    syncEntryUrlParam("entry-1");
    expect(window.location.href).toBe(before);
  });
});
