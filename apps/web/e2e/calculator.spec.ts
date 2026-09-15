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

/** The per-trip country field is a SearchableSelect typeahead combobox, not a
 * native <select> — type enough of the label to filter to it, then click it. */
async function pickCountry(page: Page, query: string, optionName: string) {
  await page.getByLabel("Country (optional)").first().fill(query);
  await page.getByRole("option", { name: optionName, exact: true }).click();
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
  await expect(
    page.getByRole("link", { name: "What actually happens next →" }),
  ).toHaveAttribute("href", "/rules/overstay-penalties");
});

test("excludes days in a non-Schengen country (Ireland)", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await pickCountry(page, "Ireland", "Ireland");
  await setCheckDate(page, "2026-06-30");
  await expect(page.getByTestId("days-used")).toHaveText("0");
  await expect(page.getByTestId("exclusion-note")).toContainText("Ireland");
});

test("handles Bulgaria's 2024 accession date per-day", async ({ page }) => {
  // BG joined Schengen 2024-03-31 (Council Decision (EU) 2024/210):
  // 1–30 Mar 2024 must not count; 31 Mar – 10 Apr (11 days) must.
  await fillFirstTrip(page, "2024-03-01", "2024-04-10");
  await pickCountry(page, "Bulgaria", "Bulgaria");
  await setCheckDate(page, "2024-04-10");
  await expect(page.getByTestId("days-used")).toHaveText("11");
  await expect(page.getByTestId("exclusion-note")).toContainText("Bulgaria");
  await expect(page.getByTestId("exclusion-note")).toContainText("30 days");
});

test("excludes a residence-permit stay in the issuing country", async ({ page }) => {
  await fillFirstTrip(page, "2026-01-01", "2026-06-30"); // half a year
  await pickCountry(page, "Spain", "Spain");
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
  await pickCountry(page, "France", "France");
  await setCheckDate(page, "2026-06-30");
  await page.getByRole("button", { name: "Copy shareable link" }).click();
  await expect(page).toHaveURL(/t=2026-06-01\.2026-06-10\.FR/);

  // A fresh navigation to the shared URL restores the computation.
  await page.goto(`/calculator?t=2026-06-01.2026-06-10.FR&d=2026-06-30`);
  await expect(page.getByTestId("days-used")).toHaveText("10");
  await expect(page.getByLabel("Country (optional)").first()).toHaveValue("France");
});

test("shows the error state instead of computing for reversed dates", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-10", "2026-06-01");
  await expect(page.getByText("Entry date is after exit date.")).toBeVisible();
  // The reversed trip is ignored, not silently included.
  await setCheckDate(page, "2026-06-30");
  await expect(page.getByTestId("days-used")).toHaveText("0");
});

test("renders the 180-day window strip with one cell per day", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await setCheckDate(page, "2026-06-30");
  const strip = page.getByTestId("window-strip");
  await expect(strip).toBeVisible();
  await expect(strip.locator(".grid > div")).toHaveCount(180);
  await expect(strip).toContainText("Counted day");
});

test("finder answers 'when can I stay N days' with the official-example date", async ({ page }) => {
  await fillFirstTrip(page, "2024-01-01", "2024-03-30"); // 90 days used
  await setCheckDate(page, "2024-03-31");
  await page.getByLabel("Days").fill("90");
  // 90 days of absence required: earliest full 90-day stay starts 29 Jun 2024.
  await expect(page.getByTestId("finder-result")).toContainText("Jun 29, 2024");
});

test("forecast lists the longest stay for upcoming entry dates", async ({ page }) => {
  await fillFirstTrip(page, "2026-05-01", "2026-06-29"); // 60 days
  await setCheckDate(page, "2026-07-01");
  const forecast = page.getByTestId("forecast");
  await expect(forecast).toBeVisible();
  await expect(forecast.locator("li")).toHaveCount(7);
  await expect(forecast.locator("li").first()).toContainText("up to 30 days");
});

test("warns when entered trips break the rule together (whole-timeline check)", async ({ page }) => {
  await fillFirstTrip(page, "2026-01-01", "2026-03-31"); // 90 days
  await page.getByRole("button", { name: "Add another stay" }).click();
  await page.getByLabel("Entry date").nth(1).fill("2026-04-10");
  await page.getByLabel("Exit date").nth(1).fill("2026-04-14");
  await setCheckDate(page, "2026-01-15"); // a date where status alone looks fine
  await expect(page.getByTestId("timeline-warning")).toContainText("Apr 10, 2026");
});

test("compliant planned trip can be added to the stays list", async ({ page }) => {
  await setCheckDate(page, "2026-07-01");
  await page.getByLabel("Planned entry").fill("2026-08-01");
  await page.getByLabel("Planned exit").fill("2026-08-15");
  await page.getByRole("button", { name: "Add this trip to my stays" }).click();
  await expect(page.getByLabel("Entry date").last()).toHaveValue("2026-08-01");
  await expect(page.getByLabel("Planned entry")).toHaveValue("");
  await expect(page.getByTestId("days-used")).toHaveText("0"); // future trip, none used on 1 Jul
});

test("remember-on-device persists trips across a reload", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await page.getByLabel(/Remember my trips/).check();
  await page.waitForTimeout(200); // allow the persistence effect to flush
  await page.reload();
  await expect(page.getByLabel("Entry date").first()).toHaveValue("2026-06-01");
  await expect(page.getByLabel(/Remember my trips/)).toBeChecked();
  // Unticking erases the stored copy.
  await page.getByLabel(/Remember my trips/).uncheck();
  await page.reload();
  await expect(page.getByLabel("Entry date").first()).toHaveValue("");
});

test("border report copies a plain-text summary", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await setCheckDate(page, "2026-06-30");
  await page.getByRole("button", { name: "Copy border report" }).click();
  await expect(page.getByTestId("report-copied")).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("Schengen 90/180 day report");
  expect(clipboard).toContain("Jun 1, 2026 to Jun 10, 2026 (10 days");
});

test("downloads a PDF border report", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await setCheckDate(page, "2026-06-30");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("download-pdf").click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^schengen-border-report-\d{4}-\d{2}-\d{2}\.pdf$/);
});

test("shows a tiered passport-expiry reminder and downloads a calendar file", async ({ page }) => {
  // Passport expiry is judged against real today (unlike the calculator's own
  // hypothetical "check status on" field), so this must stay a future date.
  await page.getByLabel("Passport expiry date (optional)").fill("2030-01-01");
  const note = page.getByTestId("passport-expiry-note");
  await expect(note).toBeVisible();
  await expect(note).toContainText("expires");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    note.getByRole("button", { name: "Add reminder to my calendar" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^passport-renewal-2030-01-01\.ics$/);
});

test("warns when approaching the 90-day limit and offers a calendar reminder", async ({
  page,
}) => {
  await fillFirstTrip(page, "2026-01-01", "2026-03-26"); // 85 days used, 5 remaining
  await setCheckDate(page, "2026-03-26");
  const banner = page.getByTestId("approaching-limit-warning");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("5 days left");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    banner.getByRole("button", { name: "Add reminder to my calendar" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^schengen-limit-\d{4}-\d{2}-\d{2}\.ics$/);
});

test("a second traveler gets an independent, renamable day count", async ({ page }) => {
  await fillFirstTrip(page, "2026-06-01", "2026-06-10");
  await setCheckDate(page, "2026-06-30");
  await expect(page.getByTestId("days-used")).toHaveText("10");

  // No tab bar yet with a single traveler.
  await expect(page.getByRole("button", { name: "Traveler 1" })).toHaveCount(0);

  await page.getByRole("button", { name: "+ Add traveler" }).click();
  await expect(page.getByRole("button", { name: "Traveler 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Traveler 2" })).toBeVisible();

  // The new traveler's calculator is blank, not a copy of traveler 1's.
  await expect(page.getByTestId("days-used")).toHaveText("0");
  await expect(page.getByLabel("Entry date").first()).toHaveValue("");

  await page.getByLabel("Traveler name").fill("Partner");
  await expect(page.getByRole("button", { name: "Partner" })).toBeVisible();

  await fillFirstTrip(page, "2026-07-01", "2026-07-03");
  await setCheckDate(page, "2026-07-03");
  await expect(page.getByTestId("days-used")).toHaveText("3");

  // Removing the active traveler falls back to the remaining one.
  await page.getByRole("button", { name: "Remove traveler" }).click();
  await expect(page.getByRole("button", { name: "Traveler 1" })).toHaveCount(0); // tab bar hidden again at 1 traveler
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
