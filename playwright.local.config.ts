import { defineConfig, devices } from '@playwright/test';

// Playwright 1.63 also records an ARIA snapshot after failure unless disabled.
// A failed MFA field could otherwise be persisted despite trace/screenshot: off.
process.env.PLAYWRIGHT_NO_COPY_PROMPT = '1';

/** Authenticated tests against an already running, synthetic local installation. */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'local-flow.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  outputDir: './.local/e2e-results',
  use: {
    ...devices['Desktop Chrome'],
    channel: process.env.LOCAL_TEST_BROWSER === 'chrome' ? 'chrome' : 'msedge',
    baseURL: 'http://127.0.0.1:3000',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // These tests handle passwords, sessions, and an authenticator secret.
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
});
