import { defineConfig } from "@playwright/test";
const preview = process.env.PLAYWRIGHT_PREVIEW === "true";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://127.0.0.1:4173${preview && process.env.GITHUB_PAGES === "true" ? "/titanic-data-academy/" : "/"}`;
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: baseURL,
    browserName: "chromium",
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {},
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `${preview ? "npm run preview" : "npm run dev"} -- --host 127.0.0.1 --port 4173 --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
