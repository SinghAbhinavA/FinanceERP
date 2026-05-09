const BasePage = require('./BasePage');

class ServiceSalePage extends BasePage {
    constructor(page) {
        super(page);

        // ── Menu Navigation ──────────────────────────────────────────
        this.serviceMenu = page.locator('span.ps-menu-label:has-text("Services")');
        this.serviceSaleSubMenu = page.locator('span.ps-menu-label:has-text("Sale Order & Notes")');
        this.serviceSaleLink = page.getByRole('link', { name: 'Sale Order' });

        // ── Header Inputs ────────────────────────────────────────────
        this.stateInput = page.locator('#State');
        this.segmentInput = page.locator('#Segment');
        this.billingLocationInput = page.locator('#Location');

        this.accountTypeInput = page.getByRole('combobox', { name: 'Account Type' });
        this.servicePartnerInput = page.getByRole('combobox', { name: 'Service Partner' });
        this.divisionInput = page.getByRole('combobox', { name: 'Division' });
        this.postingProfileInput = page.getByRole('combobox', { name: 'Posting Profile' });

        this.postingDateInput = page.getByRole('textbox', { name: 'date input' });

        this.employeeInput = page.getByRole('combobox', { name: 'Employee' });
        this.vehicleInput = page.getByRole('combobox', { name: 'Vehicle' });

        // ── Actions ──────────────────────────────────────────────────
        this.addButton = page.locator('#Add');
        this.createSaleOrderButton = page.getByRole('button', { name: 'Create Sale Order' });
        this.confirmButton = page.getByRole('button', { name: 'Yes, Create this Sale Order' });

        // ── Toast ────────────────────────────────────────────────────
        this.toast = page.locator('.toast-body');

        // ── Grid column index map ────────────────────────────────────
        this.columns = {
            service: 1,
            location: 6,
            quantity: 7,
            rate: 8,
        };
    }

    async navigate() {
        await this.click(this.serviceMenu);
        await this.click(this.serviceSaleSubMenu);
        await this.click(this.serviceSaleLink);
        await this.waitForPageLoad();
    }

    async fillHeader(data) {
        await this.selectDropdown(this.stateInput, data.state);
        await this.selectDropdown(this.segmentInput, data.segment);
        await this.selectDropdown(this.billingLocationInput, data.billingLocation);

        await this.selectDropdown(this.accountTypeInput, data.accountType);
        await this.selectDropdown(this.servicePartnerInput, data.servicePartner);
        await this.selectDropdown(this.divisionInput, data.division);
        await this.selectDropdown(this.postingProfileInput, data.postingProfile);

        await this.fill(this.postingDateInput, data.postingDate);

        await this.selectDropdown(this.employeeInput, data.employee);
        await this.selectDropdown(this.vehicleInput, data.vehicle);
    }

    // ── Extract line items (supports both legacy single-item and new multi-item formats) ──────
    extractLineItems(data) {
        if (!data) {
            return [];
        }

        // ✅ NEW FORMAT: data.lineItems = [{serviceId, locationId, quantity, rate}, ...]
        if (Array.isArray(data.lineItems)) {
            return data.lineItems;
        }

        // ✅ LEGACY FORMAT: data.serviceId, data.locationId, data.quantity, data.rate
        if (data.serviceId !== undefined || data.locationId !== undefined || data.quantity !== undefined || data.rate !== undefined) {
            return [
                {
                    serviceId: data.serviceId,
                    locationId: data.locationId,
                    quantity: data.quantity,
                    rate: data.rate
                }
            ];
        }

        return [];
    }

    async fillGrid(data) {
        const lineItems = this.extractLineItems(data);

        if (lineItems.length === 0) {
            throw new Error('ServiceSalePage.fillGrid: no line items found in data');
        }

        // ✅ Support multiple line items
        // Row index 1 always targets the current editable (bottom/new) row.
        // After clicking Add the grid commits the row and resets a fresh editable row at index 1.
        for (const [index, item] of lineItems.entries()) {
            const row = this.getRow(1);
            await row.waitFor({ state: 'visible' });

            await this.fillGridDropdown(row, this.columns.service, item.serviceId);

            await row.locator(`[aria-colindex="${this.columns.location}"]`)
                .waitFor({ state: 'visible', timeout: 5000 });

            await this.fillGridDropdown(row, this.columns.location, item.locationId);
            await this.fillGridCell(row, this.columns.quantity, item.quantity);
            await this.fillGridCell(row, this.columns.rate, item.rate);

            await this.click(this.addButton);
            console.log(`✅ Added line item ${index + 1}`);

            // Wait for the grid to settle before filling the next row
            if (index < lineItems.length - 1) {
                await this.page.waitForLoadState('domcontentloaded');
            }
        }
    }

    async submitOrder() {
        await this.click(this.createSaleOrderButton);
        await this.waitForPageLoad();
        await this.click(this.confirmButton);
    }
}

module.exports = ServiceSalePage;
