/** Public origin — canonical URLs, sitemap.xml, robots.txt and JSON-LD all derive from this. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.invalid";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "[seo] NEXT_PUBLIC_SITE_URL is not set: canonical URLs, sitemap.xml and robots.txt will point at https://example.invalid, which search engines will treat as a different site. Set it to the production origin before deploying.",
  );
}
