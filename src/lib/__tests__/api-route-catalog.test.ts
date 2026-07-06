import { describe, it, expect } from "vitest";
import {
  getApiRouteCatalog,
  getApiEndpointKeys,
  groupEndpointsByTag,
} from "@/lib/api-route-catalog";

describe("api-route-catalog", () => {
  it("lists all production routes without duplicate method+path keys", () => {
    const keys = getApiEndpointKeys();
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
    expect(keys.length).toBeGreaterThanOrEqual(17);
  });

  it("includes health, status, and openapi system routes", () => {
    const keys = getApiEndpointKeys();
    expect(keys).toContain("GET /api/health");
    expect(keys).toContain("GET /api/status");
    expect(keys).toContain("GET /api/openapi");
  });

  it("groups every endpoint under a known tag", () => {
    const catalog = getApiRouteCatalog();
    const grouped = groupEndpointsByTag(catalog.endpoints);
    const groupedCount = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);
    expect(groupedCount).toBe(catalog.endpoints.length);
  });

  it("exposes Zod-aligned schema docs", () => {
    const catalog = getApiRouteCatalog();
    const names = catalog.schemas.map((s) => s.name);
    expect(names).toContain("createBookSchema");
    expect(names).toContain("updateEntrySchema");
    expect(names).toContain("aiAssistRequestSchema");
  });
});
