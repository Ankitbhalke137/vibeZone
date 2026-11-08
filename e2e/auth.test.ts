import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication", () => {
  test("sign up with campus email and OTP (dev mode)", async ({ page }) => {
    await page.goto("/login");

    // Click sign up
    await page.click('text=Sign up');

    // Enter campus email
    await page.fill('input[name="email"]', "testuser@pwioi.com");
    await page.click('text=Request OTP');

    // In dev mode, OTP is printed in terminal and shown in "Dev mode" badge
    // We'll verify the OTP input appears
    await expect(page.locator('input[name="otp"]')).toBeVisible();

    // Fill in a test OTP (in dev mode, any 6-digit code may work or
    // we read it from terminal output)
    await page.fill('input[name="otp"]', "000000");
    await page.click('text=Verify');

    // Should redirect to onboarding or home
    await expect(page).toHaveURL(/\/onboarding|\/home/);
  });

  test("rejects non-campus email", async ({ page }) => {
    await page.goto("/login");
    await page.click('text=Sign up');
    await page.fill('input[name="email"]', "user@gmail.com");
    await page.click('text=Request OTP');
    await expect(page.locator("text=campus email")).toBeVisible();
  });

  test("login with existing account", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "isha@pwioi.com");
    await page.click('text=Request OTP');
    await expect(page.locator('input[name="otp"]')).toBeVisible();
  });
});

test.describe("Public pages (no auth)", () => {
  test("announcement board is publicly accessible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Announcements")).toBeVisible();
    await expect(page.locator("text=VibeZone")).toBeVisible();
  });

  test("events page is publicly accessible", async ({ page }) => {
    await page.goto("/events");
    await expect(page.locator("text=Events")).toBeVisible();
  });
});
