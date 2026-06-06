import { test, expect } from "@playwright/test";

const TEST_EMAIL = "test@user.com";
const TEST_PASSWORD = "12345678";

/** TC-0002 — credentials login reaches dashboard */
test("login with test account redirects to dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /open my journal/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
});
