import { test, expect } from "@playwright/test";

test.describe("Chat", () => {
  test.beforeEach(async ({ page }) => {
    // Dev mode: sign in with demo account
    await page.goto("/login");
    await page.fill('input[name="email"]', "isha@pwioi.com");
    await page.click('text=Request OTP');
    await page.fill('input[name="otp"]', "000000");
    await page.click('text=Verify');
    await page.waitForURL(/\/home|\/chat/);
  });

  test("send a message in global channel", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator("text=#general")).toBeVisible();

    // Type and send a message
    await page.fill('input[placeholder*="message"], textarea', "Hello from E2E test");
    await page.click('text=Send');

    // Verify message appears
    await expect(page.locator("text=Hello from E2E test")).toBeVisible();
  });

  test("toggle alias mode", async ({ page }) => {
    await page.goto("/chat");
    await page.click('text=Alias');
    await expect(page.locator("text=Alias mode")).toBeVisible();
  });
});
