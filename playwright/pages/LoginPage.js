const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    constructor(page) {
        super(page);

        this.usernameInput = page.locator('input[name="username"], #name, [type="text"]').first();
        this.passwordInput = page.locator('input[name="password"], #password-input, #password').first();
        this.companySelect = page.locator('select[name="company"], #company').first();
        this.loginBtn = page.locator('button:has-text("Login"), button:has-text("Sign In"), #loginSubmit').first();
        this.successImage = page.locator('img[alt="Optival Health Solutions Pvt Ltd"]');
    }

    async navigate(url) {
        await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    }

    async login(username, password, companyIndex = 1) {
        await this.fill(this.usernameInput, username);
        await this.fill(this.passwordInput, password);

        if (await this.companySelect.isVisible().catch(() => false)) {
            await this.companySelect.selectOption({ index: companyIndex });
        }

        await this.click(this.loginBtn);
    }

    async waitForLoginSuccess(timeout = 30000) {
        await this.successImage.waitFor({ state: 'visible', timeout });
    }

    async isLoggedIn() {
        return this.successImage.isVisible().catch(() => false);
    }
}

module.exports = LoginPage;
