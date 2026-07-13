import { expect, test } from "@playwright/test";

/** Every public route renders with its key content (Phase 1 launch surface). */

const routes: Array<{ path: string; expectText: string }> = [
  { path: "/", expectText: "Schengen 90/180 day calculator" },
  { path: "/calculator", expectText: "Schengen 90/180 day calculator" },
  { path: "/rules/90-180-rule", expectText: "The short answer" },
  { path: "/ees", expectText: "Entry/Exit System" },
  { path: "/ees/what-to-expect", expectText: "no more passport stamps" },
  { path: "/ees/dispute-overstay", expectText: "Article 52" },
  { path: "/etias/status", expectText: "ETIAS launch tracker" },
  { path: "/etias/us", expectText: "ETIAS for US citizens" },
  { path: "/etias/ua", expectText: "biometric passports" },
  { path: "/ees/data-access/fr", expectText: "CNIL" },
  { path: "/ees/data-access/de", expectText: "45 days" },
  { path: "/guides/dual-citizens", expectText: "not a Union citizen" },
  { path: "/guides/residence-permit-holders", expectText: "shall not be taken into account" },
  { path: "/about", expectText: "About" },
  { path: "/methodology", expectText: "primary official source" },
  { path: "/sources", expectText: "countries.json" },
];

for (const { path, expectText } of routes) {
  test(`${path} renders`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(expectText);
    // Sitewide disclaimer (AGENTS.md §10) present in the footer everywhere.
    await expect(page.locator("footer")).toContainText("not legal advice");
  });
}

test("/etias/status renders the verified data values", async ({ page }) => {
  await page.goto("/etias/status");
  await expect(page.locator("body")).toContainText("Not live yet");
  await expect(page.locator("body")).toContainText("€20");
  await expect(page.locator("body")).toContainText("last quarter of 2026");
});

test("unknown nationality pages 404 instead of rendering thin content", async ({ page }) => {
  const response = await page.goto("/etias/xx");
  expect(response?.status()).toBe(404);
});

test("unverified EES countries 404 instead of rendering thin content", async ({ page }) => {
  const response = await page.goto("/ees/data-access/pl");
  expect(response?.status()).toBe(404);
});

test("EES country page shows both template letters", async ({ page }) => {
  await page.goto("/ees/data-access/it");
  await expect(page.getByText("Template letter — Italian")).toBeVisible();
  await expect(page.getByText("Template letter — English")).toBeVisible();
  await page.getByText("Template letter — Italian").click();
  await expect(page.locator("body")).toContainText("articolo 52 del regolamento (UE) 2017/2226");
});

test("sitemap and robots respond", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/rules/90-180-rule");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
});

test("header navigation reaches the guide pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "90/180 rule" }).click();
  await expect(page).toHaveURL(/\/rules\/90-180-rule$/);
  await page.getByRole("link", { name: "ETIAS" }).click();
  await expect(page).toHaveURL(/\/etias\/status$/);
});
