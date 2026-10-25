import { expect, test, type Page } from "@playwright/test";

/** The medication travel planner (/medication-planner): every medicine on every stop, with permit deadlines. */

async function pickCombobox(page: Page, testId: string, query: string, optionName: string) {
  await page.getByTestId(testId).fill(query);
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

test("dates each permit from the authority's own lead time, earliest first", async ({ page }) => {
  await page.goto("/medication-planner");
  await pickCombobox(page, "mp-nationality", "United States", "United States");
  await page.getByTestId("mp-leave").fill("2030-03-09");
  await page.getByTestId("mp-medicine-input").fill("xanax");
  await page.getByTestId("mp-medicine-input").press("Enter");

  await pickCombobox(page, "mp-dest-0", "Thailand", "Thailand");
  await page.getByTestId("mp-arrival-0").fill("2030-03-20");
  await page.getByTestId("mp-add-stop").click();
  await pickCombobox(page, "mp-dest-1", "Singapore", "Singapore");
  await page.getByTestId("mp-arrival-1").fill("2030-03-10");

  await expect(page.getByTestId("mp-results")).toBeVisible();
  const deadlines = page.getByTestId("mp-deadline");
  await expect(deadlines).toHaveCount(2);
  // Thailand: 15 days before you travel (9 Mar). Singapore: 2 weeks before you arrive (10 Mar).
  await expect(deadlines.nth(0)).toContainText("Apply by 2030-02-22");
  await expect(deadlines.nth(0)).toContainText("Thailand");
  await expect(deadlines.nth(1)).toContainText("Apply by 2030-02-24");
  await expect(page.getByTestId("mp-stop")).toHaveCount(2);
  await expect(page.getByTestId("mp-permit").first()).toBeVisible();
});

test("the medicines hub links to the planner", async ({ page }) => {
  await page.goto("/medications");
  await page.getByTestId("planner-cta").click();
  await expect(page).toHaveURL(/\/medication-planner$/);
});
