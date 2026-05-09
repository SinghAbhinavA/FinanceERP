const ServiceSaleApprovalPage = require('../pages/ServiceSaleApprovalPage');

class ApprovalFlow {
    constructor(page) {
        this.page = page;
        this.approvalPage = new ServiceSaleApprovalPage(page);
    }

    async approveOrder(orderNumber) {
        await this.approvalPage.navigateToDashboard();

        const result = await this.approvalPage.saleOrderApprove(orderNumber);

        if (result.status !== 'SUCCESS') {
            throw new Error(`Approval failed for order ${orderNumber}: [${result.type}] ${result.message}`);
        }

        console.log('✅ Approved Order:', orderNumber);
        return result;
    }
}

module.exports = ApprovalFlow;  