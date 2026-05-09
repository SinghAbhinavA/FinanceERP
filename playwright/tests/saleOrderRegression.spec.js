const { test, expect } = require('@playwright/test');
const { loginAs } = require('../utils/authHelper');
const { getDatasets } = require('../utils/dataLoader');
const SaleOrderFlow = require('../flows/SaleOrderFlow');
const ApprovalFlow = require('../flows/ApprovalFlow');

const allData = getDatasets('saleOrderRegression');

test.describe.serial('Sale Order Regression Tests', () => {
    let makerSession;
    let checkerSession;
    const successfulOrders = [];

    test.beforeAll(async ({ browser }) => {
        console.log('Logging in as maker...');
        makerSession = await loginAs('maker', browser, { maxAttempts: 2 });
        console.log('Maker login successful');
    });

    test.afterAll(async () => {
        if (makerSession) await makerSession.context.close().catch(() => {});
        if (checkerSession) await checkerSession.context.close().catch(() => {});
    });

    for (const [index, dataSet] of allData.entries()) {
        test(`${index + 1}. ${dataSet.testCase}`, async ({}, testInfo) => {
            const saleFlow = new SaleOrderFlow(makerSession.page);

            // On Playwright retry: reset page state before re-attempting
            if (testInfo.retry > 0) {
                console.log(`Retry ${testInfo.retry} detected — resetting page state`);
                await saleFlow.reset();
            }

            const result = await saleFlow.createOrderResult(dataSet.data);

            if (dataSet.expected === 'success') {
                expect(result.status, result.message).toBe('SUCCESS');
                expect(result.orderNumber, 'Order number should be present on success').toBeDefined();
                successfulOrders.push(result.orderNumber);
            } else {
                expect(result.status, result.message).toBe('ERROR');
                // Validate the error message contains expected content if defined in test data
                if (dataSet.errorMessage) {
                    expect(
                        result.message,
                        `Expected error message to contain: "${dataSet.errorMessage}"`
                    ).toContain(dataSet.errorMessage);
                }
            }
        });
    }

    test('Approve all successful orders', async ({ browser }) => {
        if (successfulOrders.length === 0) {
            console.log('No orders to approve — skipping');
            return;
        }

        console.log(`Approving ${successfulOrders.length} order(s): ${successfulOrders.join(', ')}`);

        checkerSession = await loginAs('checker', browser, { maxAttempts: 2 });
        const approvalFlow = new ApprovalFlow(checkerSession.page);

        for (const order of successfulOrders) {
            await approvalFlow.approveOrder(order);
            console.log(`✅ Approved order: ${order}`);
        }

        console.log('All orders approved successfully');
    });
});
