class BasePage {
    constructor(page) {
        this.page = page;
    }

    // ── Generic Actions ───────────────────────────────────────────────

    async click(locator) {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
    }

    async fill(locator, value) {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(String(value));
    }

    async getText(locator) {
        await locator.waitFor({ state: 'visible' });
        return await locator.textContent();
    }

    async isVisible(locator) {
        return await locator.isVisible();
    }

    // ── Safe Click (for flaky/overlay elements) ───────────────────────

    async safeClick(locator) {
        try {
            await locator.waitFor({ state: 'visible', timeout: 5000 });
            await locator.click();
        } catch (e) {
            console.warn(`⚠️ safeClick: element not visible after 5s (${e.message}), attempting force click`);
            await locator.click({ force: true });
        }
    }

    // ── Wait Helpers ──────────────────────────────────────────────────

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    async waitForElement(locator, timeout = 10000) {
        await locator.waitFor({ state: 'visible', timeout });
    }

    // ── Private: shared listbox option picker ─────────────────────────
    // Used by both selectDropdown and fillGridDropdown to avoid duplication.

    async _pickFromListbox(value, retries = 2) {
        const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        for (let i = 0; i < retries; i++) {
            try {
                const listbox = this.page.getByRole('listbox');
                await listbox.waitFor({ state: 'visible', timeout: 4000 });

                const option = listbox.getByRole('option', { name: new RegExp(escaped, 'i') });
                await option.first().waitFor({ state: 'visible', timeout: 3000 });
                await option.first().click();
                return;
            } catch (e) {
                if (i === retries - 1) {
                    throw new Error(`Option not found in listbox: "${value}"\n${e.message}`);
                }
                await this.page.waitForTimeout(500);
            }
        }
    }

    // ── Dropdown Handler (form/header fields) ─────────────────────────

    async selectDropdown(input, value) {
    if (!value) return;

    await this.retry(async () => {
        await this.click(input);
        await this.fill(input, value);
        await this._pickFromListbox(value);
    }, { actionName: `Select dropdown: ${value}` });
}
    
    // ── Grid Helpers ──────────────────────────────────────────────────

    getRow(rowIndex = 1) {
        return this.page.locator('[role="row"]').nth(rowIndex);
    }

    async fillGridCell(row, colIndex, value) {
        const cell = row.locator(`[aria-colindex="${colIndex}"]`);
        await cell.click();
        const input = cell.locator('input:visible, [contenteditable="true"]:visible').first();
        await input.waitFor({ state: 'visible' });
        await input.fill(String(value));
    }

    async fillGridDropdown(row, colIndex, value) {
        if (!value) return;
       await this.retry(async () => {
        const cell = row.locator(`[aria-colindex="${colIndex}"]`);
        await cell.click();
        const input = cell.locator('input:visible').first();
        await input.waitFor({ state: 'visible', timeout: 3000 });
        await input.fill(String(value));
        await this._pickFromListbox(value);
         }, { actionName: `Fill grid dropdown: ${value}` });
    }
    
    // ── Result Detection ──────────────────────────────────────────────
    // Pass the page-specific toast locator (e.g. this.toast from a page class).
    // Falls back to '.toast-body' if none provided.

    async detectResult(toastLocator = null) {
        const toast = toastLocator ?? this.page.locator('.toast-body');
        let text = null;

        try {
            await toast.waitFor({ state: 'visible', timeout: 10000 });
            text = await toast.textContent();
        } catch {
            console.warn('⚠️ Toast not visible, checking page for order number...');
        }

        if (!text) {
            const pageText = await this.page.textContent('body');
            const match = pageText.match(/Order Number:\s*(\d+)/);
            if (match) {
                return { status: 'SUCCESS', orderNumber: match[1], message: 'Detected via page content' };
            }
            return { status: 'ERROR', type: 'SYSTEM', message: 'No toast or success indicator found' };
        }

        if (/error|failed|invalid/i.test(text)) {
            return { status: 'ERROR', type: 'BUSINESS', message: text };
        }

        const match = text.match(/Order Number:\s*(\d+)/);
        if (match) {
            return { status: 'SUCCESS', orderNumber: match[1], message: text };
        }

        return { status: 'ERROR', type: 'UNKNOWN', message: text };
    }

    async retry(action, options = {}) {
        const {
            retries = 2,
            delay = 500,
            actionName = 'UI Action'
        } = options;

        let lastError;

        for (let attempt = 1; attempt <= retries + 1; attempt++) {
            try {
                return await action();
            } catch (error) {
                lastError = error;

                console.warn(
                    `${actionName} failed (Attempt ${attempt}/${retries + 1}): ${error.message}`
                );

                if (attempt <= retries) {
                    await this.page.waitForTimeout(delay);
                }
            }
        }

        throw new Error(`${actionName} failed after ${retries + 1} attempts: ${lastError.message}`);
    }
}

module.exports = BasePage;
