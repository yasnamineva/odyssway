import { expect, test, type Page } from "@playwright/test";

/** The trip readiness planner (/readiness): every traveller, every stop, dated actions. */

async function pickCombobox(page: Page, testId: string, query: string, optionName: string) {
  await page.getByTestId(testId).fill(query);
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

test("keeps official deadlines apart from suggested dates, for each traveller", async ({ page }) => {
  await page.goto("/readiness");
  await pickCombobox(page, "rd-nat-0", "United States", "United States");
  await page.getByTestId("rd-add-traveller").click();
  await pickCombobox(page, "rd-nat-1", "United Kingdom", "United Kingdom");
  await page.getByTestId("rd-leave").fill("2030-03-09");
  await pickCombobox(page, "rd-dest-0", "India", "India");
  await page.getByTestId("rd-arrival-0").fill("2030-03-10");
  await page.getByTestId("rd-departure-0").fill("2030-03-20");

  await expect(page.getByTestId("rd-results")).toBeVisible();
  const actions = page.getByTestId("rd-action");
  // Each traveller: the ETA (official deadline 4 days before arrival) and the e-Arrival card window.
  await expect(actions).toHaveCount(4);
  await expect(actions.first()).toContainText("Suggested date: 2030-01-12");
  await expect(actions.first()).toContainText("Official deadline: 2030-03-06");
  await expect(page.getByText(/Opens 2030-03-07/).first()).toBeVisible();
  await expect(page.getByTestId("rd-stop")).toHaveCount(2);
  await expect(page.getByTestId("rd-calendar")).toBeVisible();
  await expect(page.getByTestId("rd-guide").first().getByRole("link")).toHaveAttribute("href", "/authorisations/india-e-tourist-visa");
});

test("a saved plan remembers when it was checked", async ({ page }) => {
  await page.goto("/readiness");
  await pickCombobox(page, "rd-nat-0", "United States", "United States");
  await pickCombobox(page, "rd-dest-0", "Thailand", "Thailand");
  await page.getByTestId("rd-arrival-0").fill("2030-03-10");
  await page.getByTestId("rd-remember").check();
  await page.reload();
  await expect(page.getByTestId("rd-remember")).toBeChecked();
  await expect(page.getByTestId("rd-recheck")).toContainText("No rule changes");
  await expect(page.getByTestId("rd-action")).toHaveCount(1);
});

test("lists the destination government's charges for each stop, with a source", async ({ page }) => {
  await page.goto("/readiness");
  await pickCombobox(page, "rd-nat-0", "United States", "United States");
  await pickCombobox(page, "rd-dest-0", "Kenya", "Kenya");
  await page.getByTestId("rd-arrival-0").fill("2030-03-10");
  const charge = page.getByTestId("trip-charge").first();
  await expect(charge).toContainText("Up to USD 44 per person");
  await expect(charge.getByRole("link")).toHaveAttribute("href", /ecitizen\.go\.ke/);
});

test("a destination hub lists government charges for visitors", async ({ page }) => {
  await page.goto("/destinations/japan");
  await expect(page.getByTestId("destination-charges")).toContainText("JPY 3,000 per departure");
});
