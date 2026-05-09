const ServiceSalePage = require('../pages/ServiceSalePage');

class SaleOrderFlow {
    constructor(page) {
        this.page = page;
        this.salePage = new ServiceSalePage(page);
    }

    // 🔹 Orchestrates the full sale order creation flow
    async createOrder(data, options = {}) {
        const {
            navigate = true,
            fillHeader = true,
            fillGrid = true,
            submit = true,
        } = options;

        try {
            if (navigate) await this.salePage.navigate();

            if (fillHeader) {
                try {
                    await this.salePage.fillHeader(data);
                } catch (error) {
                    return { status: 'ERROR', type: 'HEADER_VALIDATION', message: error.message };
                }
            }

            if (fillGrid) {
                try {
                    await this.salePage.fillGrid(data);
                } catch (error) {
                    return { status: 'ERROR', type: 'GRID_VALIDATION', message: error.message };
                }
            }

            if (submit) await this.salePage.submitOrder();

            return await this.salePage.detectResult(this.salePage.toast);
        } catch (error) {
            return { status: 'ERROR', type: 'SYSTEM', message: error.message };
        }
    }

    // 🔹 Returns result object (for regression tests)
    async createOrderResult(data) {
        return await this.createOrder(data);
    }

    // 🔹 Reset page before retry
    async reset() {
        await this.page.reload({ waitUntil: 'networkidle' });
        await this.salePage.waitForPageLoad();
        await this.salePage.navigate();
    }
}

module.exports = SaleOrderFlow;