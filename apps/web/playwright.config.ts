import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', workers: 1, timeout: 45000,
  expect: { timeout: 15000 },
  use: { baseURL: process.env.WEB_URL || 'http://localhost:53000', headless: true, channel: 'chromium' },
  reporter: 'list',
});
