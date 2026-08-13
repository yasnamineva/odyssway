import { expect, test } from "@playwright/test";

/** The Trip Check flow (AGENTS.md §7 "/trip-check"): from / to / bringing → results. */

test("resolves the Schengen path via the rolling-window engine and links the full calculator", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await page.getByTestId("tc-nationality").selectOption("US");
  await page.getByTestId("tc-destination").selectOption("SCHENGEN");
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
  await page.getByTestId("tc-nationality").selectOption("GB");
  await page.getByTestId("tc-destination").selectOption("FR");
  await page.getByTestId("tc-submit").click();

  await expect(page.getByTestId("tc-results")).toBeVisible();
  await expect(page.getByTestId("tc-stay")).toContainText("90 days");
});

test("resolves a verified non-Schengen destination end to end, with a matched customs item", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await page.getByTestId("tc-nationality").selectOption("US");
  await page.getByTestId("tc-destination").selectOption("CA");

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

test("a queued (not-yet-verified) destination shows the honest not-covered state, never a guess", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await page.getByTestId("tc-nationality").selectOption("US");
  await page.getByTestId("tc-destination").selectOption("AU");
  await page.getByTestId("tc-submit").click();

  await expect(page.getByTestId("tc-not-covered")).toBeVisible();
  await expect(page.getByTestId("tc-not-covered")).toContainText("haven't verified");
  await expect(page.getByTestId("tc-results")).toHaveCount(0);
});

test("item tags can be added, removed, and are looked up per destination without fabricating a match", async ({
  page,
}) => {
  await page.goto("/trip-check");
  await page.getByTestId("tc-nationality").selectOption("US");
  await page.getByTestId("tc-destination").selectOption("SCHENGEN");

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
  await page.getByTestId("tc-nationality").selectOption("US");
  await expect(page.getByTestId("tc-submit")).toBeDisabled();
  await page.getByTestId("tc-destination").selectOption("SCHENGEN");
  await expect(page.getByTestId("tc-submit")).toBeEnabled();
});
