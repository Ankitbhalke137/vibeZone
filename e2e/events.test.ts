import { test, expect } from "@playwright/test";

test.describe("Events", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "isha@pwioi.com");
    await page.click('text=Request OTP');
    await page.fill('input[name="otp"]', "000000");
    await page.click('text=Verify');
    await page.waitForURL(/\/home|\/events/);
  });

  test("view events list", async ({ page }) => {
    await page.goto("/events");
    await expect(page.locator("text=Events")).toBeVisible();
  });

  test("RSVP to an event", async ({ page }) => {
    await page.goto("/events");
    await page.click('text=RSVP');
    await expect(page.locator("text=Going")).toBeVisible();
  });
});
