/**
 * Quote check: every passage a row quotes from its source should still be on that
 * source. For each row in entry-requirements.json and customs-items.json, the quoted
 * passages in its notes, limits and summary (in '…', "…" or “…”, 30+ characters) are
 * looked up in the saved text of the row's cited pages: the snapshots that
 * scripts/watch-sources.ts keeps (same ids), so it runs right after the watcher in CI.
 *
 * Output: a markdown report of quotes not found on any of the row's snapshots, and a
 * count of rows that couldn't be checked (no snapshot: unreachable, JS or PDF source).
 * A miss isn't proof of an error (a page can reword a sentence without changing the
 * rule, or a quote may be a translation), so the report is for review, not a gate.
 *
 *   pnpm check:quotes                      # report to stdout
 *   pnpm check:quotes -- --out <file.md>   # also write it to a file
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_DIR = process.env.SOURCE_SNAPSHOT_DIR ?? join(ROOT, ".cache", "source-snapshots");
const MIN_QUOTE = 30;
/** Saved text shorter than this is usually a landing page whose rule sits in a linked PDF or table. */
const THIN_PAGE = 6000;

type Row = {
  slug?: string;
  nationality?: string;
  destination: string;
  notes?: string;
  summary?: string;
  limits?: { description?: string };
  legal_source?: { url: string };
  _sources?: Array<{ url: string }>;
  status?: string;
};

/** Same id scheme as scripts/watch-sources.ts (`data-<sha1 10>`, `-s` for GOV.UK advice sections). */
function snapshotId(url: string): string {
  const govuk = /^https:\/\/www\.gov\.uk\/foreign-travel-advice\/[a-z0-9-]+(?:\/[a-z0-9-]+)?\/?(?:[?#].*)?$/.test(url);
  return `data-${createHash("sha1").update(url).digest("hex").slice(0, 10)}${govuk ? "-s" : ""}`;
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—", hellip: "…",
};

/** Snapshots can keep HTML entities (`&#8217;`, `&nbsp;`) that the rows' quotes don't have. */
function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (whole, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? whole);
}

/** Lowercase, straight quotes, single spaces, no soft hyphens: wording compared, not typography. */
export function normalise(text: string): string {
  return decodeEntities(text)
    .normalize("NFKC")
    .replace(/[­​]/g, "")
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”«»„]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/ ([,.;:!?)])/g, "$1")
    .replace(/\( /g, "(")
    .toLowerCase()
    .trim();
}

/** Quoted passages, split at ellipses (a quote with "…" is several fragments of the page). */
export function quotesIn(text: string): string[] {
  const out: string[] = [];
  // Single quotes only when they open after a space/colon/paren and close before
  // punctuation or a space, so apostrophes ("Türkiye's") don't start a quote.
  const patterns = [/“([^”]+)”/g, /"([^"]+)"/g, /(?:^|[\s(:])'([^']{10,}?)'(?=[\s.,;:)!?]|$)/g];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      for (const part of m[1]!.split(/\s*(?:…|\.\.\.|\[[^\]]*\])\s*/)) {
        const q = part.trim().replace(/^[.,;:]+|[.,;:]+$/g, "");
        if (q.length >= MIN_QUOTE) out.push(q);
      }
    }
  }
  return [...new Set(out)];
}

function rowId(file: string, r: Row): string {
  return file.startsWith("customs") ? (r.slug ?? "?") : `${r.nationality}→${r.destination}`;
}

type Miss = { file: string; quote: string; unsaved: boolean; rows: string[] };

/** Report lines: misses on fully saved sources first (the strongest sign of a change), each quote once. */
export function missLines(misses: Miss[]): string[] {
  const line = (m: Miss) =>
    `- \`${m.file}\` ${m.rows.length > 8 ? `${m.rows.slice(0, 8).join(", ")} and ${m.rows.length - 8} more` : m.rows.join(", ")}: “${m.quote.length > 160 ? `${m.quote.slice(0, 157)}…` : m.quote}”`;
  const saved = misses.filter((m) => !m.unsaved);
  const partial = misses.filter((m) => m.unsaved);
  return [
    ...(saved.length > 0
      ? ["Not found on any cited page (re-read the source: the rule may have changed, or the page reworded it):", "", ...saved.map(line), ""]
      : []),
    ...(partial.length > 0
      ? ["Not found, but some cited pages weren't saved or saved only a short landing page (the quote may be in a linked document):", "", ...partial.map(line), ""]
      : []),
  ];
}

function main(): void {
  const outIdx = process.argv.indexOf("--out");
  const outFile = outIdx > 0 ? process.argv[outIdx + 1] : undefined;
  // One entry per (file, quote, saved-or-not): the same quote is often repeated across a
  // destination's rows for every passport, and listing each row buries the other misses.
  const misses = new Map<string, Miss>();
  let checkedQuotes = 0;
  let found = 0;
  let uncheckable = 0;
  for (const file of ["entry-requirements.json", "customs-items.json"]) {
    const rows = JSON.parse(readFileSync(join(ROOT, "data", file), "utf8")) as Row[];
    for (const r of rows) {
      if (r.status !== "verified") continue;
      const quotes = quotesIn([r.notes, r.summary, r.limits?.description].filter(Boolean).join(" "));
      if (quotes.length === 0) continue;
      const urls = [...new Set([r.legal_source?.url, ...(r._sources ?? []).map((s) => s.url)].filter(Boolean) as string[])];
      const saved = urls.map((u) => join(SNAPSHOT_DIR, `${snapshotId(u)}.txt`)).filter((p) => existsSync(p));
      const pages = saved.map((p) => normalise(readFileSync(p, "utf8")));
      // A short saved page counts like an unsaved one: the quote may be in a document it links to.
      const unsaved = urls.length - pages.filter((page) => page.length >= THIN_PAGE).length;
      if (pages.length === 0) {
        uncheckable++;
        continue;
      }
      for (const q of quotes) {
        checkedQuotes++;
        if (pages.some((page) => page.includes(normalise(q)))) found++;
        else {
          const key = `${file}\u0000${q}\u0000${unsaved > 0}`;
          const miss = misses.get(key) ?? { file, quote: q, unsaved: unsaved > 0, rows: [] };
          miss.rows.push(rowId(file, r));
          misses.set(key, miss);
        }
      }
    }
  }
  const report = [
    "## Quote check",
    "",
    `${found} of ${checkedQuotes} quoted passages found on their sources' saved text; ${uncheckable} rows with quotes had no snapshot to check against.`,
    "",
    ...(misses.size > 0 ? missLines([...misses.values()]) : ["Every checked quote was found."]),
    "",
  ].join("\n");
  process.stdout.write(report);
  if (outFile) writeFileSync(outFile, report);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
