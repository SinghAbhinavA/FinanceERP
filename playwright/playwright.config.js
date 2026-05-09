const { defineConfig } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = defineConfig({

  testDir: './tests',

  // JNLP requires sequential execution
  fullyParallel: false,
  workers: 1,

  // Use Playwright's built-in retry instead of manual retry-only approach
  retries: process.env.CI ? 2 : 1,
  forbidOnly: !!process.env.CI,
  //retries: 0,

  timeout: 10 * 60 * 1000,

  expect: {
    timeout: 10000
  },

 reporter: [
  ['list'],
  ['html', { outputFolder: 'report', open: 'never' }],
  ['allure-playwright']
],

  use: {
    // Headless in CI, headed locally for debugging
    headless: !!process.env.CI,

    baseURL: process.env.BASE_URL || '',

    viewport: { width: 1366, height: 768 },

    actionTimeout: 15000,
    navigationTimeout: 60000,

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    ignoreHTTPSErrors: true
  },
  

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium'
      }
    }
  ]

});