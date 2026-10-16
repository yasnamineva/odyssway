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
    "## Destinations",
    ...destinations
      .filter((d) => d.status === "verified")
      .map((d) => `- [${d.name}](${SITE_URL}${destinationPath(d)})`),
    "",
    "## Articles",
    ...blogPostsByDate.map((b) => `- [${b.title}](${SITE_URL}/blog/${b.slug})`),
    "",
    "## Data",
    `- [JSON API](${SITE_URL}/developers): /api/v1/customs-items, /api/v1/destinations, /api/v1/trip-check. Free with attribution.`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
