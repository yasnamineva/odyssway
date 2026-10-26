/**
 * Month-over-month Search Console comparison (GROWTH_AND_ROADMAP.md §5.1).
 *
 *   pnpm gsc:compare 2026-10 2026-11
 *
 * Reads Pages.csv and Queries.csv from each month's export under seo/gsc/<month>/
 * (the unzipped folder can sit one level down), and writes seo/gsc/<new>/compare.md:
 * totals, each page type's position, the biggest movers, pages that reached page 1
 * and pages that fell off. The data stays local (seo/gsc/ is git-ignored); only this
 * script is in the repo.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "seo", "gsc");

type Row = { key: string; clicks: number; impressions: number; position: number };

/** Minimal CSV reader: Search Console quotes fields that contain commas. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = !quoted;
      } else if (ch === "," && !quoted) {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

function findFile(month: string, name: string): string {
  const dir = join(ROOT, month);
  if (!existsSync(dir)) throw new Error(`No export folder seo/gsc/${month}/`);
  if (existsSync(join(dir, name))) return join(dir, name);
  for (const sub of readdirSync(dir)) {
    const p = join(dir, sub, name);
    if (statSync(join(dir, sub)).isDirectory() && existsSync(p)) return p;
  }
  throw new Error(`No ${name} in seo/gsc/${month}/`);
}

function load(month: string, name: string): Map<string, Row> {
  const [, ...rows] = parseCsv(readFileSync(findFile(month, name), "utf8"));
  const out = new Map<string, Row>();
  for (const r of rows) {
    const key = r[0]!.replace(/^https?:\/\/[^/]+/, "") || "/";
    out.set(key, { key, clicks: Number(r[1]), impressions: Number(r[2]), position: Number(r[4]) });
  }
  return out;
}

/** The page types the October review used, so months compare like for like. */
function section(path: string): string {
  if (/^\/bring\/[^/]+\/[^/]+$/.test(path)) return "Can I bring it? pairs";
  if (/^\/bring\/[^/]+$/.test(path)) return "Can I bring it? hubs";
  if (/^\/medications\/[^/]+\/[^/]+$/.test(path)) return "Named-medicine pairs";
  if (/^\/destinations\/[^/]+\/[^/]+$/.test(path)) return "Passport × destination pairs";
  if (/^\/destinations\/[^/]+$/.test(path)) return "Destination hubs";
  if (/^\/(rules|ees|etias)\//.test(path)) return "Rules, EES, ETIAS";
  if (path.startsWith("/blog")) return "Blog";
  return "Other";
}

function summarise(rows: Iterable<Row>) {
  let clicks = 0;
  let impressions = 0;
  let weighted = 0;
  let n = 0;
  for (const r of rows) {
    clicks += r.clicks;
    impressions += r.impressions;
    weighted += r.position * r.impressions;
    n++;
  }
  return { n, clicks, impressions, position: impressions ? weighted / impressions : 0 };
}

const fmt = (x: number, d = 1) => x.toFixed(d);
const delta = (a: number, b: number, d = 1) => `${b - a >= 0 ? "+" : ""}${(b - a).toFixed(d)}`;

function main(): void {
  const [prev, next] = process.argv.slice(2);
  if (!prev || !next) {
    console.error("Usage: pnpm gsc:compare <previous YYYY-MM> <new YYYY-MM>");
    process.exit(1);
  }
  const a = load(prev, "Pages.csv");
  const b = load(next, "Pages.csv");
  const lines: string[] = [`# Search Console: ${prev} → ${next}`, ""];

  const ta = summarise(a.values());
  const tb = summarise(b.values());
  lines.push(
    "| | " + prev + " | " + next + " | Change |",
    "|---|---|---|---|",
    `| Clicks | ${ta.clicks} | ${tb.clicks} | ${delta(ta.clicks, tb.clicks, 0)} |`,
    `| Impressions | ${ta.impressions} | ${tb.impressions} | ${delta(ta.impressions, tb.impressions, 0)} |`,
    `| Position (impression-weighted; lower is better) | ${fmt(ta.position)} | ${fmt(tb.position)} | ${delta(ta.position, tb.position)} |`,
    "",
    "## By page type",
    "",
    "| Section | Pages | Clicks | Impressions | Position | Position change |",
    "|---|---|---|---|---|---|",
  );
  const sections = [...new Set([...a.keys(), ...b.keys()].map(section))].sort();
  for (const s of sections) {
    const sa = summarise([...a.values()].filter((r) => section(r.key) === s));
    const sb = summarise([...b.values()].filter((r) => section(r.key) === s));
    lines.push(`| ${s} | ${sb.n} | ${sb.clicks} | ${sb.impressions} | ${fmt(sb.position)} | ${sa.n ? delta(sa.position, sb.position) : "new"} |`);
  }

  // Movers: pages with enough impressions in both months to mean something.
  const both = [...b.values()]
    .filter((r) => a.has(r.key) && r.impressions >= 20 && a.get(r.key)!.impressions >= 20)
    .map((r) => ({ ...r, before: a.get(r.key)!.position }));
  const up = [...both].sort((x, y) => x.position - x.before - (y.position - y.before)).slice(0, 20);
  const down = [...both].sort((x, y) => y.position - y.before - (x.position - x.before)).slice(0, 10);
  const table = (rows: typeof both) => [
    "| Page | Impressions | Position before | Now | Change |",
    "|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.key} | ${r.impressions} | ${fmt(r.before)} | ${fmt(r.position)} | ${delta(r.before, r.position)} |`),
  ];
  lines.push("", "## Biggest gains (position fell = better)", "", ...table(up.filter((r) => r.position < r.before)));
  lines.push("", "## Biggest drops", "", ...table(down.filter((r) => r.position > r.before)));

  const reached = [...b.values()].filter((r) => r.position <= 10 && r.impressions >= 20 && (a.get(r.key)?.position ?? 99) > 10);
  const fell = [...a.values()].filter((r) => r.position <= 10 && r.impressions >= 20 && (b.get(r.key)?.position ?? 99) > 10);
  lines.push("", "## Reached page 1 (position ≤ 10, 20+ impressions)", "", ...reached.map((r) => `- ${r.key} (${fmt(a.get(r.key)?.position ?? NaN)} → ${fmt(r.position)})`));
  lines.push("", "## Fell off page 1", "", ...fell.map((r) => `- ${r.key} (${fmt(r.position)} → ${fmt(b.get(r.key)?.position ?? NaN)})`));

  // Striking distance for the next work list.
  const striking = [...b.values()].filter((r) => r.position > 10 && r.position <= 20 && r.impressions >= 30).sort((x, y) => y.impressions - x.impressions);
  lines.push("", "## Next work list: striking distance (position 11–20, 30+ impressions)", "", ...striking.map((r) => `- ${r.key}: ${r.impressions} impressions, position ${fmt(r.position)}`));

  const out = join(ROOT, next, "compare.md");
  writeFileSync(out, lines.join("\n") + "\n");
  console.log(`Wrote ${out}`);
}

main();
