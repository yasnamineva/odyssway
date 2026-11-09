import type { BringPair } from "./bring-pages";
import { BRING_CATEGORIES, type BringCategory } from "./bring-categories";
import { germanProductPairs } from "./german-medications";
import type { ProductPair } from "./medication-products";
import { countryName, germanPairs } from "./translations";

/**
 * German country pages (customs only, GROWTH_AND_ROADMAP.md §5.5): a country gets one when
 * it has German "Can I bring it?" pages in at least MIN_CATEGORIES categories, so every page
 * carries several rules rather than a thin copy of one.
 */
const MIN_CATEGORIES = 3;
const CATEGORY_ORDER = Object.keys(BRING_CATEGORIES) as BringCategory[];

export interface GermanDestination {
  slug: string;
  code: string;
  country: string;
  pairs: BringPair[];
  medicines: ProductPair[];
  lastVerified: string | null;
}

let cache: GermanDestination[] | null = null;

export function germanDestinations(): GermanDestination[] {
  if (cache) return cache;
  const bySlug = new Map<string, BringPair[]>();
  for (const p of germanPairs()) bySlug.set(p.destinationSlug, [...(bySlug.get(p.destinationSlug) ?? []), p]);
  cache = [...bySlug.entries()]
    .filter(([, pairs]) => pairs.length >= MIN_CATEGORIES)
    .map(([slug, pairs]) => {
      const first = pairs[0]!;
      const dates = pairs.map((p) => p.lastVerified).filter((d): d is string => Boolean(d));
      return {
        slug,
        code: first.destination.code,
        country: countryName(first.destination.code, "de", first.destination.name),
        pairs: [...pairs].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)),
        medicines: germanProductPairs.filter((m) => m.destinationSlug === slug),
        lastVerified: dates.length > 0 ? dates.sort().at(-1)! : null,
      };
    })
    .sort((a, b) => a.country.localeCompare(b.country, "de"));
  return cache;
}

export function germanDestination(slug: string): GermanDestination | undefined {
  return germanDestinations().find((d) => d.slug === slug);
}
