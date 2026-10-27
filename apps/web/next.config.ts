import { readFileSync } from "node:fs";
import path from "node:path";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withMDX = createMDX({});

/** /destinations/jp → /destinations/japan. Hubs moved from ISO codes to
 * names (what people search for); the code URLs were already indexed and
 * linked, so they redirect permanently rather than 404. Slug rule must match
 * destinationSlug() in lib/destinations.ts. */
function destinationCodeRedirects() {
  const file = path.join(__dirname, "../../data/destinations.json");
  const destinations = JSON.parse(readFileSync(file, "utf8")) as Array<{
    code: string;
    name: string;
  }>;
  return destinations.map((d) => ({
    source: `/destinations/${d.code.toLowerCase()}`,
    destination: `/destinations/${d.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,
    permanent: true,
  }));
}

// Blog posts retired in the 2026-10 rewrite, each sent to the post that now
// covers its topic (or the blog index for the old coverage-milestone posts).
/**
 * Product × country pages withdrawn on 2026-10-16: the country's own source
 * doesn't name the medicine, and lisdexamfetamine (Vyvanse) and tramadol aren't
 * on the UN's international control lists, so the page's claim wasn't supported.
 * Temporary (307) — a page can return once a primary source names the medicine.
 */
const withdrawnMedicationPairs = [
    "vyvanse/mexico",
    "vyvanse/china",
    "vyvanse/saudi-arabia",
    "vyvanse/brazil",
    "vyvanse/south-korea",
    "vyvanse/hong-kong",
    "vyvanse/malaysia",
    "vyvanse/maldives",
    "vyvanse/serbia",
    "vyvanse/taiwan",
    "vyvanse/cyprus",
    "tramadol/australia",
    "tramadol/philippines",
    "tramadol/new-zealand",
    "tramadol/saudi-arabia",
    "tramadol/brazil",
    "tramadol/malaysia",
    "tramadol/maldives",
    "tramadol/cyprus",
].map((pair) => ({
  source: `/medications/${pair}`,
  destination: `/medications/${pair.split("/")[0]}`,
  permanent: false,
}));

/** Withdrawn while its only row awaits primary-source verification (see the research TODO). */
const withdrawnBringPages = [
  { source: "/bring/e-cigarettes/saudi-arabia", destination: "/destinations/saudi-arabia", permanent: false },
  { source: "/bring/e-cigarettes/china", destination: "/destinations/china", permanent: false },
  { source: "/bring/drones/brazil", destination: "/destinations/brazil", permanent: false },
  { source: "/bring/e-cigarettes/morocco", destination: "/destinations/morocco", permanent: false },
  { source: "/bring/e-cigarettes/kenya", destination: "/destinations/kenya", permanent: false },
  { source: "/bring/e-cigarettes/south-africa", destination: "/destinations/south-africa", permanent: false },
  { source: "/bring/e-cigarettes/albania", destination: "/destinations/albania", permanent: false },
  // Overstay rows sourced from NGO, news, law-firm or mirror sites (2026-10-19).
  { source: "/rules/overstay-penalties/gr", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/lt", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/ee", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/dk", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/bg", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/ch", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/pt", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/ro", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/si", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/cz", destination: "/rules/overstay-penalties", permanent: false },
  { source: "/rules/overstay-penalties/sk", destination: "/rules/overstay-penalties", permanent: false },
];

const retiredBlogRedirects = (
  [
    ["ees-live-five-countries", "/blog/europe-counts-your-days"],
    ["kenya-replaced-visa-on-arrival", "/blog/visa-free-is-not-form-free"],
    ["south-africa-eta-launched", "/blog/visa-free-is-not-form-free"],
    ["twenty-destinations-verified", "/blog/thailand-visa-free-cut-2026"],
    ["twenty-five-destinations-verified", "/blog/thailand-visa-free-cut-2026"],
    ["sixteen-destinations-verified", "/blog"],
  ] as const
).map(([slug, destination]) => ({
  source: `/blog/${slug}`,
  destination,
  permanent: true,
}));

const nextConfig: NextConfig = {
  async redirects() {
    return [...destinationCodeRedirects(), ...retiredBlogRedirects, ...withdrawnMedicationPairs, ...withdrawnBringPages];
  },
  transpilePackages: ["@odyssway/engine"],
  pageExtensions: ["ts", "tsx", "mdx"],
  // Always render <meta> tags in <head>. Next 15 otherwise streams metadata
  // into <body> on dynamic pages (e.g. /trip-check, which reads searchParams)
  // for any crawler it considers JS-capable — fine for Google, but link
  // previews and simpler crawlers miss the description. Our metadata is
  // static strings, so there's nothing to gain from streaming it.
  htmlLimitedBots: /.*/,
};

export default withNextIntl(withMDX(nextConfig));
