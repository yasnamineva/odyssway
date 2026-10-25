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
  await expect(page.getByTestId("tc-basis")).toContainText("No visa needed");
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
  await expect(page.getByTestId("tc-basis")).toContainText("No visa needed");
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

test("a result restates the trip, its assumptions and a dated source, with a way to edit", async ({ page }) => {
  await page.goto("/trip-check?nationality=US&destination=JP");
  await expect(page.getByTestId("tc-scenario")).toContainText("United States passport");
  await expect(page.getByTestId("tc-scenario")).toContainText("Japan");
  await expect(page.getByText("What this assumes")).toBeVisible();
  await expect(page.getByTestId("tc-results").getByTestId("source-note").first()).toContainText(
    /Checked against the source on \d{4}-\d{2}-\d{2}/,
  );
  await page.getByRole("button", { name: "Edit trip" }).click();
  await expect(page.locator("#tc-nationality")).toBeFocused();
});

test("an item whose verdict needs a permit links to the step-by-step procedure", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "Japan", "Japan");
  const itemInput = page.getByTestId("tc-item-input");
  await itemInput.fill("vyvanse");
  await itemInput.press("Enter");
  await page.getByTestId("tc-submit").click();

  const link = page.getByTestId("tc-item-procedure");
  await expect(link).toHaveAttribute("href", "/bring/medication/japan");
  await link.click();
  await expect(page.getByRole("heading", { name: "Get an import certificate from Japan's Narcotics Control Department" }).first()).toBeVisible();
});

test("a member state's national rule shows for visitors and for EU citizens", async ({ page }) => {
  for (const nationality of ["United States", "Germany"]) {
    await page.goto("/trip-check");
    await pickCombobox(page, "tc-nationality", nationality, nationality);
    await pickCombobox(page, "tc-destination", "France", "France");
    const itemInput = page.getByTestId("tc-item-input");
    await itemInput.fill("zyn");
    await itemInput.press("Enter");
    await page.getByTestId("tc-submit").click();

    const result = page.getByTestId("tc-item-result");
    await expect(result).toHaveCount(1);
    await expect(result).toContainText("Since 1 April 2026, France bans nicotine pouches");
  }
  // The German citizen also sees the intra-EU note for everything else.
  await expect(page.getByTestId("tc-intra-eu-customs")).toBeVisible();
});

test("a stopover shows that country's stated transit rule for each item", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "Australia", "Australia");
  await pickCombobox(page, "tc-transit", "Hong Kong", "Hong Kong");
  const itemInput = page.getByTestId("tc-item-input");
  for (const q of ["adderall", "kava"]) {
    await itemInput.fill(q);
    await itemInput.press("Enter");
  }
  await page.getByTestId("tc-submit").click();

  const transit = page.getByTestId("tc-item-transit");
  await expect(transit).toHaveCount(2);
  await expect(transit.first()).toContainText("Changing planes in Hong Kong");
  await expect(transit.first()).toContainText("Applies in transit too");
  await expect(transit.nth(1)).toContainText("Not yet verified for Hong Kong");
});

test("checks passport validity against a rule that names its reference date, without putting dates in the URL", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "Kenya", "Kenya");
  await page.getByTestId("tc-submit").click();

  const panel = page.getByTestId("passport-check");
  await expect(panel).toBeVisible();
  await panel.getByLabel("Arrival date").fill("2027-01-10");
  await panel.getByLabel("Departure date").fill("2027-01-20");
  await panel.getByLabel("Passport expiry date").fill("2027-07-09");
  await expect(page.getByTestId("passport-result")).toContainText("must be valid until at least 2027-07-10");
  await expect(page.getByTestId("passport-result")).toContainText("1 day too early");

  await panel.getByLabel("Passport expiry date").fill("2027-07-10");
  await expect(page.getByTestId("passport-result")).toContainText("Meets the rule");
  expect(page.url()).not.toContain("2027");
});

test("entry-requirement pages carry the same passport check", async ({ page }) => {
  await page.goto("/destinations/kenya/united-states");
  const panel = page.getByTestId("passport-check");
  await expect(panel).toBeVisible();
  await panel.getByLabel("Arrival date").fill("2027-01-10");
  await panel.getByLabel("Departure date").fill("2027-01-20");
  await panel.getByLabel("Passport expiry date").fill("2028-01-01");
  await expect(page.getByTestId("passport-result")).toContainText("Meets the rule");
});

test("checks a multi-country route: one verdict per border, side by side", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "Japan", "Japan");
  await page.getByTestId("tc-add-leg").click();
  await pickCombobox(page, "tc-leg-0", "South Korea", "South Korea");

  const itemInput = page.getByTestId("tc-item-input");
  await itemInput.fill("adderall");
  await itemInput.press("Enter");
  await page.getByTestId("tc-submit").click();

  const summary = page.getByTestId("tc-route-summary");
  await expect(summary).toBeVisible();
  await expect(summary).toContainText("Japan");
  await expect(summary).toContainText("South Korea");
  await expect(page.getByTestId("tc-route-entry")).toHaveCount(2);
  await expect(page.getByTestId("tc-route-cell")).toHaveCount(2);
  await expect(page.getByTestId("tc-leg-details")).toHaveCount(2);
});

test("checks the passport against each stop's own rule across a route", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await pickCombobox(page, "tc-destination", "United Kingdom", "United Kingdom");
  await page.getByTestId("tc-add-leg").click();
  await pickCombobox(page, "tc-leg-0", "Egypt", "Egypt");
  await page.getByTestId("tc-submit").click();

  const panel = page.getByTestId("tc-route-passport");
  await expect(panel).toBeVisible();
  await page.getByTestId("tc-route-passport-expiry").fill("2027-03-01");
  await page.getByTestId("tc-route-passport-arrival-0").fill("2026-11-01");
  await page.getByTestId("tc-route-passport-departure-0").fill("2026-11-10");
  await page.getByTestId("tc-route-passport-arrival-1").fill("2026-11-12");
  await page.getByTestId("tc-route-passport-departure-1").fill("2026-11-20");

  const results = page.getByTestId("tc-route-passport-result");
  await expect(results.nth(0)).toContainText("Meets the rule");
  await expect(results.nth(1)).toContainText("2027-05-12");
  await expect(page.getByTestId("tc-route-passport-summary")).toContainText("Egypt");
});

test("a shared link reopens the same multi-stop result with its items", async ({ page }) => {
  await page.goto("/trip-check#n=US&d=JP&l=TH&i=adderall");
  await expect(page.getByTestId("tc-route-summary")).toBeVisible();
  await expect(page.getByTestId("tc-route-summary")).toContainText("Japan");
  await expect(page.getByTestId("tc-route-summary")).toContainText("Thailand");
  await expect(page.getByTestId("tc-route-cell")).toHaveCount(2);
  await page.getByTestId("tc-share").first().click();
  await expect(page).toHaveURL(/#n=US&d=JP&l=TH&i=adderall$/);
});

test("the printout hides the form and carries a link back to the result", async ({ page }) => {
  await page.goto("/trip-check#n=US&d=JP&l=TH&i=adderall");
  await expect(page.getByTestId("tc-route-summary")).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByTestId("tc-print-note").first()).toBeVisible();
  await expect(page.getByTestId("tc-print-note").first()).toContainText("#n=US&d=JP&l=TH&i=adderall");
  await expect(page.locator("form").first()).toBeHidden();
});
