/**
 * Coverage-gap report for the verified data corpus — what to research next.
 *
 *   pnpm coverage            # full report
 *   pnpm coverage -- --stale-days 60
 *
 * Reports, from the production files in /data only:
 *  1. Entry matrix holes: (nationality × destination) pairs with no verified
 *     row. Pairs that never need a row are skipped: a citizen of the
 *     destination, and EU citizens going anywhere in the EU/Schengen (free
 *     movement — resolved in code, not by data rows).
 *  2. Customs category holes per destination (incl. the "EU" regime).
 *  3. "depends" share per destination — a high share often means one row is
 *     covering items with different outcomes and should be split.
 *  4. Stale rows: verified_at older than --stale-days (default 90).
 *
 * Read-only; never writes to /data.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const read = <T>(file: string): T => JSON.parse(readFileSync(join(ROOT, "data", file), "utf8")) as T;

type Verified = { status: string; verified_at?: string | null };
type EntryRow = Verified & { nationality: string; destination: string };
type CustomsRow = Verified & { destination: string; category: string; verdict: string };
type NationalityRow = Verified & { nationality: string; euCitizen?: boolean };
type DestinationRow = Verified & { code: string; name: string };
type CountryRow = { code: string; schengenMember: boolean; euMember: boolean };

const CATEGORIES = [
  "alcohol",
  "tobacco",
  "cash",
  "medication",
  "cbd_cannabis",
  "food_animal",
  "food_plant",
  "e_cigarettes",
  "weapons",
  "drones",
];

const staleArg = process.argv.indexOf("--stale-days");
const STALE_DAYS = staleArg > -1 ? Number(process.argv[staleArg + 1]) : 90;

const verified = <T extends Verified>(rows: T[]) => rows.filter((r) => r.status === "verified");
const entries = verified(read<EntryRow[]>("entry-requirements.json"));
const customs = verified(read<CustomsRow[]>("customs-items.json"));
const nationalities = verified(read<NationalityRow[]>("nationality-rules.json"));
const destinations = verified(read<DestinationRow[]>("destinations.json"));
const countries = read<{ countries: CountryRow[] }>("countries.json").countries;

const freeMovement = new Set(countries.filter((c) => c.euMember || c.schengenMember).map((c) => c.code));
const euNationals = new Set(nationalities.filter((n) => n.euCitizen).map((n) => n.nationality));
const has = new Set(entries.map((r) => `${r.nationality}>${r.destination}`));

const pct = (n: number, d: number) => (d === 0 ? "—" : `${Math.round((n / d) * 100)}%`);
const out: string[] = [];
const line = (s = "") => out.push(s);

// --- Summary ---
line(`# Coverage report (${new Date().toISOString().slice(0, 10)})`);
line();
line(
  `${nationalities.length} nationalities · ${destinations.length} destinations · ` +
    `${entries.length} entry rows · ${customs.length} customs rows`,
);

// --- 1. Entry matrix holes ---
line();
line("## Entry matrix holes (verified destinations × published nationalities)");
let expected = 0;
const holesByDest = new Map<string, string[]>();
for (const d of destinations) {
  for (const n of nationalities) {
    if (n.nationality === d.code) continue;
    if (euNationals.has(n.nationality) && freeMovement.has(d.code)) continue;
    expected++;
    if (!has.has(`${n.nationality}>${d.code}`)) {
      holesByDest.set(d.code, [...(holesByDest.get(d.code) ?? []), n.nationality]);
    }
  }
}
const holeCount = [...holesByDest.values()].reduce((a, h) => a + h.length, 0);
line(`${expected - holeCount}/${expected} pairs filled (${pct(expected - holeCount, expected)}), ${holeCount} missing.`);
for (const [dest, missing] of [...holesByDest].sort((a, b) => b[1].length - a[1].length)) {
  line(`- ${dest}: ${missing.length} missing — ${missing.join(", ")}`);
}

// --- 2 & 3. Customs categories + "depends" share ---
line();
line("## Customs: category holes and \"depends\" share");
// Schengen states share the "EU" customs regime; destinations.json only holds
// the non-Schengen ones, each with its own rows.
const customsDests = [...destinations.map((d) => d.code), "EU"].sort();
for (const dest of customsDests) {
  const rows = customs.filter((r) => r.destination === dest);
  const missing = CATEGORIES.filter((c) => !rows.some((r) => r.category === c));
  const depends = rows.filter((r) => r.verdict === "depends").length;
  const flags = [
    rows.length === 0 ? "NO ROWS" : null,
    missing.length ? `missing: ${missing.join(", ")}` : null,
    rows.length && depends / rows.length >= 0.5 ? `depends ${pct(depends, rows.length)} — consider splitting rows` : null,
  ].filter(Boolean);
  line(`- ${dest}: ${rows.length} rows, depends ${pct(depends, rows.length)}${flags.length ? ` · ${flags.join(" · ")}` : ""}`);
}

// --- 4. Stale rows ---
line();
line(`## Stale rows (verified_at older than ${STALE_DAYS} days)`);
const today = Date.parse(new Date().toISOString().slice(0, 10));
const staleBy = (rows: Verified[]) =>
  rows.filter((r) => r.verified_at && (today - Date.parse(r.verified_at)) / 86_400_000 > STALE_DAYS).length;
line(`- entry-requirements: ${staleBy(entries)} of ${entries.length}`);
line(`- customs-items: ${staleBy(customs)} of ${customs.length}`);
line(`- nationality-rules: ${staleBy(nationalities)} of ${nationalities.length}`);

console.log(out.join("\n"));
