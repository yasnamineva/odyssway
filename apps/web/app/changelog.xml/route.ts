import { changes, rssFeed } from "../../lib/changelog";
import { SITE_URL } from "../../lib/site";

/**
 * /changelog.xml: the verification changelog as an RSS 2.0 feed, so people can
 * follow rule changes in their own feed reader with no account and nothing
 * stored by us (GROWTH_AND_ROADMAP.md §2.1). Static at build time.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const xml = rssFeed({
    title: "Odyssway: border rule changes",
    link: `${SITE_URL}/changelog`,
    self: `${SITE_URL}/changelog.xml`,
    description:
      "Every change to Odyssway's verified travel rules: entry requirements, stay limits and what you can bring, each checked against an official source.",
    items: changes.slice(0, 50),
    itemLink: `${SITE_URL}/changelog`,
  });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
