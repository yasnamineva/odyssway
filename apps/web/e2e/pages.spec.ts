import { expect, test } from "@playwright/test";
import { blogPosts } from "../lib/blog";

/** Every public route renders with its key content (Phase 1 launch surface). */

const routes: Array<{ path: string; expectText: string }> = [
  { path: "/", expectText: "Can you go — and for how long?" },
  { path: "/trip-check", expectText: "Where are you from, and where are you going?" },
  { path: "/calculator", expectText: "Schengen 90/180 day calculator" },
  { path: "/rules/90-180-rule", expectText: "In short" },
  { path: "/rules/overstay-penalties", expectText: "Return Directive" },
  { path: "/developers", expectText: "GET /api/v1/trip-check" },
  { path: "/ees", expectText: "Entry/Exit System" },
  { path: "/ees/what-to-expect", expectText: "no more passport stamps" },
  { path: "/ees/dispute-overstay", expectText: "Article 52" },
  { path: "/etias/status", expectText: "ETIAS launch tracker" },
  { path: "/etias/us", expectText: "ETIAS for US citizens" },
  { path: "/etias/ua", expectText: "biometric passports" },
  { path: "/ees/data-access/fr", expectText: "CNIL" },
  { path: "/ees/data-access/de", expectText: "45 days" },
  { path: "/rules/overstay-penalties/de", expectText: "Aufenthaltsgesetz" },
  { path: "/rules/overstay-penalties/fr", expectText: "CESEDA" },
  { path: "/bring/e-cigarettes/japan", expectText: "Can you bring e-cigarettes or vapes to Japan?" },
  { path: "/bring/medication/south-korea", expectText: "Ministry of Food and Drug Safety" },
  { path: "/destinations/united-states", expectText: "United States entry requirements and customs rules" },
  { path: "/destinations/united-kingdom", expectText: "United Kingdom entry requirements and customs rules" },
  { path: "/destinations/canada", expectText: "Canada entry requirements and customs rules" },
  { path: "/guides/dual-citizens", expectText: "not a Union citizen" },
  { path: "/guides/residence-permit-holders", expectText: "shall not be taken into account" },
  { path: "/changelog", expectText: "Verification changelog" },
  { path: "/about", expectText: "About" },
  { path: "/methodology", expectText: "primary official source" },
  { path: "/sources", expectText: "countries.json" },
];

for (const { path, expectText } of routes) {
  test(`${path} renders`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(expectText);
    // Sitewide disclaimer (AGENTS.md §10) present in the footer everywhere.
    await expect(page.locator("footer")).toContainText("not legal advice");
  });
}

test("/etias/status renders the verified data values", async ({ page }) => {
  await page.goto("/etias/status");
  await expect(page.locator("body")).toContainText("Not live yet");
  await expect(page.locator("body")).toContainText("€20");
  await expect(page.locator("body")).toContainText("last quarter of 2026");
});

test("unknown nationality pages 404 instead of rendering thin content", async ({ page }) => {
  const response = await page.goto("/etias/xx");
  expect(response?.status()).toBe(404);
});

test("unverified EES countries 404 instead of rendering thin content", async ({ page }) => {
  const response = await page.goto("/ees/data-access/ie");
  expect(response?.status()).toBe(404);
});

test("unverified overstay-penalty countries 404 instead of rendering thin content", async ({
  page,
}) => {
  const response = await page.goto("/rules/overstay-penalties/hu");
  expect(response?.status()).toBe(404);
});

test("unverified destination pages 404 instead of rendering thin content", async ({ page }) => {
  const response = await page.goto("/destinations/nepal");
  expect(response?.status()).toBe(404);
});

test("sources page cites the promoted destination and EU customs data", async ({ page }) => {
  await page.goto("/sources");
  await expect(page.locator("body")).toContainText("United States");
  await expect(page.locator("body")).toContainText("United Kingdom");
  await expect(page.locator("body")).toContainText("Canada");
  await expect(page.locator("body")).toContainText("EU/Schengen-harmonized customs rules");
  await expect(page.getByTestId("sources-stats")).toContainText(/\d[\d,]* official pages back \d[\d,]* verified rules/);
  await expect(page.getByRole("link", { name: "Japan entry and customs rules" })).toHaveAttribute("href", "/destinations/japan");
});

test("EES country page shows both template letters with downloads", async ({ page }) => {
  await page.goto("/ees/data-access/it");
  await expect(page.getByText("Template letter — Italian")).toBeVisible();
  await expect(page.getByText("Template letter — English")).toBeVisible();
  await page.getByText("Template letter — Italian").click();
  await expect(page.locator("body")).toContainText("articolo 52 del regolamento (UE) 2017/2226");
  const download = page.locator('a[download="ees-rectification-it-it.txt"]');
  await expect(download).toHaveAttribute("href", /^data:text\/plain/);
});

test("changelog lists dated, sourced entries with dataset anchors", async ({ page }) => {
  await page.goto("/changelog");
  await expect(page.locator("#dataset-countries")).toBeVisible();
  await expect(page.locator("#dataset-ees")).toBeVisible();
  await expect(page.locator("#dataset-customs-items")).toBeVisible();
  await expect(page.locator("#dataset-destinations")).toBeVisible();
  await expect(page.locator("body")).toContainText("verified by agent:claude-fable-5");
});

test("unpublished item/destination pairs 404 instead of rendering thin content", async ({ page }) => {
  // No verified drones row exists for Mongolia (customs figures conflict).
  const response = await page.goto("/bring/drones/mongolia");
  expect(response?.status()).toBe(404);
});

test("rules pages link their update history", async ({ page }) => {
  await page.goto("/rules/90-180-rule");
  await expect(
    page.locator('a[href="/changelog#dataset-countries"]').first(),
  ).toBeVisible();
});

test("sitemap and robots respond", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/rules/90-180-rule");
  expect(await sitemap.text()).toContain("/rules/overstay-penalties");
  expect(await sitemap.text()).toContain("/bring/e-cigarettes/japan");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
});

test("every sitemap URL resolves — never advertise a 404 to search engines", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1]!);
  expect(paths.length).toBeGreaterThan(300);
  const bad: string[] = [];
  for (let i = 0; i < paths.length; i += 20) {
    await Promise.all(
      paths.slice(i, i + 20).map(async (path) => {
        const res = await request.get(path);
        if (res.status() !== 200) bad.push(`${res.status()} ${path}`);
      }),
    );
  }
  expect(bad).toEqual([]);
});

test("calculator page carries supporting copy, not just the tool", async ({ page }) => {
  await page.goto("/calculator");
  await expect(page.getByRole("heading", { name: "How this calculator counts your days" })).toBeVisible();
});

test("public API v1 returns cited, CORS-enabled JSON", async ({ request }) => {
  const tripCheck = await request.get(
    "/api/v1/trip-check?nationality=US&destination=GB&items=alcohol",
  );
  expect(tripCheck.status()).toBe(200);
  expect(tripCheck.headers()["access-control-allow-origin"]).toBe("*");
  const tripCheckBody = await tripCheck.json();
  expect(tripCheckBody.destinationName).toBe("United Kingdom");
  expect(tripCheckBody.items[0].match.slug).toBe("alcohol-gb");

  const missingParams = await request.get("/api/v1/trip-check");
  expect(missingParams.status()).toBe(400);

  const destinations = await request.get("/api/v1/destinations");
  expect(destinations.status()).toBe(200);
  const destinationsBody = await destinations.json();
  expect(destinationsBody.count).toBeGreaterThan(20);

  const customsItems = await request.get(
    "/api/v1/customs-items?destination=TH&category=cbd_cannabis",
  );
  expect(customsItems.status()).toBe(200);
  const customsItemsBody = await customsItems.json();
  expect(customsItemsBody.items.every((i: { destination: string }) => i.destination === "TH")).toBe(true);
});

test("header navigation reaches the guide pages", async ({ page }) => {
  // The menu toggle only exists below the lg breakpoint (desktop shows the
  // links inline), so drive the nav at phone width.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  // A click that lands before the page hydrates does nothing, so retry the
  // toggle until the menu actually opens.
  const openMenu = async () =>
    expect(async () => {
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(page.getByRole("link", { name: "90/180 rule" })).toBeVisible({ timeout: 1000 });
    }).toPass();

  await openMenu();
  await page.locator("header").getByRole("link", { name: "Trip Check", exact: true }).click();
  await expect(page).toHaveURL(/\/trip-check$/);

  await openMenu();
  await page.getByRole("link", { name: "90/180 rule" }).click();
  await expect(page).toHaveURL(/\/rules\/90-180-rule$/);

  await openMenu();
  await page.getByRole("link", { name: "ETIAS" }).click();
  await expect(page).toHaveURL(/\/etias\/status$/);
});

test("landing page links into both tools", async ({ page }) => {
  await page.goto("/");
  // The header nav has a "Start a Trip Check" CTA (site-wide, every page),
  // and the homepage itself repeats both hero CTAs again in the closing
  // banner — scope to main and take the first (the hero's) of each.
  await expect(
    page.getByRole("main").getByRole("link", { name: "Start a Trip Check" }).first(),
  ).toHaveAttribute("href", "/trip-check");
  await expect(
    page.getByRole("main").getByRole("link", { name: "Open the Schengen Calculator" }).first(),
  ).toHaveAttribute("href", "/calculator");
  await page.getByRole("link", { name: /Open Trip Check/ }).click();
  await expect(page).toHaveURL(/\/trip-check$/);
});

test("old destination code URLs redirect permanently to the name URL", async ({ request }) => {
  const res = await request.get("/destinations/jp", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe("/destinations/japan");
});

test("blog posts carry a photo and retired post URLs redirect", async ({ page, request }) => {
  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  const cards = page.locator("main ol > li");
  await expect(cards).toHaveCount(blogPosts.length);
  await expect(cards.first().locator("img")).toHaveAttribute("src", /blog-/);
  await page.goto("/blog/adhd-medication-japan", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Adderall");
  await expect(page.locator("figure img")).toBeVisible();
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toContain("/images/photos/blog-japan.jpg");
  const res = await request.get("/blog/ees-live-five-countries", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe("/blog/europe-counts-your-days");
});

test("privacy policy and terms are linked from the footer and name the operator", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy Policy");
  await expect(page.locator("article")).toContainText("support@odyssway.com");
  await expect(page.locator("article")).toContainText("Commission for Personal Data Protection");
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Terms of Use");
  await expect(page.locator("article")).toContainText("not legal advice");
});

test("named-medicine pages answer the brand query from the verified row", async ({ page }) => {
  await page.goto("/medications/adderall/japan");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Can you bring Adderall to Japan?");
  await expect(page.locator("body")).toContainText("Prohibited");
  await expect(page.locator("body")).toContainText("Adderall in other countries");

  // Single-country medicines get the pair page but no thin one-row hub.
  const sudafed = await page.goto("/medications/sudafed/japan");
  expect(sudafed?.status()).toBe(200);
  const hub = await page.goto("/medications/sudafed");
  expect(hub?.status()).toBe(404);

  await page.goto("/medications/adderall");
  await expect(page.locator("table")).toContainText("Japan");
});

test("nationality × destination pages render the verified row with comparisons", async ({ page }) => {
  const res = await page.goto("/destinations/united-states/united-kingdom");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "United States entry requirements for UK citizens",
  );
  await expect(page.locator("body")).toContainText("ESTA");
  await expect(page.locator("body")).toContainText("United States for other passports");
  await page.goto("/destinations/japan");
  await expect(page.locator('a[href="/destinations/japan/united-states"]')).toBeVisible();
  // Entry-rule posts are linked from the destination's passport pages.
  await page.goto("/destinations/thailand/united-kingdom");
  await expect(page.getByTestId("pair-related-posts").locator('a[href="/blog/thailand-visa-free-cut-2026"]')).toBeVisible();
});

test("EES guides cover all 29 EES countries and the missing-exit guide", async ({ page }) => {
  await page.goto("/ees");
  await expect(page.locator('a[href^="/ees/data-access/"]')).toHaveCount(29);
  await page.goto("/ees/data-access/pl");
  await expect(page.locator("body")).toContainText("Border Guard");
  await expect(page.getByText("Template letter — Polish")).toBeVisible();
  const res = await page.goto("/ees/missing-exit-record");
  expect(res?.status()).toBe(200);
  await expect(page.locator("body")).toContainText("Article 52");
});

test("embeddable calculator renders without site chrome; /widget shows the snippet", async ({ page }) => {
  await page.goto("/embed/calculator");
  await expect(page.locator("header")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Schengen calculator by Odyssway/ })).toBeVisible();
  await page.goto("/widget");
  await expect(page.locator("pre").first()).toContainText("/embed/calculator");
  await expect(page.locator("pre").first()).toContainText("/calculator\">Odyssway</a>");
});

test("info icons open a note on tap and close with Escape; detail dropdowns expand", async ({ page }) => {
  await page.goto("/ees");
  const tip = page.getByRole("button", { name: "How the counting works" });
  const note = page.getByRole("note").filter({ hasText: "90 days in any 180-day period" });
  await expect(note).toBeHidden();
  await tip.click();
  await expect(note).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(note).toBeHidden();

  await page.getByText("What exactly is the EES?").click();
  await expect(page.getByText("eu-LISA")).toBeVisible();
});

test("a customs row downloads a printable border card", async ({ page }) => {
  await page.goto("/bring/medication/south-korea");
  const button = page.getByTestId("border-card-button").first();
  await expect(button).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    expect(async () => {
      await button.click();
    }).toPass(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^border-card-[a-z0-9-]+\.pdf$/);
  await download.saveAs("test-results/border-card.pdf");
});

test("the Can I bring it? embed answers without site chrome; /widget shows its snippet", async ({ page }) => {
  await page.goto("/embed/can-i-bring");
  await expect(page.locator("header")).toHaveCount(0);
  await page.getByTestId("cib-destination").fill("Japan");
  await page.getByRole("option", { name: "Japan", exact: true }).click();
  await page.getByTestId("cib-item").fill("adderall");
  await page.getByTestId("cib-submit").click();
  await expect(page.getByTestId("cib-result")).toContainText("adderall to Japan");
  await expect(page.getByTestId("cib-result")).toContainText("Checked against the source on");

  await page.goto("/widget");
  await expect(page.getByTestId("widget-bring-snippet")).toContainText("/embed/can-i-bring");
});

test("a country's medication page leads with an at-a-glance list and the permits to arrange", async ({ page }) => {
  await page.goto("/bring/medication/japan");
  const glance = page.getByTestId("at-a-glance");
  await expect(glance).toContainText("Amphetamine medication");
  await glance.getByRole("link", { name: "Narcotic medication" }).click();
  await expect(page).toHaveURL(/#narcotic-medication-jp$/);
  await expect(page.getByTestId("before-you-go")).toContainText("Narcotics Control Department");
});

test("destination hubs link their named medicines, and medicine posts link country medication rules", async ({ page }) => {
  await page.goto("/destinations/japan");
  await expect(page.getByTestId("destination-named-medicines").getByRole("link", { name: "Adderall" })).toHaveAttribute(
    "href",
    "/medications/adderall/japan",
  );
  await page.goto("/blog/medication-transit-stopover");
  await expect(page.getByTestId("blog-medication-rules").getByRole("link", { name: "Singapore" })).toHaveAttribute(
    "href",
    "/bring/medication/singapore",
  );
});

test("doctor's letter checklist lists only what the rule asks for, and ticks off", async ({ page }) => {
  await page.goto("/bring/medication/japan");
  const checklist = page.getByTestId("letter-checklist").first();
  await expect(checklist).toBeVisible();
  await expect(checklist).toContainText("The doctor's signature");
  const box = checklist.getByRole("checkbox").first();
  await box.check();
  await expect(box).toBeChecked();
});

test("the homepage links new tools and recently added destinations; the changelog has an RSS feed", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-more-tools").getByRole("link")).toHaveCount(3);
  await expect(page.getByTestId("home-recent").getByRole("link").first()).toBeVisible();
  const feed = await request.get("/changelog.xml");
  expect(feed.status()).toBe(200);
  expect(feed.headers()["content-type"]).toContain("rss");
  expect(await feed.text()).toContain("<item>");
  await page.goto("/changelog");
  await expect(page.getByTestId("changelog-feed")).toHaveAttribute("href", "/changelog.xml");
});

test("which passport: compares two passports for one destination", async ({ page }) => {
  await page.goto("/which-passport");
  const pick = async (id: string, q: string, o: string) => {
    await page.getByTestId(id).fill(q);
    await page.getByRole("option", { name: o, exact: true }).click();
  };
  await pick("wp-a", "India", "India");
  await pick("wp-b", "United Kingdom", "United Kingdom");
  await pick("wp-dest", "Uzbekistan", "Uzbekistan");
  await expect(page.getByTestId("wp-column")).toHaveCount(2);
  await expect(page.getByTestId("wp-verdict")).toContainText("United Kingdom passport has fewer entry requirements");
});

test("a destination hub lists its own recent rule changes and has a per-country feed", async ({ page, request }) => {
  await page.goto("/destinations/zimbabwe");
  const changes = page.getByTestId("destination-changes");
  // The newest five change; check the list's shape, and that the full feed still has the oldest.
  await expect(changes.locator("li").first()).toBeVisible();
  expect(await changes.locator("li").count()).toBeLessThanOrEqual(5);
  const feed = await request.get("/destinations/zimbabwe/feed.xml");
  expect(feed.status()).toBe(200);
  const xml = await feed.text();
  expect(xml).toContain("rule changes for Zimbabwe");
  expect(xml).toContain("Add Zimbabwe");
});

test("item hubs lead with the search wording, a count summary and a limits table; pairs link the same item elsewhere", async ({ page }) => {
  await page.goto("/bring/tobacco");
  await expect(page.locator("h1")).toContainText("How many cigarettes can you bring?");
  await expect(page).toHaveTitle(/How Many Cigarettes Can You Bring/);
  await expect(page.getByTestId("bring-glance").locator("tbody tr").first()).toBeVisible();
  await page.goto("/bring/tobacco/malaysia");
  await expect(page.getByTestId("same-item-elsewhere").getByRole("link").first()).toBeVisible();
});

test("every image on the homepage and blog has descriptive alt text (Bing site scan)", async ({ page }) => {
  for (const path of ["/", "/blog"]) {
    await page.goto(path);
    const alts = await page.locator("img").evaluateAll((imgs) => imgs.map((i) => i.getAttribute("alt")));
    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) expect(alt?.trim()).toBeTruthy();
  }
});

test("per-country EES, overstay and ETIAS pages link each other and their siblings", async ({ page }) => {
  await page.goto("/rules/overstay-penalties/de");
  await expect(page.locator('a[href="/ees/data-access/de"]')).toBeVisible();
  await expect(page.getByTestId("sibling-links").locator('a[href="/rules/overstay-penalties/fr"]')).toBeVisible();
  await page.goto("/ees/data-access/de");
  await expect(page.locator('a[href="/rules/overstay-penalties/de"]')).toBeVisible();
  await expect(page.getByTestId("sibling-links").locator('a[href="/ees/data-access/fr"]')).toBeVisible();
  await expect(page.locator('a[href="/blog/europe-counts-your-days"]')).toBeVisible();
  await page.goto("/bring/medication/japan");
  await expect(page.getByTestId("bring-related-posts").locator('a[href="/blog/adhd-medication-japan"]')).toBeVisible();
  await page.goto("/etias/us");
  await expect(page.getByTestId("sibling-links").locator('a[href^="/etias/"]').first()).toBeVisible();
});

test("the CBD post renders and is linked from cannabis pages, not medication pages", async ({ page }) => {
  const res = await page.goto("/blog/cbd-travel-rules");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Travelling with CBD");
  await page.goto("/bring/cannabis/hong-kong");
  await expect(page.getByTestId("bring-related-posts").locator('a[href="/blog/cbd-travel-rules"]')).toBeVisible();
  await page.goto("/bring/medication/japan");
  await expect(page.locator('a[href="/blog/cbd-travel-rules"]')).toHaveCount(0);
});
