import type { MetadataRoute } from "next";
import type { CustomsItemRecord } from "@odyssway/engine";
import { blogPosts } from "../lib/blog";
import { BRING_CATEGORIES } from "../lib/bring-categories";
import { bringPairs } from "../lib/bring-pages";
import { GERMAN_INDEXABLE, germanPairs, hasGermanPage, translatedCustomsRow } from "../lib/translations";
import { germanDestinations } from "../lib/german-destinations";
import { germanPairsForProduct, germanProductPairs, germanProducts, hasGermanProductPage } from "../lib/german-medications";
import { countriesVerifiedAt } from "../lib/countries";
import { customsItems, destinationPath, destinations, entryRequirements } from "../lib/destinations";
import { schengenCustomsRows, schengenDestinations } from "../lib/schengen-destinations";
import { etias } from "../lib/etias";
import { publishedEesRecords } from "../lib/ees";
import { latestVerified, medicationProducts, pairsForProduct, productPairs } from "../lib/medication-products";
import { etiasNationalities } from "../lib/nationalities";
import { travelAuthorisations } from "../lib/travel-authorisations";
import { travelPairPath, travelPairs } from "../lib/travel-pairs";
import { publishedOverstayPenalties } from "../lib/overstay-penalties";
import { SITE_URL as BASE } from "../lib/site";
import { isIndexedBringPair, isIndexedProductPair, isIndexedTravelPair } from "../lib/search-index";
import { LEGAL_UPDATED } from "../lib/legal";

/** Content pages carry the date their sources were last checked (AGENTS.md §7). */
const CONTENT_CHECKED = "2026-07-13";

/** Latest ISO date among the given stamps — lastmod should reflect real data changes, not a fixed date. */
function latest(dates: Array<string | null | undefined>): string {
  const valid = dates.filter((d): d is string => Boolean(d));
  return valid.length > 0 ? valid.sort().at(-1)! : CONTENT_CHECKED;
}

/**
 * A German page changes when its English rows are re-checked *or* retranslated: take the
 * later date, so a newly translated page is picked up by `indexnow --since`.
 */
function germanLastModified(rows: CustomsItemRecord[]): string {
  return latest([...rows.map((r) => r.verified_at), ...rows.map((r) => translatedCustomsRow(r, "de")?.translatedAt)]);
}

const DATA_LAST_UPDATED = latest([
  ...customsItems.map((i) => i.verified_at),
  ...entryRequirements.map((r) => r.verified_at),
  ...destinations.map((d) => d.verified_at),
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: DATA_LAST_UPDATED, priority: 0.9 },
    { url: `${BASE}/trip-check`, lastModified: countriesVerifiedAt, priority: 1 },
    { url: `${BASE}/calculator`, lastModified: countriesVerifiedAt, priority: 0.9 },
    { url: `${BASE}/day-counter`, lastModified: countriesVerifiedAt, priority: 0.8 },
    { url: `${BASE}/readiness`, lastModified: countriesVerifiedAt, priority: 0.8 },
    { url: `${BASE}/authorisations`, lastModified: countriesVerifiedAt, priority: 0.7 },
    ...travelAuthorisations.map((a) => ({
      url: `${BASE}/authorisations/${a.slug}`,
      lastModified: a.verified_at ?? undefined,
      priority: 0.7,
    })),
    { url: `${BASE}/medication-planner`, lastModified: countriesVerifiedAt, priority: 0.8 },
    { url: `${BASE}/which-passport`, lastModified: countriesVerifiedAt, priority: 0.7 },
    { url: `${BASE}/rules/90-180-rule`, lastModified: CONTENT_CHECKED, priority: 0.8 },
    { url: `${BASE}/rules/overstay-penalties`, lastModified: "2026-09-15", priority: 0.7 },
    ...publishedOverstayPenalties.map((r) => ({
      url: `${BASE}/rules/overstay-penalties/${r.country.toLowerCase()}`,
      lastModified: r.verified_at ?? CONTENT_CHECKED,
      priority: 0.6,
    })),
    { url: `${BASE}/ees`, lastModified: "2026-10-05", priority: 0.8 },
    { url: `${BASE}/ees/what-to-expect`, lastModified: CONTENT_CHECKED, priority: 0.7 },
    { url: `${BASE}/ees/dispute-overstay`, lastModified: "2026-10-05", priority: 0.8 },
    { url: `${BASE}/ees/missing-exit-record`, lastModified: "2026-10-05", priority: 0.8 },
    { url: `${BASE}/widget`, lastModified: "2026-10-05", priority: 0.4 },
    ...publishedEesRecords.map((r) => ({
      url: `${BASE}/ees/data-access/${r.country.toLowerCase()}`,
      lastModified: r.verified_at ?? CONTENT_CHECKED,
      priority: 0.7,
    })),
    { url: `${BASE}/guides/dual-citizens`, lastModified: CONTENT_CHECKED, priority: 0.7 },
    { url: `${BASE}/guides/residence-permit-holders`, lastModified: CONTENT_CHECKED, priority: 0.7 },
    {
      url: `${BASE}/etias/status`,
      lastModified: etias.verified_at ?? CONTENT_CHECKED,
      priority: 0.8,
    },
    ...etiasNationalities.map((r) => ({
      url: `${BASE}/etias/${r.nationality.toLowerCase()}`,
      lastModified: r.verified_at ?? CONTENT_CHECKED,
      priority: 0.6,
    })),
    ...destinations
      .filter((d) => d.status === "verified")
      .map((d) => ({
        url: `${BASE}${destinationPath(d)}`,
        lastModified: latest([
          d.verified_at,
          ...customsItems.filter((i) => i.destination === d.code).map((i) => i.verified_at),
          ...entryRequirements.filter((r) => r.destination === d.code).map((r) => r.verified_at),
        ]),
        priority: 0.7,
      })),
    ...schengenDestinations.map((d) => ({
      url: `${BASE}${destinationPath(d)}`,
      lastModified: latest([d.verified_at, ...schengenCustomsRows(d.code).map((i) => i.verified_at)]),
      priority: 0.7,
    })),
    { url: `${BASE}/bring`, lastModified: DATA_LAST_UPDATED, priority: 0.5 },
    ...travelPairs.filter(isIndexedTravelPair).map((pair) => ({
      url: `${BASE}${travelPairPath(pair)}`,
      lastModified: pair.row.verified_at ?? DATA_LAST_UPDATED,
      priority: 0.6,
    })),
    { url: `${BASE}/medications`, lastModified: DATA_LAST_UPDATED, priority: 0.6 },
    ...medicationProducts.map((p) => ({
      url: `${BASE}/medications/${p.slug}`,
      lastModified: latest(pairsForProduct(p.slug).map((pair) => latestVerified(pair.rows))),
      priority: 0.6,
    })),
    ...productPairs.filter(isIndexedProductPair).map((pair) => {
      const en = `${BASE}/medications/${pair.product.slug}/${pair.destinationSlug}`;
      return {
        url: en,
        lastModified: latestVerified(pair.rows) ?? DATA_LAST_UPDATED,
        priority: 0.5,
        ...(hasGermanProductPage(pair) ? { alternates: { languages: { en, de: `${BASE}/de/medications/${pair.product.slug}/${pair.destinationSlug}` } } } : {}),
      };
    }),
    // German country pages (customs only; no hreflang pair, the English hub isn't the same content).
    ...(germanDestinations().length > 0 ? [{ url: `${BASE}/de/destinations`, lastModified: DATA_LAST_UPDATED, priority: 0.4 }] : []),
    ...germanDestinations().map((d) => ({
      url: `${BASE}/de/destinations/${d.slug}`,
      lastModified: latest(d.pairs.map((p) => germanLastModified(p.rows))),
      priority: 0.5,
    })),
    // German medicine pages: index, product hubs and pairs, only where every row is translated.
    ...(germanProductPairs.length > 0
      ? [
          {
            url: `${BASE}/de/medications`,
            lastModified: DATA_LAST_UPDATED,
            priority: 0.4,
            alternates: { languages: { en: `${BASE}/medications`, de: `${BASE}/de/medications` } },
          },
        ]
      : []),
    ...germanProducts.map((p) => ({
      url: `${BASE}/de/medications/${p.slug}`,
      lastModified: latest(germanPairsForProduct(p.slug).map((pair) => germanLastModified(pair.rows))),
      priority: 0.4,
      alternates: { languages: { en: `${BASE}/medications/${p.slug}`, de: `${BASE}/de/medications/${p.slug}` } },
    })),
    ...germanProductPairs.map((pair) => {
      const en = `${BASE}/medications/${pair.product.slug}/${pair.destinationSlug}`;
      const de = `${BASE}/de/medications/${pair.product.slug}/${pair.destinationSlug}`;
      return { url: de, lastModified: germanLastModified(pair.rows), priority: 0.5, alternates: { languages: { en, de } } };
    }),
    ...bringPairs.filter(isIndexedBringPair).map((p) => {
      const en = `${BASE}/bring/${p.itemSlug}/${p.destinationSlug}`;
      const de = `${BASE}/de/bring/${p.itemSlug}/${p.destinationSlug}`;
      const translated = hasGermanPage(p);
      return {
        url: en,
        lastModified: p.lastVerified ?? CONTENT_CHECKED,
        priority: 0.6,
        ...(translated ? { alternates: { languages: { en, de } } } : {}),
      };
    }),
    // German index and category hubs (only categories with German pages).
    ...(germanPairs().length > 0
      ? [
          { url: `${BASE}/de/bring`, lastModified: DATA_LAST_UPDATED, priority: 0.4, alternates: { languages: { en: `${BASE}/bring`, de: `${BASE}/de/bring` } } },
          ...[...new Set(germanPairs().map((p) => p.itemSlug))].map((item) => ({
            url: `${BASE}/de/bring/${item}`,
            lastModified: DATA_LAST_UPDATED,
            priority: 0.4,
            alternates: { languages: { en: `${BASE}/bring/${item}`, de: `${BASE}/de/bring/${item}` } },
          })),
        ]
      : []),
    // German pages (pilot locale): only where every row is translated.
    ...germanPairs().map((p) => {
      const en = `${BASE}/bring/${p.itemSlug}/${p.destinationSlug}`;
      const de = `${BASE}/de/bring/${p.itemSlug}/${p.destinationSlug}`;
      // A German page changes when its English rows are re-checked *or* retranslated:
      // take the later date, so a newly translated page is picked up by `indexnow --since`.
      return { url: de, lastModified: germanLastModified(p.rows), priority: 0.5, alternates: { languages: { en, de } } };
    }),
    ...Object.entries(BRING_CATEGORIES).map(([category, meta]) => {
      const dates = customsItems
        .filter((i) => i.category === category && i.status === "verified" && i.verified_at)
        .map((i) => i.verified_at as string);
      return {
        url: `${BASE}/bring/${meta.slug}`,
        lastModified: dates.length > 0 ? dates.sort().at(-1)! : CONTENT_CHECKED,
        priority: 0.6,
      };
    }),
    { url: `${BASE}/changelog`, lastModified: CONTENT_CHECKED, priority: 0.5 },
    { url: `${BASE}/about`, lastModified: CONTENT_CHECKED, priority: 0.3 },
    { url: `${BASE}/methodology`, lastModified: CONTENT_CHECKED, priority: 0.4 },
    { url: `${BASE}/developers`, lastModified: "2026-09-16", priority: 0.4 },
    { url: `${BASE}/sources`, lastModified: CONTENT_CHECKED, priority: 0.4 },
    { url: `${BASE}/faq`, lastModified: CONTENT_CHECKED, priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: LEGAL_UPDATED, priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: LEGAL_UPDATED, priority: 0.2 },
    { url: `${BASE}/blog`, lastModified: CONTENT_CHECKED, priority: 0.5 },
    ...blogPosts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.verifiedAt,
      priority: 0.4,
    })),
  ];
  if (GERMAN_INDEXABLE) return entries;
  // German pages are noindex for now (lib/translations.ts): no URLs, no hreflang alternates.
  return entries
    .filter((e) => !e.url.startsWith(`${BASE}/de/`) && e.url !== `${BASE}/de`)
    .map(({ alternates: _alternates, ...rest }) => rest);
}
