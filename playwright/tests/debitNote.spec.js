const { test, expect } = require('@playwright/test');
const { loginAs } = require('../utils/authHelper');
const { getDatasets } = require('../utils/dataLoader');
const DebitNoteFlow = require('../flows/DebitNoteFlow');

const allData = getDatasets('debitNote');

test.describe.serial('Debit Note Regression Tests', () => {
    let makerSession;

    test.beforeAll(async ({ browser }) => {
        console.log('Logging in as maker...');
        makerSession = await loginAs('maker', browser, { maxAttempts: 2 });
        console.log('Maker login successful');
    });

    test.afterAll(async () => {
        if (makerSession) await makerSession.context.close().catch(() => {});
    });

    for (const [index, dataSet] of allData.entries()) {
        test(`${index + 1}. ${dataSet.testCase}`, async ({}, testInfo) => {
            const debitNoteFlow = new DebitNoteFlow(makerSession.page);

            // On Playwright retry: reset page state before re-attempting
            if (testInfo.retry > 0) {
                console.log(`Retry ${testInfo.retry} detected — resetting page state`);
                await debitNoteFlow.reset();
            }

            const result = await debitNoteFlow.createDebitNoteResult(dataSet.data);

            if (dataSet.expected === 'success') {
                expect(result.status, result.message).toBe('SUCCESS');
            } else {
                expect(result.status, result.message).toBe('ERROR');
                if (dataSet.errorMessage) {
                    expect(
                        result.message,
                        `Expected error message to contain: "${dataSet.errorMessage}"`
                    ).toContain(dataSet.errorMessage);
                }
            }
        });
    }
});
