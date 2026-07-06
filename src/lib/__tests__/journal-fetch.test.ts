import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  JournalApiError,
  isUnauthorizedError,
  journalFetch,
} from "@/lib/journal-fetch";

describe("journal-fetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("journalFetch throws JournalApiError with status on 401", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: "Unauthorized" }),
    } as Response);

    await expect(journalFetch("/api/entries/test")).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    });
  });

  it("isUnauthorizedError detects JournalApiError 401", () => {
    expect(isUnauthorizedError(new JournalApiError(401, "Unauthorized"))).toBe(true);
    expect(isUnauthorizedError(new JournalApiError(500, "Server error"))).toBe(false);
    expect(isUnauthorizedError(new Error("fail"))).toBe(false);
  });

  it("journalFetch passes credentials include", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await journalFetch("/api/books", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith(
      "/api/books",
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });
});
