/**
 * Entry rules stored by group, not by pair. Many destinations publish one list
 * ("nationals of these countries need no visa for 90 days"): data/entry-lists.json
 * records that list once, per destination, as groups of passports that share a
 * requirement and stay rule. The pair rows in entry-requirements.json are what the
 * site renders; this file says which group each passport belongs to, so a list change
 * is one edit and adding a passport is adding its code to a group.
 *
 *   pnpm entry:lists --init SC KE   # derive a destination's groups from its current rows
 *   pnpm entry:lists --apply        # create missing rows from each group's template row
 *   pnpm entry:lists --check        # rows must agree with their group (also run by validate-data)
 *
 * --apply copies the group's `template` row (an existing pair row for that destination)
 * and swaps the template passport's country name and citizen label for the new
 * passport's in the notes and documents. When the template quotes the list's own label
 * for its country, the group must give both labels (`labels`), so the new row quotes the
 * list exactly; otherwise --apply refuses. Held passports (`held`, with a reason) are skipped.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const LISTS = join(ROOT, "data", "entry-lists.json");
const ROWS = join(ROOT, "data", "entry-requirements.json");
const NATS = join(ROOT, "data", "nationality-rules.json");

type StayPolicy = Record<string, unknown> & { kind: string };
type Row = {
  nationality: string;
  destination: string;
  requirement: string;
  stayPolicy: StayPolicy;
  notes?: string;
  documentsNeeded?: string[];
  legal_source: { name: string; url: string };
  status: string;
  verified_at?: string | null;
  verified_by?: string | null;
};
export type EntryGroup = {
  label: string;
  requirement: string;
  stayPolicy: StayPolicy;
  template: string;
  nationalities: string[];
  /** The list's own wording for each passport ("Cyprus (Republic of)"), when rows quote it. */
  labels?: Record<string, string>;
};
export type EntryList = {
  destination: string;
  source: { name: string; url: string };
  checked: string;
  groups: EntryGroup[];
  held?: Array<{ nationality: string; reason: string }>;
};

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Problems: a group member whose row disagrees with the group, or that has no row and isn't held. */
export function checkEntryLists(lists: EntryList[], rows: Row[]): string[] {
  const problems: string[] = [];
  for (const list of lists) {
    const held = new Set((list.held ?? []).map((h) => h.nationality));
    const seen = new Set<string>();
    for (const g of list.groups) {
      for (const nat of g.nationalities) {
        if (seen.has(nat)) problems.push(`${list.destination}: ${nat} is in more than one group`);
        seen.add(nat);
        const row = rows.find((r) => r.destination === list.destination && r.nationality === nat);
        if (!row) {
          if (!held.has(nat)) problems.push(`${list.destination}: ${nat} is in group "${g.label}" but has no row (run --apply)`);
          continue;
        }
        if (row.requirement !== g.requirement || !same(row.stayPolicy, g.stayPolicy))
          problems.push(
            `${list.destination}: ${nat} row says ${row.requirement} ${JSON.stringify(row.stayPolicy)}, group "${g.label}" says ${g.requirement} ${JSON.stringify(g.stayPolicy)}`,
          );
      }
      if (!rows.some((r) => r.destination === list.destination && r.nationality === g.template))
        problems.push(`${list.destination}: template ${g.template} for "${g.label}" has no row`);
    }
    for (const r of rows.filter((r) => r.destination === list.destination && r.status === "verified"))
      if (!seen.has(r.nationality)) problems.push(`${list.destination}: ${r.nationality} has a row but isn't in any group`);
  }
  return problems;
}

function init(codes: string[], lists: EntryList[], rows: Row[]): EntryList[] {
  for (const dest of codes) {
    if (lists.some((l) => l.destination === dest)) throw new Error(`${dest} already has a list`);
    const destRows = rows.filter((r) => r.destination === dest && r.status === "verified");
    if (destRows.length === 0) throw new Error(`${dest} has no rows`);
    const groups = new Map<string, EntryGroup>();
    for (const r of destRows) {
      const key = `${r.requirement}|${JSON.stringify(r.stayPolicy)}`;
      const g = groups.get(key) ?? {
        label: `${r.requirement.replace(/_/g, " ")}${r.stayPolicy.kind === "fixed_per_entry" ? `, ${r.stayPolicy.maxDays} days` : r.stayPolicy.kind === "rolling_window" ? `, ${r.stayPolicy.maxDays} in ${r.stayPolicy.windowDays} days` : ""}`,
        requirement: r.requirement,
        stayPolicy: r.stayPolicy,
        template: r.nationality,
        nationalities: [],
      };
      g.nationalities.push(r.nationality);
      groups.set(key, g);
    }
    const sources = new Map<string, number>();
    for (const r of destRows) sources.set(r.legal_source.url, (sources.get(r.legal_source.url) ?? 0) + 1);
    const mainUrl = [...sources.entries()].sort((a, b) => b[1] - a[1])[0]![0];
    const latest = destRows.map((r) => r.verified_at ?? "").sort().at(-1)!;
    lists.push({
      destination: dest,
      source: destRows.find((r) => r.legal_source.url === mainUrl)!.legal_source,
      checked: latest,
      groups: [...groups.values()].map((g) => ({ ...g, nationalities: g.nationalities.sort() })),
    });
  }
  return lists.sort((a, b) => a.destination.localeCompare(b.destination));
}

function apply(lists: EntryList[], rows: Row[]): number {
  const nats = new Map(readJson<Array<{ nationality: string; name: string; citizenLabel: string }>>(NATS).map((n) => [n.nationality, n]));
  let created = 0;
  for (const list of lists) {
    const held = new Set((list.held ?? []).map((h) => h.nationality));
    for (const g of list.groups) {
      const tpl = rows.find((r) => r.destination === list.destination && r.nationality === g.template)!;
      const from = nats.get(g.template)!;
      for (const nat of g.nationalities) {
        if (held.has(nat) || rows.some((r) => r.destination === list.destination && r.nationality === nat)) continue;
        const to = nats.get(nat);
        if (!to) throw new Error(`${nat} isn't in nationality-rules.json`);
        // A template that quotes its country's label from the list ("'Poland (Republic of)'")
        // can't be reused by swapping names: the new row would misquote the source. Use the
        // list's own label for both passports (group.labels), or refuse.
        // An opening quote never follows a letter, so possessives ("Uzbekistan's") don't count.
        const quoted = new RegExp(`(?<![\\p{L}])["'‘“][^"'’”]*${from.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^"'’”]*["'’”]`, "u");
        const fromLabel = g.labels?.[g.template];
        const toLabel = g.labels?.[nat];
        if (tpl.notes && quoted.test(tpl.notes) && !(fromLabel && toLabel))
          throw new Error(`${list.destination}/${nat}: template ${g.template} quotes its list label; add both to "labels" in group "${g.label}"`);
        const swap = (s: string) => {
          const relabelled = fromLabel && toLabel ? s.split(fromLabel).join(toLabel) : s;
          return relabelled.split(from.name).join(to.name).split(from.citizenLabel).join(to.citizenLabel);
        };
        const row: Row = {
          ...structuredClone(tpl),
          nationality: nat,
          ...(tpl.notes ? { notes: swap(tpl.notes) } : {}),
          ...(tpl.documentsNeeded ? { documentsNeeded: tpl.documentsNeeded.map(swap) } : {}),
          verified_at: list.checked,
        };
        if (from.name !== to.name && row.notes?.includes(from.name))
          throw new Error(`${list.destination}/${nat}: notes still name ${from.name}`);
        rows.push(row);
        created++;
      }
    }
  }
  return created;
}

function main(): void {
  const args = process.argv.slice(2);
  const lists = existsSync(LISTS) ? readJson<EntryList[]>(LISTS) : [];
  const rows = readJson<Row[]>(ROWS);
  if (args[0] === "--init") {
    writeFileSync(LISTS, `${JSON.stringify(init(args.slice(1), lists, rows), null, 2)}\n`);
    console.log(`Initialised lists for ${args.slice(1).join(", ")}.`);
  } else if (args[0] === "--apply") {
    const n = apply(lists, rows);
    writeFileSync(ROWS, `${JSON.stringify(rows, null, 2)}\n`);
    console.log(`Created ${n} rows from lists.`);
  }
  const problems = checkEntryLists(lists, rows);
  for (const p of problems) console.error(`✖ ${p}`);
  if (problems.length > 0) process.exit(1);
  console.log(`✔ ${lists.length} entry lists agree with their rows.`);
}

if (process.argv[1]?.endsWith("entry-lists.ts")) main();
