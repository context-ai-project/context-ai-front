import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Visual regression snapshot configuration */
  expect: {
    toHaveScreenshot: {
      /* Allowed pixel-level difference ratio (0.2 = 20% tolerance) */
      maxDiffPixelRatio: 0.05,
      /* Animation must settle before capturing */
      animations: 'disabled',
      /* Consistent rendering across runs */
      caret: 'hide',
    },
  },

  /* Snapshot path template: group by project name for cross-browser baselines */
  snapshotPathTemplate: '{testDir}/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}',

  /* Web Server to run before starting tests */
  webServer: {
    command:
      'E2E_BYPASS_AUTH=true ' +
      'AUTH_SECRET=e2e-test-secret-for-playwright-only ' +
      'NEXTAUTH_URL=http://localhost:3000 ' +
      'AUTH0_CLIENT_ID=e2e-test-client-id ' +
      'AUTH0_CLIENT_SECRET=e2e-test-client-secret ' +
      'AUTH0_ISSUER=https://e2e-test.auth0.com ' +
      'AUTH0_AUDIENCE=http://localhost:3001 ' +
      'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // Don't reuse in CI, allow reuse in local dev
    timeout: 120 * 1000, // 2 minutes
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
