const { test, expect } = require('@playwright/test');
const { loginAs } = require('../utils/authHelper');

/**
 * Smoke test: Verifies the full JNLP launch → login → main menu navigation flow.
 * Run this first to confirm the environment is healthy before executing regression suites.
 */
test.describe('Smoke - JNLP Launch & Navigation', () => {

    let session;

    test.afterAll(async () => {
        if (session) await session.context.close().catch(() => {});
    });

    test('Launch JNLP, login as maker and verify Services menu', async ({ browser }) => {
        console.log('🚀 Starting JNLP smoke test...');

        session = await loginAs('maker', browser, { maxAttempts: 2 });
        const { page } = session;

        console.log('✅ Login successful — verifying main menu');

        // Verify the user logo / home screen is visible after login
        await expect(page.locator('img[alt="Optival Health Solutions Pvt Ltd"]')).toBeVisible();

        // Verify the Services menu entry is accessible
        const servicesMenu = page.locator('span.ps-menu-label:has-text("Services")');
        await expect(servicesMenu).toBeVisible();

        console.log('✅ Services menu is visible — environment is healthy');
    });
});
