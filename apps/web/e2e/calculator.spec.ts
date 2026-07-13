import { expect, test, type Page } from "@playwright/test";

/**
 * End-to-end calculator scenarios through the real UI. Fixed dates are used
 * (the "check my status on" field is set explicitly) so results are
 * deterministic regardless of when the tests run.
 */

async function fillFirstTrip(page: Page, entry: string, exit: string) {
  await page.getByLabel("Entry date").first().fill(entry);
  await page.getByLabel("Exit date").first().fill(exit);
}

async function setCheckDate(page: Page, date: string) {
  await page.getByLabel("Check my status on").fill(date);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/calculator");
  // The calculator is client-side; wait for hydration to replace the skeleton.
  await expect(page.getByLabel("Entry date").first()).toBeVisible();
});

test("counts a simple stay: 10 days used, 80 remaining", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await setCheckDate(page, "2026-06-30");
  await expect(page.getByTestId("days-used")).toHaveText("10");
  await expect(page.getByTestId("days-remaining")).toHaveText("80");
});

test("flags an overstay beyond 90 days in the window", async ({ page }) => {
  await fillFirstTrip(page, "2026-01-01", "2026-04-10"); // 100 days
  await setCheckDate(page, "2026-04-10");
  await expect(page.getByTestId("days-used")).toHaveText("100");
  await expect(page.getByTestId("days-remaining")).toHaveText("0");
  await expect(page.getByTestId("overstay-warning")).toContainText("exceeds");
});

test("excludes days in a non-Schengen country (Ireland)", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await page.getByLabel("Country (optional)").first().selectOption("IE");
  await setCheckDate(page, "2026-06-30");
  await expect(page.getByTestId("days-used")).toHaveText("0");
  await expect(page.getByTestId("exclusion-note")).toContainText("Ireland");
});

test("handles Bulgaria's 2024 accession date per-day", async ({ page }) => {
  // BG joined Schengen 2024-03-31 (Council Decision (EU) 2024/210):
  // 1–30 Mar 2024 must not count; 31 Mar – 10 Apr (11 days) must.
  await fillFirstTrip(page, "2024-03-01", "2024-04-10");
  await page.getByLabel("Country (optional)").first().selectOption("BG");
  await setCheckDate(page, "2024-04-10");
  await expect(page.getByTestId("days-used")).toHaveText("11");
  await expect(page.getByTestId("exclusion-note")).toContainText("Bulgaria");
  await expect(page.getByTestId("exclusion-note")).toContainText("30 days");
});

test("excludes a residence-permit stay in the issuing country", async ({ page }) => {
  await fillFirstTrip(page, "2026-01-01", "2026-06-30"); // half a year
  await page.getByLabel("Country (optional)").first().selectOption("ES");
  await page.getByLabel(/residence permit or long-stay/).first().check();
  await setCheckDate(page, "2026-06-30");
  await expect(page.getByTestId("days-used")).toHaveText("0");
  await expect(page.getByTestId("exclusion-note")).toContainText("Spain");
});

test("permit checkbox is disabled until a country is picked", async ({ page }) => {
  await expect(page.getByLabel(/residence permit or long-stay/).first()).toBeDisabled();
});

test("rejects a 91-day planned trip with the first violating day", async ({ page }) => {
  await setCheckDate(page, "2026-07-01");
  await page.getByLabel("Planned entry").fill("2026-08-01");
  await page.getByLabel("Planned exit").fill("2026-10-30"); // 91 days
  const result = page.getByTestId("plan-result");
  await expect(result).toContainText("breaks the 90/180 rule");
  await expect(result).toContainText("Oct 29, 2026"); // latest safe exit
});

test("accepts a compliant planned trip", async ({ page }) => {
  await setCheckDate(page, "2026-07-01");
  await page.getByLabel("Planned entry").fill("2026-08-01");
  await page.getByLabel("Planned exit").fill("2026-10-29"); // exactly 90 days
  await expect(page.getByTestId("plan-result")).toContainText("fits");
});

test("share writes state into the URL and restores it on load", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await page.getByLabel("Country (optional)").first().selectOption("FR");
  await setCheckDate(page, "2026-06-30");
  await page.getByRole("button", { name: "Copy shareable link" }).click();
  await expect(page).toHaveURL(/t=2026-06-01\.2026-06-10\.FR/);

  // A fresh navigation to the shared URL restores the computation.
  await page.goto(`/calculator?t=2026-06-01.2026-06-10.FR&d=2026-06-30`);
  await expect(page.getByTestId("days-used")).toHaveText("10");
  await expect(page.getByLabel("Country (optional)").first()).toHaveValue("FR");
});

test("shows the error state instead of computing for reversed dates", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-10", "2026-06-01");
  await expect(page.getByText("Entry date is after exit date.")).toBeVisible();
  // The reversed trip is ignored, not silently included.
  await setCheckDate(page, "2026-06-30");
  await expect(page.getByTestId("days-used")).toHaveText("0");
});

test("works at mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await setCheckDate(page, "2026-06-30");
  await expect(page.getByTestId("days-used")).toHaveText("10");
  // No horizontal overflow on mobile.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
