import keep from "./search-keep-medications.json";
import { productPairs, type ProductPair } from "./medication-products";
import type { TravelPair } from "./travel-pairs";
import type { BringPair } from "./bring-pages";
import { isSharedRow } from "./translations";

/**
 * Which programmatic pages search engines may index (2026-11-11).
 *
 * Google impressions fell from ~1,000 a day to almost none on 7–8 Nov 2026, after about
 * 3,800 templated pages went live in a week: 2,426 passport pages on 2 Nov, several
 * hundred brand × country medicine pages, and ~870 machine-translated German pages. Google
 * had indexed only ~1,500 of our pages and left 3,792 as "Discovered – currently not
 * indexed". Google's spam policies treat many near-identical pages made to rank for
 * variants of one query as scaled content or doorways, and the penalty is site-wide.
 *
 * So every page stays up for readers and linked (noindex, follow), but only pages with
 * their own substance, or with proven search demand, are indexable and in the sitemap.
 * Widening these rules is a search decision: ship it in a small batch and check the next
 * Search Console export first (AGENTS.md §0, pre-push SEO guard).
 */

/**
 * Passports whose pages existed before the 2 Nov 2026 expansion. Every passport page that
 * earned impressions (547 in the 2026-11-10 export) is one of these; the ~2,700 added for
 * other passports earned none and repeat the destination's list rule nearly word for word.
 */
export const INDEXED_PASSPORTS: ReadonlySet<string> = new Set([
  "AR", "AU", "BR", "CA", "CL", "CN", "DE", "ES", "FR", "GB", "IL",
  "IN", "IT", "JP", "KR", "MX", "MY", "NL", "NZ", "SG", "UA", "US",
]);

export function isIndexedTravelPair(pair: Pick<TravelPair, "row">): boolean {
  return INDEXED_PASSPORTS.has(pair.row.nationality);
}

const rowSetKey = (p: ProductPair) => `${p.destination.code}:${p.rows.map((r) => r.slug).sort().join("+")}`;

/** For each destination and set of rows, the first product's page (list order = search demand). */
const primaryProductPage: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const p of productPairs) if (!m.has(rowSetKey(p))) m.set(rowSetKey(p), p.product.slug);
  return m;
})();

const KEEP = new Set((keep as { paths: string[] }).paths);

/**
 * A medicine page is indexable when it's the only page showing its rows for that country,
 * or it earned impressions already (a Xanax searcher should land on the Xanax page). The
 * other brand pages for the same rows (~470, 95% identical text) are noindex.
 */
export function isIndexedProductPair(pair: ProductPair): boolean {
  if (KEEP.has(`/medications/${pair.product.slug}/${pair.destinationSlug}`)) return true;
  return primaryProductPage.get(rowSetKey(pair)) === pair.product.slug;
}

/**
 * A Schengen state's "Can I bring it?" page whose every row is the shared EU (or Swiss)
 * rule repeats the same text for each of ~29 states (205 pages, no impressions): noindex.
 * A state page with a national rule of its own stays indexable.
 */
export function isIndexedBringPair(pair: Pick<BringPair, "rows" | "destination">): boolean {
  return !pair.rows.every((r) => isSharedRow(r.slug, pair.destination.code));
}

export const NOINDEX_FOLLOW = { index: false, follow: true } as const;
