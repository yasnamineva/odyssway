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
  const destinations = JSON.parse(readFileSync(file, "utf8")) as Array<{ code: string; name: string }>;
  return destinations.map((d) => ({
    source: `/destinations/${d.code.toLowerCase()}`,
    destination: `/destinations/${d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    permanent: true,
  }));
}

const nextConfig: NextConfig = {
  async redirects() {
    return destinationCodeRedirects();
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
