import { test, expect } from "@playwright/test";

test.describe("Notes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "isha@pwioi.com");
    await page.click('text=Request OTP');
    await page.fill('input[name="otp"]', "000000");
    await page.click('text=Verify');
    await page.waitForURL(/\/home|\/notes/);
  });

  test("view notes repository", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.locator("text=Notes")).toBeVisible();
  });

  test("search and filter notes", async ({ page }) => {
    await page.goto("/notes");
    await page.fill('input[placeholder*="search"]', "math");
    await expect(page.locator("text=math")).toBeVisible();
  });
});
