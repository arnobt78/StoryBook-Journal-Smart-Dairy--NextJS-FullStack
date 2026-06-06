import { test, expect } from "@playwright/test";

const TEST_EMAIL = "test@user.com";
const TEST_PASSWORD = "12345678";

/** TC-0020 — palette theme cycle when on journal page */
test("cycle page theme from command palette on journal", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /open my journal/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  /* Shelf uses onClick divs — click first journal title (seed default: My Journal) */
  const title = page.locator("main").getByText("My Journal").first();
  if ((await title.count()) === 0) {
    test.skip(true, "No journal on shelf — seed db first");
    return;
  }
  await title.click();
  await expect(page).toHaveURL(/\/journal\//, { timeout: 10000 });

  const isMac = process.platform === "darwin";
  await page.keyboard.press(isMac ? "Meta+k" : "Control+k");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();

  const themeItem = page.getByRole("option", { name: /cycle page theme/i });
  await expect(themeItem).toBeEnabled();
  await themeItem.click();

  await expect(page.getByText(/page theme updated/i)).toBeVisible({ timeout: 8000 });
});
