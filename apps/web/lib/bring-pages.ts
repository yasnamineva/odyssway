import type { CustomsItemRecord, DestinationRecord } from "@odyssway/engine";
import { BRING_CATEGORIES, type BringCategory } from "./bring-categories";
import { customsItems, destinations } from "./destinations";

/**
 * One page per (item category × destination) that has at least one verified
 * row — the long-tail search intent ("can I bring a vape to Japan") the
 * category hubs and destination pages are too broad to answer. Only verified
 * rows on a verified destination ever produce a page (AGENTS.md §7 thin-content
 * rule), so page count tracks the data exactly.
 */
export interface BringPair {
  category: BringCategory;
  itemSlug: string;
  destination: DestinationRecord;
  destinationSlug: string;
  rows: CustomsItemRecord[];
  lastVerified: string | null;
}

export function destinationSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const bringPairs: BringPair[] = (() => {
  const pairs: BringPair[] = [];
  const verifiedDestinations = destinations.filter((d) => d.status === "verified");
  for (const [category, meta] of Object.entries(BRING_CATEGORIES) as Array<
    [BringCategory, { slug: string }]
  >) {
    for (const destination of verifiedDestinations) {
      const rows = customsItems
        .filter((i) => i.category === category && i.destination === destination.code && i.status === "verified")
        .sort((a, b) => a.slug.localeCompare(b.slug));
      if (rows.length === 0) continue;
      const dates = rows.map((r) => r.verified_at).filter((d): d is string => Boolean(d));
      pairs.push({
        category,
        itemSlug: meta.slug,
        destination,
        destinationSlug: destinationSlug(destination.name),
        rows,
        lastVerified: dates.length > 0 ? dates.sort().at(-1)! : null,
      });
    }
  }
  return pairs;
})();

export function bringPair(itemSlug: string, destSlug: string): BringPair | undefined {
  return bringPairs.find((p) => p.itemSlug === itemSlug && p.destinationSlug === destSlug);
}

export function bringPairsForDestination(code: string): BringPair[] {
  return bringPairs.filter((p) => p.destination.code === code);
}

const ROW_LABEL_OVERRIDES: Record<string, string> = {
  cbd: "CBD",
  "cbd-cannabis": "CBD & cannabis",
  "cannabis-cbd": "Cannabis & CBD",
  "e-cigarettes": "E-cigarettes",
  "meat-dairy": "Meat & dairy",
  "food-animal": "Meat & animal products",
  "food-plant": "Fresh produce & plants",
  "fresh-produce": "Fresh produce",
  "plants-seeds": "Plants & seeds",
  "paan-nasvaar": "Paan & nasvaar",
};

/**
 * Human label for a customs row. Row slugs (`stimulant-medication-jp`) are the
 * authors' deliberate short names, so they describe a row better than
 * `names[0]`, which is just whichever search term happens to be listed first
 * (the Japan stimulant row leads with "pseudoephedrine" but also covers Adderall).
 */
export function rowLabel(slug: string, destinationCode: string): string {
  const base = slug.replace(new RegExp(`-${destinationCode.toLowerCase()}$`), "");
  const label = ROW_LABEL_OVERRIDES[base] ?? base.replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}
