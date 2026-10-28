import { BRING_CATEGORIES } from "../../lib/bring-categories";
import { bringPairs } from "../../lib/bring-pages";
import { blogPostsByDate } from "../../lib/blog";
import { coveredDestinationCount, customsItems, destinationPath, destinations } from "../../lib/destinations";
import { medicationProducts } from "../../lib/medication-products";
import { SITE_URL } from "../../lib/site";

/**
 * /llms.txt (llmstxt.org): a plain-text map of the site for AI assistants and
 * crawlers — what we answer, how it's verified, and where the answers live —
 * so an assistant that cites us cites the right page (GROWTH_AND_ROADMAP §2.3).
 * Built from the same verified data as the pages; static at build time.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const verifiedRows = customsItems.filter((i) => i.status === "verified").length;
  const lines = [
    "# Odyssway",
    "",
    `> Travel compliance answers, each cited to an official government source and dated: can you enter a country, how long can you stay, and can you bring a specific item (medication, cannabis/CBD, nicotine, cash, drones, food). ${coveredDestinationCount} destinations, ${verifiedRows} verified customs rules.`,
    "",
    "Every rule comes from a primary official source (customs, health or drug authorities, legislation) with the date it was checked. Where a rule isn't verified, the page says so instead of guessing. Informational only, not legal advice.",
    "",
    "## Tools",
    `- [Trip Check](${SITE_URL}/trip-check): nationality + destination + items (+ optional stopover) → entry, stay, documents, customs verdict per item, transit rule.`,
    `- [Schengen 90/180 calculator](${SITE_URL}/calculator): rolling-window day count.`,
    `- [Trip readiness planner](${SITE_URL}/readiness): travellers (mixed passports) + route + dates → visas, travel authorisations, arrival-card windows, passport checks, with official deadlines kept apart from suggested dates; .ics export.`,
    `- [Medication planner](${SITE_URL}/medication-planner): medicines + route + dates → each country's verified medication rule, permits and the date to apply by, doctor's-letter checklist.`,
    `- [Which passport?](${SITE_URL}/which-passport): two passports + one destination → both verified entry rules side by side, for dual citizens.`,
    `- [Day counter](${SITE_URL}/day-counter): several trips → each country's own stay limit (Schengen pooled 90/180, per-visit limits, rolling windows).`,
    `- [Rule-change feed](${SITE_URL}/changelog.xml): RSS of every verified rule change.`,
    "",
    "## How we verify",
    `- [Methodology](${SITE_URL}/methodology)`,
    `- [All sources](${SITE_URL}/sources)`,
    `- [Change log](${SITE_URL}/changelog): every rule change, with source and date.`,
    "",
    "## Medicines by name",
    ...medicationProducts.map((p) => `- [${p.name}](${SITE_URL}/medications/${p.slug})`),
    "",
    "## What can you bring, by item",
    ...Object.values(BRING_CATEGORIES).map((c) => `- [${c.label}](${SITE_URL}/bring/${c.slug})`),
    "",
    "## Medication rules by country",
    ...bringPairs
      .filter((p) => p.category === "medication")
      .map((p) => `- [${p.destination.name}](${SITE_URL}/bring/medication/${p.destinationSlug})`),
    "",
    "## Cannabis and CBD rules by country",
    ...bringPairs
      .filter((p) => p.category === "cbd_cannabis")
      .map((p) => `- [${p.destination.name}](${SITE_URL}/bring/${p.itemSlug}/${p.destinationSlug})`),
    "",
    "## Vape and e-cigarette rules by country",
    ...bringPairs
      .filter((p) => p.category === "e_cigarettes")
      .map((p) => `- [${p.destination.name}](${SITE_URL}/bring/${p.itemSlug}/${p.destinationSlug})`),
    "",
    "## Destinations",
    ...destinations
      .filter((d) => d.status === "verified")
      .map((d) => `- [${d.name}](${SITE_URL}${destinationPath(d)})`),
    "",
    "## Articles",
    ...blogPostsByDate.map((b) => `- [${b.title}](${SITE_URL}/blog/${b.slug})`),
    "",
    "## Data",
    `- [JSON API](${SITE_URL}/developers): /api/v1/customs-items, /api/v1/destinations, /api/v1/trip-check. Data licensed CC BY 4.0 (credit Odyssway with a link).`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
