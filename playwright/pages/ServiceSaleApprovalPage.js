const BasePage = require('./BasePage');

class ServiceSaleApprovalPage extends BasePage {
    constructor(page) {
        super(page);

        // ── Menu Navigation ──────────────────────────────────────────
        this.serviceMenu = page.locator('span.ps-menu-label:has-text("Services")');
        this.serviceSaleSubMenu = page.locator('span.ps-menu-label:has-text("Sale Order & Notes")');
        this.serviceDashboard = page.locator('a[href*="sale-order-dashboard"]');

        // ── Dashboard Elements ───────────────────────────────────────
        this.searchInput = page.getByRole('textbox', { name: 'Search here' }).first();
        this.confirmButton = page.getByRole('button', { name: 'Yes, Approve this Sale Order' });

        // ── Result ───────────────────────────────────────────────────
        this.toast = page.locator('.toast-body');
    }

    async navigateToDashboard() {
        await this.click(this.serviceMenu);
        await this.click(this.serviceSaleSubMenu);
        await this.click(this.serviceDashboard);
        await this.waitForPageLoad();
        await this.waitForElement(this.searchInput);
    }

    async saleOrderApprove(orderNumber) {
        await this.fill(this.searchInput, orderNumber);

        // Wait for the grid to filter results before locating the row
        await this.page.waitForLoadState('networkidle');

        const row = this.page.locator('div[role="row"]', { hasText: orderNumber }).first();
        await this.waitForElement(row);

        const approveBtn = row.locator('a[id^="Approve_"]');
        await this.click(approveBtn);

        await this.click(this.confirmButton);

        return await this.detectResult(this.toast);
    }
}

module.exports = ServiceSaleApprovalPage;
