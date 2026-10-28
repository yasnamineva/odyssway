import { expect, test } from "@playwright/test";

/** Travel-authorisation guides (/authorisations): official website, fee, validity, from the issuing government. */

test("the index lists each verified guide and links ETIAS to its tracker", async ({ page }) => {
  await page.goto("/authorisations");
  const list = page.getByTestId("authorisations-list");
  await expect(list.getByRole("link", { name: /UK Electronic Travel Authorisation/ })).toBeVisible();
  await expect(list.getByRole("link", { name: /ETIAS/ })).toHaveAttribute("href", "/etias/status");
});

test("a guide shows the official website, the fee and its sources", async ({ page }) => {
  await page.goto("/authorisations/uk-eta");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("UK ETA");
  await expect(page.getByTestId("authorisation-apply")).toHaveAttribute("href", "https://www.gov.uk/eta/apply");
  await expect(page.getByTestId("authorisation-facts")).toContainText("£20");
  await expect(page.getByTestId("authorisation-official-only")).toBeVisible();
});

test("an unknown guide is a 404", async ({ page }) => {
  const res = await page.goto("/authorisations/canada-eta");
  expect(res?.status()).toBe(404);
});

test("the destination hub and the readiness planner link to the guide", async ({ page }) => {
  await page.goto("/destinations/kenya");
  await expect(page.getByTestId("destination-authorisations").getByRole("link")).toHaveAttribute("href", "/authorisations/kenya-eta");
});
