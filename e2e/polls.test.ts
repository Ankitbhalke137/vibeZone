import { test, expect } from "@playwright/test";

test.describe("Polls & Leaderboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "isha@pwioi.com");
    await page.click('text=Request OTP');
    await page.fill('input[name="otp"]', "000000");
    await page.click('text=Verify');
    await page.waitForURL(/\/home|\/polls/);
  });

  test("view active poll", async ({ page }) => {
    await page.goto("/polls");
    await expect(page.locator("text=Poll")).toBeVisible();
  });

  test("vote in poll", async ({ page }) => {
    await page.goto("/polls");
    await page.click('text=Vote');
    await expect(page.locator("text=voted")).toBeVisible();
  });

  test("view leaderboard", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.locator("text=Leaderboard")).toBeVisible();
  });
});
