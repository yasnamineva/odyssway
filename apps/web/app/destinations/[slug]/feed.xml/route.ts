import { changesForDestination, rssFeed } from "../../../../lib/changelog";
import { destinationBySlug, destinationPath, destinations } from "../../../../lib/destinations";
import { SITE_URL } from "../../../../lib/site";

/**
 * /destinations/[slug]/feed.xml: rule changes for one destination as RSS, from
 * the per-destination changelog (GROWTH_AND_ROADMAP.md §2.1). Static.
 */
export const dynamic = "force-static";

export function generateStaticParams(): Array<{ slug: string }> {
  return destinations
    .filter((d) => d.status === "verified" && changesForDestination(d.code).length > 0)
    .map((d) => ({ slug: destinationPath(d).replace("/destinations/", "") }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  const dest = destinationBySlug(slug);
  if (!dest || dest.status !== "verified") return new Response("Not found", { status: 404 });
  const xml = rssFeed({
    title: `Odyssway: rule changes for ${dest.name}`,
    link: `${SITE_URL}${destinationPath(dest)}`,
    self: `${SITE_URL}${destinationPath(dest)}/feed.xml`,
    description: `Changes to Odyssway's verified entry and customs rules for ${dest.name}, each checked against an official source.`,
    items: changesForDestination(dest.code, 30),
    itemLink: `${SITE_URL}${destinationPath(dest)}`,
  });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
