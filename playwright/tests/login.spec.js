const { test, expect } = require('@playwright/test');
const { loginAs } = require('../utils/authHelper');

test('Login as maker via JNLP tokenized URL', async ({ browser }) => {
    let context;

    try {
        console.log('Logging in as maker...');
        const session = await loginAs('maker', browser, { maxAttempts: 1 });
        context = session.context;

        console.log('Maker login successful');
        await expect(session.page.locator('img[alt="Optival Health Solutions Pvt Ltd"]')).toBeVisible();
    } finally {
        if (context) await context.close().catch(() => {});
    }
});
