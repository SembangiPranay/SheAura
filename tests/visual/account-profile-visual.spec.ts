import { test, expect } from "@playwright/test";

test.describe("SheAura Customer Account & Profile Visual Audit", () => {
  test("Capture Desktop and Mobile Account Portal", async ({ page }, testInfo) => {
    // 1. Visit account page
    await page.goto("/account");

    // Wait for the auth form to finish loading session check
    const emailInput = page.locator("input[type='email']");
    await expect(emailInput).toBeVisible({ timeout: 15000 });

    // Capture the initial member login screen
    await page.screenshot({
      path: `tests/visual/screenshots/profile-auth-gate-${testInfo.project.name}.png`,
      fullPage: true,
    });

    // 2. Sign in as demo member: client@sheaura.com / sheaura2025!
    const passwordInput = page.locator("input[type='password']");
    const submitBtn = page.locator("button[type='submit']");

    await emailInput.fill("client@sheaura.com");
    await passwordInput.fill("sheaura2025!");
    await submitBtn.click();

    // 3. Wait for the Member Profile Dashboard to mount
    const accountDashboard = page.locator(".account-dashboard");
    await expect(accountDashboard).toBeVisible({ timeout: 15000 });

    // Capture the Member Profile Overview
    await page.screenshot({
      path: `tests/visual/screenshots/profile-overview-${testInfo.project.name}.png`,
      fullPage: true,
    });

    // 4. Click Orders Tab
    const ordersTab = page.locator("button:has-text('Orders')").first();
    await expect(ordersTab).toBeVisible();
    await ordersTab.click();
    await page.waitForTimeout(500);

    // Capture the Orders & Deliveries Tab
    await page.screenshot({
      path: `tests/visual/screenshots/profile-orders-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
