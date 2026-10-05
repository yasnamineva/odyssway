import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withMDX = createMDX({});

const nextConfig: NextConfig = {
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
