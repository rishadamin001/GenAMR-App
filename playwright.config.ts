import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*e2e.spec.ts",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: true,
        timeout: 120000,
      },
});
