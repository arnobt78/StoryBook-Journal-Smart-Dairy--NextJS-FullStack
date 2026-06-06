import { test, expect } from "@playwright/test";

const TEST_EMAIL = "test@user.com";
const TEST_PASSWORD = "12345678";

/** TC-0019 — ⌘K opens command palette on dashboard */
test("command palette opens with keyboard shortcut", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /open my journal/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  const isMac = process.platform === "darwin";
  await page.keyboard.press(isMac ? "Meta+k" : "Control+k");

  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  await expect(page.getByPlaceholder("Search entries, open a journal…")).toBeVisible();
});
