import changelog from "../../../../data/changelog.json";
import { SITE_URL } from "../../lib/site";

/**
 * /changelog.xml: the verification changelog as an RSS 2.0 feed, so people can
 * follow rule changes in their own feed reader with no account and nothing
 * stored by us (GROWTH_AND_ROADMAP.md §2.1). Same entries as /changelog,
 * derived from git by scripts/generate-changelog.ts; static at build time.
 */
export const dynamic = "force-static";

interface Entry {
  commit: string;
  date: string;
  dataset: string;
  summary: string;
}

const DATASET_LABEL: Record<string, string> = {
  "entry-requirements": "Entry requirements",
  "customs-items": "What you can bring",
  destinations: "Destinations",
  countries: "Schengen countries",
  etias: "ETIAS",
  ees: "EES",
  "nationality-rules": "Nationality rules",
  "overstay-penalties": "Overstay penalties",
};

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** RFC 822 date at noon UTC, from a YYYY-MM-DD commit date. */
function rfc822(date: string): string {
  return new Date(`${date}T12:00:00Z`).toUTCString();
}

export function GET(): Response {
  // One item per commit: a commit touching several data files is one change.
  const byCommit = new Map<string, { date: string; summary: string; datasets: string[] }>();
  for (const e of changelog as Entry[]) {
    const item = byCommit.get(e.commit) ?? { date: e.date, summary: e.summary, datasets: [] };
    item.datasets.push(DATASET_LABEL[e.dataset] ?? e.dataset);
    byCommit.set(e.commit, item);
  }
  const items = [...byCommit.entries()].slice(0, 50);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Odyssway: border rule changes</title>
    <link>${SITE_URL}/changelog</link>
    <atom:link href="${SITE_URL}/changelog.xml" rel="self" type="application/rss+xml" />
    <description>Every change to Odyssway's verified travel rules: entry requirements, stay limits and what you can bring, each checked against an official source.</description>
    <language>en</language>
${items
  .map(
    ([commit, it]) => `    <item>
      <title>${escapeXml(it.summary)}</title>
      <link>${SITE_URL}/changelog</link>
      <guid isPermaLink="false">${commit}</guid>
      <pubDate>${rfc822(it.date)}</pubDate>
      <description>${escapeXml(`Updated: ${[...new Set(it.datasets)].join(", ")}. See the update history for the source and check date.`)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
