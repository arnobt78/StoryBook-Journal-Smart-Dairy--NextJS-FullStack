import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUserCount = vi.fn();
const mockBookCount = vi.fn();
const mockEntryCount = vi.fn();
const mockQueryRaw = vi.fn();
const mockGetRedis = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
    user: { count: (...args: unknown[]) => mockUserCount(...args) },
    journalBook: { count: (...args: unknown[]) => mockBookCount(...args) },
    journalEntry: { count: (...args: unknown[]) => mockEntryCount(...args) },
  },
}));

vi.mock("@/lib/redis", () => ({
  getRedis: () => mockGetRedis(),
}));

import { getApiStatus } from "@/lib/api-status-server";

describe("getApiStatus", () => {
  beforeEach(() => {
    mockQueryRaw.mockResolvedValue([{ "?column?": 1 }]);
    mockUserCount.mockImplementation(async (args?: { where?: unknown }) => {
      if (args?.where) return 2;
      return 10;
    });
    mockBookCount.mockImplementation(async (args?: { where?: unknown }) => {
      if (args?.where) return 3;
      return 25;
    });
    mockEntryCount.mockImplementation(async (args?: { where?: unknown }) => {
      if (args?.where) return 12;
      return 80;
    });
    mockGetRedis.mockReturnValue(null);
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("returns expected payload shape with platform and personal counts", async () => {
    const status = await getApiStatus("user-test-id");

    expect(status.service).toBe("storybook-journal");
    expect(status.uptime.ok).toBe(true);
    expect(status.dependencies.database.ok).toBe(true);
    expect(status.dependencies.redis.configured).toBe(false);
    expect(status.platform).toEqual({
      totalUsers: 10,
      totalBooks: 25,
      totalEntries: 80,
      recentlyActiveUsers: 2,
    });
    expect(status.personal).toEqual({
      bookCount: 3,
      entryCount: 12,
    });
  });

  it("detects AI configured when GROQ_API_KEY is set", async () => {
    process.env.GROQ_API_KEY = "test-key";
    const status = await getApiStatus("user-test-id");
    expect(status.dependencies.ai.configured).toBe(true);
  });
});
