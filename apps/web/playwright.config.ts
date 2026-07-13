import { defineConfig } from "@playwright/test";

/**
 * E2E smoke tests (AGENTS.md §4). Locally drives the installed Chrome
 * (network policy blocks Playwright's browser download); CI installs and
 * uses Playwright's Chromium.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4321",
    ...(process.env.CI ? {} : { channel: "chrome" as const }),
  },
  webServer: {
    command: "pnpm build && pnpm start -p 4321",
    url: "http://localhost:4321",
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
  },
});
