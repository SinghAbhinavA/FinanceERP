const BasePage = require('./BasePage');

class DebitNotePage extends BasePage {
    constructor(page) {
        super(page);

        // ── Menu Navigation ──────────────────────────────────────────
        this.serviceMenu = page.locator('span.ps-menu-label:has-text("Services")');
        this.serviceSaleSubMenu = page.locator('span.ps-menu-label:has-text("Sale Order & Notes")');
        this.debitNoteLink = page.getByRole('link', { name: 'Debit Note' }).first();

        // ── Header Fields ─────────────────────────────────────────────
        this.accountTypeDropdown = page.getByRole('combobox', { name: 'Account Type' });
        this.servicePartnerInput = page.getByRole('combobox', { name: 'Service Partner' });
        this.invoiceNumberInput = page.locator('#invoiceNumber');
        this.debitNoteTypeDropdown = page.getByRole('combobox', { name: 'Debit Note Type' });
        this.categoryDropdown = page.getByRole('combobox', { name: 'Category' });

        // ── Grid ─────────────────────────────────────────────────────
        this.selectAllCheckbox = page.getByRole('checkbox', { name: 'Select All' });

        // ── Actions ──────────────────────────────────────────────────
        this.createDebitNoteButton = page.getByRole('button', { name: 'Create Debit Note' });
        this.confirmButton = page.getByRole('button', { name: 'Yes, Create Debit Note' });

        // ── Result ───────────────────────────────────────────────────
        this.toast = page.locator('.toast-body');
    }

    async navigate() {
        await this.click(this.serviceMenu);
        await this.click(this.serviceSaleSubMenu);
        await this.click(this.debitNoteLink);
        await this.waitForPageLoad();
    }

    async fillHeader(data) {
        await this.selectDropdown(this.accountTypeDropdown, data.accountType);
        await this.selectDropdown(this.servicePartnerInput, data.servicePartner);

        await this.click(this.invoiceNumberInput);
        await this.fill(this.invoiceNumberInput, data.invoiceNumber);
        // Tab out to trigger the invoice lookup
        await this.invoiceNumberInput.press('Tab');

        // Wait for the invoice lookup to resolve (options may appear in a listbox)
        await this.page.waitForLoadState('networkidle');

        if (data.debitNoteType) {
            await this.selectDropdown(this.debitNoteTypeDropdown, data.debitNoteType);
        }

        if (data.category) {
            await this.selectDropdown(this.categoryDropdown, data.category);
        }
    }

    async selectAllLineItems() {
        await this.waitForElement(this.selectAllCheckbox);
        await this.selectAllCheckbox.check();
    }

    async submitDebitNote() {
        await this.click(this.createDebitNoteButton);
        await this.waitForPageLoad();
        await this.click(this.confirmButton);
    }

    // ── Main flow entry point ─────────────────────────────────────────

    async createDebitNote(data, options = {}) {
        const {
            navigate = true,
            fillHeader = true,
            selectAll = true,
            submit = true,
        } = options;

        try {
            if (navigate) await this.navigate();

            if (fillHeader) {
                try {
                    await this.fillHeader(data);
                } catch (error) {
                    return { status: 'ERROR', type: 'HEADER_VALIDATION', message: error.message };
                }
            }

            if (selectAll) {
                try {
                    await this.selectAllLineItems();
                } catch (error) {
                    return { status: 'ERROR', type: 'GRID_VALIDATION', message: error.message };
                }
            }

            if (submit) await this.submitDebitNote();

            return await this.detectResult(this.toast);
        } catch (error) {
            return { status: 'ERROR', type: 'SYSTEM', message: error.message };
        }
    }
}

module.exports = DebitNotePage;
