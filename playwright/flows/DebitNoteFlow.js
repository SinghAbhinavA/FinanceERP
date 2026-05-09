const DebitNotePage = require('../pages/DebitNotePage');

class DebitNoteFlow {
    constructor(page) {
        this.page = page;
        this.debitNotePage = new DebitNotePage(page);
    }

    // 🔹 Returns result object (for regression tests)
    async createDebitNoteResult(data) {
        return await this.debitNotePage.createDebitNote(data);
    }

    // 🔹 Single execution — throws on failure
    async createDebitNote(data) {
        const result = await this.debitNotePage.createDebitNote(data);

        if (result.status === 'SUCCESS') {
            console.log(`✅ Debit Note Created: ${result.orderNumber || result.message}`);
            return result;
        }

        console.warn(`⚠️ Debit Note Failed: ${result.type} → ${result.message}`);
        throw new Error(result.message);
    }

    // 🔹 Reset page before retry
    async reset() {
        await this.page.reload({ waitUntil: 'networkidle' });
        await this.debitNotePage.waitForPageLoad();
        await this.debitNotePage.navigate();
    }
}

module.exports = DebitNoteFlow;
