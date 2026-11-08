import { test, expect } from "@playwright/test";

test.describe("Anonymous Feedback", () => {
  test("submit feedback without login", async ({ page }) => {
    await page.goto("/feedback");
    await expect(page.locator("text=Feedback")).toBeVisible();

    await page.fill('textarea[name="message"]', "This is a test feedback submission");
    await page.click('text=Submit');

    await expect(page.locator("text=submitted")).toBeVisible();
  });
});

test.describe("Profile & Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "isha@pwioi.com");
    await page.click('text=Request OTP');
    await page.fill('input[name="otp"]', "000000");
    await page.click('text=Verify');
    await page.waitForURL(/\/home|\/profile/);
  });

  test("view profile page", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("text=Profile")).toBeVisible();
  });

  test("toggle dark/light theme", async ({ page }) => {
    await page.goto("/settings");
    await page.click('text=Theme');
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });
});
