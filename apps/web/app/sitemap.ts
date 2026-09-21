import type { MetadataRoute } from "next";
import { blogPosts } from "../lib/blog";
import { BRING_CATEGORIES } from "../lib/bring-categories";
import { bringPairs } from "../lib/bring-pages";
import { countriesVerifiedAt } from "../lib/countries";
import { customsItems, destinations, entryRequirements } from "../lib/destinations";
import { etias } from "../lib/etias";
import { publishedEesRecords } from "../lib/ees";
import { publishedNationalities } from "../lib/nationalities";
import { publishedOverstayPenalties } from "../lib/overstay-penalties";
import { SITE_URL as BASE } from "../lib/site";

/** Content pages carry the date their sources were last checked (AGENTS.md §7). */
const CONTENT_CHECKED = "2026-07-13";

/** Latest ISO date among the given stamps — lastmod should reflect real data changes, not a fixed date. */
function latest(dates: Array<string | null | undefined>): string {
  const valid = dates.filter((d): d is string => Boolean(d));
  return valid.length > 0 ? valid.sort().at(-1)! : CONTENT_CHECKED;
}

const DATA_LAST_UPDATED = latest([
  ...customsItems.map((i) => i.verified_at),
  ...entryRequirements.map((r) => r.verified_at),
  ...destinations.map((d) => d.verified_at),
]);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: DATA_LAST_UPDATED, priority: 0.9 },
    { url: `${BASE}/trip-check`, lastModified: countriesVerifiedAt, priority: 1 },
    { url: `${BASE}/calculator`, lastModified: countriesVerifiedAt, priority: 0.9 },
    { url: `${BASE}/rules/90-180-rule`, lastModified: CONTENT_CHECKED, priority: 0.8 },
    { url: `${BASE}/rules/overstay-penalties`, lastModified: "2026-09-15", priority: 0.7 },
    ...publishedOverstayPenalties.map((r) => ({
      url: `${BASE}/rules/overstay-penalties/${r.country.toLowerCase()}`,
      lastModified: r.verified_at ?? CONTENT_CHECKED,
      priority: 0.6,
    })),
    { url: `${BASE}/ees`, lastModified: CONTENT_CHECKED, priority: 0.8 },
    { url: `${BASE}/ees/what-to-expect`, lastModified: CONTENT_CHECKED, priority: 0.7 },
    { url: `${BASE}/ees/dispute-overstay`, lastModified: CONTENT_CHECKED, priority: 0.8 },
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
    ...publishedNationalities.map((r) => ({
      url: `${BASE}/etias/${r.nationality.toLowerCase()}`,
      lastModified: r.verified_at ?? CONTENT_CHECKED,
      priority: 0.6,
    })),
    ...destinations
      .filter((d) => d.status === "verified")
      .map((d) => ({
        url: `${BASE}/destinations/${d.code.toLowerCase()}`,
        lastModified: latest([
          d.verified_at,
          ...customsItems.filter((i) => i.destination === d.code).map((i) => i.verified_at),
          ...entryRequirements.filter((r) => r.destination === d.code).map((r) => r.verified_at),
        ]),
        priority: 0.7,
      })),
    { url: `${BASE}/bring`, lastModified: DATA_LAST_UPDATED, priority: 0.5 },
    ...bringPairs.map((p) => ({
      url: `${BASE}/bring/${p.itemSlug}/${p.destinationSlug}`,
      lastModified: p.lastVerified ?? CONTENT_CHECKED,
      priority: 0.6,
    })),
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
    { url: `${BASE}/blog`, lastModified: CONTENT_CHECKED, priority: 0.5 },
    ...blogPosts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.verifiedAt,
      priority: 0.4,
    })),
  ];
}
