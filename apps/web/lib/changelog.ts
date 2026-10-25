import changelog from "../../../data/changelog.json";

/**
 * The verification changelog (generated from git by scripts/generate-changelog.ts),
 * grouped by commit: one change can touch several data files. `destinations`
 * lists the destination codes whose rows the change touched.
 */
interface RawEntry {
  commit: string;
  date: string;
  dataset: string;
  summary: string;
  destinations?: string[];
}

export interface ChangeEntry {
  commit: string;
  date: string;
  summary: string;
  datasets: string[];
  destinations: string[];
}

export const changes: ChangeEntry[] = (() => {
  const byCommit = new Map<string, ChangeEntry>();
  for (const e of changelog as RawEntry[]) {
    const c = byCommit.get(e.commit) ?? { commit: e.commit, date: e.date, summary: e.summary, datasets: [], destinations: [] };
    if (!c.datasets.includes(e.dataset)) c.datasets.push(e.dataset);
    for (const d of e.destinations ?? []) if (!c.destinations.includes(d)) c.destinations.push(d);
    byCommit.set(e.commit, c);
  }
  return [...byCommit.values()]; // newest first, as generated
})();

/** Changes that touched a destination's rows, newest first. */
export function changesForDestination(code: string, limit?: number): ChangeEntry[] {
  const list = changes.filter((c) => c.destinations.includes(code));
  return limit === undefined ? list : list.slice(0, limit);
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** RFC 822 date at noon UTC, from a YYYY-MM-DD commit date. */
export function rfc822(date: string): string {
  return new Date(`${date}T12:00:00Z`).toUTCString();
}

/** An RSS 2.0 document for a list of changes. */
export function rssFeed(opts: { title: string; link: string; self: string; description: string; items: ChangeEntry[]; itemLink: string }): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(opts.title)}</title>
    <link>${opts.link}</link>
    <atom:link href="${opts.self}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(opts.description)}</description>
    <language>en</language>
${opts.items
  .map(
    (it) => `    <item>
      <title>${escapeXml(it.summary)}</title>
      <link>${opts.itemLink}</link>
      <guid isPermaLink="false">${it.commit}</guid>
      <pubDate>${rfc822(it.date)}</pubDate>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;
}
