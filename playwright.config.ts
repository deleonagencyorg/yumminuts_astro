import { defineConfig, devices } from '@playwright/test';

const port = 4399;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `pnpm dev --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}/es/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
