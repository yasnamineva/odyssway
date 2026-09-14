import { expect, test, type Page } from "@playwright/test";

/** The Trip Check flow (AGENTS.md §7 "/trip-check"): from / to / bringing → results. */

/** SearchableSelect is a typeahead combobox, not a native <select> — type enough
 * of the label to filter to it, then click the matching option. */
async function pickCombobox(page: Page, testId: string, query: string, optionName: string) {
  await page.getByTestId(testId).fill(query);
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

test("resolves the Schengen path via the rolling-window engine and links the full calculator", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "Schengen Area", "Schengen Area (any country, unspecified)");
  await page.getByTestId("tc-submit").click();

  await expect(page.getByTestId("tc-results")).toBeVisible();
  await expect(page.getByTestId("tc-basis")).toContainText("without a visa");
  await expect(page.getByTestId("tc-stay")).toContainText("90 days");
  await expect(page.getByTestId("tc-stay")).toContainText("180-day");
  await expect(
    page.getByRole("link", { name: "Track multiple trips in the full" }),
  ).toBeVisible();
});

test("resolving a specific Schengen member state behaves the same as the Schengen Area sentinel", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United Kingdom", "United Kingdom");
  await pickCombobox(page, "tc-destination", "France", "France");
  await page.getByTestId("tc-submit").click();

  await expect(page.getByTestId("tc-results")).toBeVisible();
  await expect(page.getByTestId("tc-stay")).toContainText("90 days");
});

test("resolves a verified non-Schengen destination end to end, with a matched customs item", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "Canada", "Canada");

  const itemInput = page.getByTestId("tc-item-input");
  await itemInput.fill("cannabis");
  await itemInput.press("Enter");

  await page.getByTestId("tc-submit").click();

  await expect(page.getByTestId("tc-results")).toBeVisible();
  await expect(page.getByTestId("tc-basis")).toContainText("without a visa");
  await expect(page.getByTestId("tc-stay")).toContainText("180 days");
  await expect(page.getByTestId("tc-item-result")).toContainText("Prohibited");
  await expect(page.getByTestId("tc-item-not-found")).toHaveCount(0);
});

test("a nationality/destination pair with no verified row shows the honest not-covered state, never a guess", async ({
  page,
}) => {
  // Israel -> Singapore: both individually verified, but that specific pair's
  // entry-requirement row was withheld from production data (only
  // secondary-sourced, not primary-confirmed) — must resolve honestly, not
  // fall back to a guess.
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "Israel", "Israel");
  await pickCombobox(page, "tc-destination", "Singapore", "Singapore");
  await page.getByTestId("tc-submit").click();

  await expect(page.getByTestId("tc-not-covered")).toBeVisible();
  await expect(page.getByTestId("tc-not-covered")).toContainText("haven't verified");
  await expect(page.getByTestId("tc-results")).toHaveCount(0);
});

test("item tags can be added, removed, and are looked up per destination without fabricating a match", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "Schengen Area", "Schengen Area (any country, unspecified)");

  const itemInput = page.getByTestId("tc-item-input");
  await itemInput.fill("definitely-not-a-real-item-xyz");
  await itemInput.press("Enter");
  await expect(page.getByTestId("tc-item-tags")).toContainText("definitely-not-a-real-item-xyz");

  await page.getByTestId("tc-submit").click();
  await expect(page.getByTestId("tc-item-result")).toContainText("definitely-not-a-real-item-xyz");
  await expect(page.getByTestId("tc-item-not-found")).toBeVisible();
});

test("submit is disabled until both nationality and destination are chosen", async ({ page }) => {
  await page.goto("/trip-check");
  await expect(page.getByTestId("tc-submit")).toBeDisabled();
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await expect(page.getByTestId("tc-submit")).toBeDisabled();
  await pickCombobox(page, "tc-destination", "Schengen Area", "Schengen Area (any country, unspecified)");
  await expect(page.getByTestId("tc-submit")).toBeEnabled();
});

test("a nationality can't be picked as its own destination, and vice versa", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await page.getByTestId("tc-destination").fill("United States");
  await expect(page.getByRole("option", { name: "United States", exact: true })).toHaveCount(0);

  await page.getByTestId("tc-destination").fill("");
  await pickCombobox(page, "tc-destination", "Canada", "Canada");
  await page.getByTestId("tc-nationality").fill("Canada");
  await expect(page.getByRole("option", { name: "Canada", exact: true })).toHaveCount(0);
});

test("the item field suggests known customs items for the chosen destination as you type", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "Japan", "Japan");

  const itemInput = page.getByTestId("tc-item-input");
  await itemInput.fill("adder");
  await expect(page.getByTestId("tc-item-suggestions").getByText("adderall", { exact: true })).toBeVisible();
  await page.getByTestId("tc-item-suggestions").getByText("adderall", { exact: true }).click();

  await expect(page.getByTestId("tc-item-tags")).toContainText("adderall");
});
