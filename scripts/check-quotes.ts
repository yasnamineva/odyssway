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

function main(): void {
  const outIdx = process.argv.indexOf("--out");
  const outFile = outIdx > 0 ? process.argv[outIdx + 1] : undefined;
  const misses: string[] = [];
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
      const unsaved = urls.length - saved.length;
      const pages = saved.map((p) => normalise(readFileSync(p, "utf8")));
      if (pages.length === 0) {
        uncheckable++;
        continue;
      }
      for (const q of quotes) {
        checkedQuotes++;
        if (pages.some((page) => page.includes(normalise(q)))) found++;
        else
          misses.push(
            `- \`${file}\` ${rowId(file, r)}: “${q.length > 160 ? `${q.slice(0, 157)}…` : q}”` +
              (unsaved > 0 ? ` (${unsaved} cited page${unsaved > 1 ? "s" : ""} not saved; the quote may be there)` : ""),
          );
      }
    }
  }
  const report = [
    "## Quote check",
    "",
    `${found} of ${checkedQuotes} quoted passages found on their sources' saved text; ${uncheckable} rows with quotes had no snapshot to check against.`,
    "",
    ...(misses.length > 0
      ? ["Not found (re-read the source: the rule may have changed, or the page reworded it):", "", ...misses]
      : ["Every checked quote was found."]),
    "",
  ].join("\n");
  process.stdout.write(report);
  if (outFile) writeFileSync(outFile, report);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
