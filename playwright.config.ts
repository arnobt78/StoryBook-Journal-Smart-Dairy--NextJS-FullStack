import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests — require dev server + seeded test@user.com (see prisma/seed.ts).
 * Run: npm run dev (separate terminal) then npm run test:e2e
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
