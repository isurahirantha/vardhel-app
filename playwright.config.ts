import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "iPhone-SE-375", use: { ...devices["iPhone SE"], viewport: { width: 375, height: 667 } } },
    { name: "iPhone-14-390", use: { ...devices["iPhone 14"], viewport: { width: 390, height: 844 } } },
    { name: "Pixel-7-412", use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } } },
    { name: "iPad-Portrait-768", use: { viewport: { width: 768, height: 1024 } } },
    { name: "iPad-Landscape-1024", use: { viewport: { width: 1024, height: 768 } } },
    { name: "Laptop-1366", use: { viewport: { width: 1366, height: 768 } } },
    { name: "Desktop-1920", use: { viewport: { width: 1920, height: 1080 } } },
    { name: "Ultrawide-2560", use: { viewport: { width: 2560, height: 1440 } } },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
