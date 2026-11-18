import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/en",
  "/si",
  "/en/products",
  "/si/products",
  "/en/products/eventloom",
  "/si/products/eventloom",
  "/en/services",
  "/si/services",
  "/en/growth",
  "/si/growth",
  "/en/about",
  "/si/about",
  "/en/feedback",
  "/si/feedback",
  "/en/contact",
  "/si/contact",
];

test.describe("Responsive & Bilingual Matrix (EN + SI) + Security Headers", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`renders ${route} with zero horizontal overflow and strict security headers`, async ({
      page,
    }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);

      // Verify security headers (Section 11.5)
      const headers = response?.headers() ?? {};
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["content-security-policy"]).toBeTruthy();

      // Verify no horizontal overflow at current viewport width (Section 10B)
      const hasOverflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(hasOverflow).toBe(false);
    });
  }

  test("unauthenticated /admin redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
