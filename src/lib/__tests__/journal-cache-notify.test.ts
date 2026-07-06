import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";

describe("notifyJournalCacheUpdated", () => {
  const invalidateQueries = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    invalidateQueries.mockClear();
    Object.defineProperty(globalThis.navigator, "onLine", {
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("refetches active queries when online", async () => {
    const qc = { invalidateQueries } as unknown as QueryClient;
    await notifyJournalCacheUpdated(qc);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["journal"],
      refetchType: "active",
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["api", "status"],
      refetchType: "active",
    });
  });

  it("marks stale only when offline", async () => {
    Object.defineProperty(globalThis.navigator, "onLine", {
      value: false,
      configurable: true,
    });
    const qc = { invalidateQueries } as unknown as QueryClient;
    await notifyJournalCacheUpdated(qc);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["journal"],
      refetchType: "none",
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["api", "status"],
      refetchType: "none",
    });
  });
});
