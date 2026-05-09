/**
 * Retry utility for genuinely flaky operations (e.g., JNLP launch, external API calls)
 * 
 * ✅ Use for:
 * - JNLP/process launches
 * - External API/network calls
 * - System-level operations
 * 
 * ❌ DON'T use for:
 * - DOM interactions (Playwright has auto-waits)
 * - Element clicks/fills (covered by BasePage methods)
 * - Assertions (use expect with retries)
 * - Page navigation (handled by waitForLoadState)
 * - Test-level failures (configured in playwright.config.js: retries: 2)
 */
async function retry(action, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await action();
        } catch (err) {
            if (i === retries - 1) throw err;
            console.log(`🔁 Retry ${i + 1}/${retries}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between retries
        }
    }
}

module.exports = { retry };