const LoginPage = require('../pages/LoginPage');
const JnlpHelper = require('./jnlpHelper');
const config = require('../config/env');
const { retry } = require('../utils/retryHelper');

async function loginAs(role, browser, options = {}) {
    // Support both number (for backward compatibility) and object
    let maxAttempts = 1;
    let skipJnlp = false;
    let jnlpUrl = null;
    if (typeof options === 'number') {
        maxAttempts = options;
    } else if (typeof options === 'object') {
        maxAttempts = options.maxAttempts || 1;
        skipJnlp = options.skipJnlp || false;
        jnlpUrl = options.jnlpUrl;
    }

    return await retry(async () => {
        const context = await browser.newContext();
       
       

        try {
            let url;
            if (skipJnlp) {
                url = jnlpUrl || config.baseURL;
                console.log('🚀 Using configured URL:', url);
            } else {
                console.log('🚀 Launching JNLP...');
                url = await retry(async () => {
                    const launchedUrl = await JnlpHelper.launchAndGetURL();
                    if (!launchedUrl) throw new Error('JNLP URL not found');
                    return launchedUrl;
                }, 2);
            }

             const page = await context.newPage();
             const loginPage = new LoginPage(page);
            console.log('🌐 Navigating...');
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            console.log(`🔐 Login as ${role}...`);
            await loginPage.login(
                config[role].username,
                config[role].password
            );
            await loginPage.waitForLoginSuccess();
            await page.waitForLoadState('networkidle');

            console.log(`✅ ${role} login successful`);
            return { context, page };
        } catch (error) {
            await context.close().catch(() => {});
            throw error;
        }
    }, maxAttempts);
}

module.exports = { loginAs };