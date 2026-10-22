import { expect, test, type Page } from "@playwright/test";

/** The multi-country day counter (/day-counter): each trip checked against its destination's own rule. */

async function pickCombobox(page: Page, testId: string, query: string, optionName: string) {
  await page.getByTestId(testId).fill(query);
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

test("pools Schengen trips and checks a UK stay against its own per-visit limit", async ({ page }) => {
  await page.goto("/day-counter");
  await pickCombobox(page, "dc-nationality", "United States", "United States");
  await page.getByTestId("dc-on-date").fill("2026-04-20");

  await pickCombobox(page, "dc-dest-0", "France", "France");
  await page.getByTestId("dc-entry-0").fill("2026-01-01");
  await page.getByTestId("dc-exit-0").fill("2026-02-28");

  await page.getByTestId("dc-add-trip").click();
  await pickCombobox(page, "dc-dest-1", "United Kingdom", "United Kingdom");
  await page.getByTestId("dc-entry-1").fill("2026-03-01");
  await page.getByTestId("dc-exit-1").fill("2026-04-10");

  await expect(page.getByTestId("dc-results")).toBeVisible();
  await expect(page.getByTestId("dc-schengen-used")).toContainText("59 days used");
  await expect(page.getByTestId("dc-card")).toHaveCount(2);
  await expect(page.getByTestId("dc-stay")).toContainText("41 days");
});
