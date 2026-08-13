import type { MetadataRoute } from "next";
import { blogPosts } from "../lib/blog";
import { countriesVerifiedAt } from "../lib/countries";
import { destinations } from "../lib/destinations";
import { etias } from "../lib/etias";
import { publishedEesRecords } from "../lib/ees";
import { publishedNationalities } from "../lib/nationalities";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.invalid";

/** Content pages carry the date their sources were last checked (AGENTS.md §7). */
const CONTENT_CHECKED = "2026-07-13";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: CONTENT_CHECKED, priority: 0.9 },
    { url: `${BASE}/trip-check`, lastModified: countriesVerifiedAt, priority: 1 },
    { url: `${BASE}/calculator`, lastModified: countriesVerifiedAt, priority: 0.9 },
    { url: `${BASE}/rules/90-180-rule`, lastModified: CONTENT_CHECKED, priority: 0.8 },
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
        lastModified: d.verified_at ?? CONTENT_CHECKED,
        priority: 0.7,
      })),
    { url: `${BASE}/changelog`, lastModified: CONTENT_CHECKED, priority: 0.5 },
    { url: `${BASE}/about`, lastModified: CONTENT_CHECKED, priority: 0.3 },
    { url: `${BASE}/methodology`, lastModified: CONTENT_CHECKED, priority: 0.4 },
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
