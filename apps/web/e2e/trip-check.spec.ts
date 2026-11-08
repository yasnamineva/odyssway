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
  await pickCombobox(page, "tc-destination", "Austria", "Austria (Schengen)");
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
  await pickCombobox(page, "tc-destination", "France", "France (Schengen)");
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
  // Israel -> Cambodia: both individually verified, but there's no row for
  // that pair (Cambodia's list sits behind a captcha) — must resolve
  // honestly, not fall back to a guess.
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "Israel", "Israel");
  await pickCombobox(page, "tc-destination", "Cambodia", "Cambodia");
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
  await pickCombobox(page, "tc-destination", "Austria", "Austria (Schengen)");

  const itemInput = page.getByTestId("tc-item-input");
  await itemInput.fill("definitely-not-a-real-item-xyz");
  await itemInput.press("Enter");
  await expect(page.getByTestId("tc-item-tags")).toContainText("definitely-not-a-real-item-xyz");

  await page.getByTestId("tc-submit").click();
  await expect(page.getByTestId("tc-item-result")).toContainText("definitely-not-a-real-item-xyz");
  // Nothing we cover matches, so it says it doesn't recognise the item rather than "not verified".
  await expect(page.getByTestId("tc-item-unrecognised")).toContainText("We don't recognise");
  await expect(page.getByTestId("tc-item-not-found")).toHaveCount(0);
});

test("submit is disabled until both nationality and destination are chosen", async ({ page }) => {
  await page.goto("/trip-check");
  await expect(page.getByTestId("tc-submit")).toBeDisabled();
  await pickCombobox(page, "tc-nationality", "United States", "United States");
  await expect(page.getByTestId("tc-submit")).toBeDisabled();
  await pickCombobox(page, "tc-destination", "Austria", "Austria (Schengen)");
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
    await pickCombobox(page, "tc-destination", "France", "France (Schengen)");
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

test("every EU passport can be picked, and Schengen countries are listed by name", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "Poland", "Poland");
  await page.getByTestId("tc-destination").fill("Schengen Area");
  await expect(page.getByRole("option", { name: /unspecified/ })).toHaveCount(0);
  await pickCombobox(page, "tc-destination", "Spain", "Spain (Schengen)");
  await page.getByTestId("tc-submit").click();
  await expect(page.getByTestId("tc-results")).toBeVisible();
  await expect(page.getByTestId("tc-basis")).toContainText(/free movement/i);
});

test("country pickers accept abbreviations and pick the top match with Tab", async ({ page }) => {
  await page.goto("/trip-check");
  const from = page.getByTestId("tc-nationality");
  await from.fill("USA");
  await expect(page.getByRole("option").first()).toHaveText("United States");
  await from.press("Tab");
  await expect(from).toHaveValue("United States");
  const to = page.getByTestId("tc-destination");
  await to.fill("uk");
  await to.press("Tab");
  await expect(to).toHaveValue("United Kingdom");
});

test("Tab selects a country typed key by key, or highlighted with the arrow keys", async ({ page }) => {
  await page.goto("/trip-check");
  const from = page.getByTestId("tc-nationality");
  await from.click();
  await from.pressSequentially("germ");
  await from.press("Tab");
  await expect(from).toHaveValue("Germany");
  await expect(page.getByTestId("tc-destination")).toBeFocused();
  const to = page.getByTestId("tc-destination");
  await to.press("ArrowDown");
  await to.press("ArrowDown");
  const highlighted = await page.locator('[role="option"].bg-blue-50').textContent();
  await to.press("Tab");
  await expect(to).toHaveValue(highlighted ?? "");
  await expect(to).not.toHaveValue("");
});

test("a stopover shows the verified airside transit rule", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "India", "India");
  await pickCombobox(page, "tc-destination", "United States", "United States");
  await page.getByTestId("tc-transit").fill("uk");
  await page.getByTestId("tc-transit").press("Tab");
  await page.getByTestId("tc-submit").click();
  await expect(page.getByTestId("tc-airside-verdict")).toContainText("Direct Airside Transit Visa needed");
  await expect(page.getByTestId("tc-transit-entry")).toContainText("Changing planes in United Kingdom");
});

test("an uncovered passport and destination pair sends only the two country codes", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "Israel", "Israel");
  await pickCombobox(page, "tc-destination", "Cambodia", "Cambodia");
  const sent = page.waitForRequest((r) => r.url().endsWith("/api/pair-miss") && r.method() === "POST");
  await page.getByTestId("tc-submit").click();
  const body = (await sent).postDataJSON() as Record<string, unknown>;
  expect(body).toEqual({ nationality: "IL", destination: "KH" });
});

test("a stopover belongs to one flight: shown on the map in order and in the route table with its item verdict", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "Bulgaria", "Bulgaria");
  await pickCombobox(page, "tc-destination", "Armenia", "Armenia");
  await page.getByTestId("tc-add-leg").click();
  await pickCombobox(page, "tc-leg-0", "USA", "United States");
  await expect(page.getByText("Changing planes on the way to United States? (optional)")).toBeVisible();
  await pickCombobox(page, "tc-leg-transit-0", "Canada", "Canada");
  await page.getByTestId("tc-item-input").fill("adderall");
  await page.getByTestId("tc-item-input").press("Enter");
  await page.getByTestId("tc-submit").click();
  await expect(page.locator('svg[aria-label*="Bulgaria → Armenia → Canada → United States"]')).toBeVisible();
  const summary = page.getByTestId("tc-route-summary");
  await expect(summary.getByTestId("tc-route-via")).toContainText("Canada");
  await expect(summary.getByTestId("tc-route-via")).toContainText("to United States");
  await expect(summary.getByTestId("tc-route-via-cell")).toHaveCount(1);
  // The shared link keeps the stopover on the second flight.
  expect(page.url()).not.toContain("s=CA");
});

test("says how it read an item, suggests close names for unknown ones, and opens a zoomable map", async ({ page }) => {
  await page.goto("/trip-check");
  await pickCombobox(page, "tc-nationality", "USA", "United States");
  // Vietnam has no verified Adderall rule yet, so the known-item message shows.
  await pickCombobox(page, "tc-destination", "Vietnam", "Vietnam");
  for (const item of ["Addy", "ritlain"]) {
    await page.getByTestId("tc-item-input").fill(item);
    await page.getByTestId("tc-item-input").press("Enter");
  }
  await page.getByTestId("tc-submit").click();
  const items = page.getByTestId("tc-items");
  await expect(items.getByTestId("tc-item-reading")).toHaveText("We read “Addy” as Adderall.");
  await expect(items.getByTestId("tc-item-not-found")).toContainText("We know Adderall");
  await expect(items.getByTestId("tc-item-unrecognised")).toContainText("We don't recognise “ritlain”");
  await items.getByTestId("tc-item-suggestion").filter({ hasText: "Ritalin" }).click();
  await expect(items.getByText("ritalin", { exact: true })).toBeVisible();

  await page.getByTestId("world-map-open").click();
  const dialog = page.getByTestId("world-map-dialog");
  await expect(dialog).toBeVisible();
  const svg = dialog.locator("svg").first();
  const before = await svg.getAttribute("viewBox");
  await dialog.getByTestId("world-map-zoom-in").click();
  expect(await svg.getAttribute("viewBox")).not.toBe(before);
  await dialog.getByTestId("world-map-close").click();
  await expect(dialog).toHaveCount(0);
});
