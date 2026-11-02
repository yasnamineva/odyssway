/**
 * Source registry: per destination, the official pages we read for entry rules,
 * customs and medicines, how each is read, whether it's blocked, and how often the
 * destination's rows should be re-checked. The first stop before researching a country
 * (finding the right page is the slow part, and only needs doing once).
 *
 *   pnpm sources:registry          # regenerate data/source-registry.json
 *   pnpm sources:registry --check  # exit 1 if the file is out of date (CI)
 *
 * Derived from the production rows (never hand-edit these): each page's URL, name,
 * how many rows cite it and the latest check date.
 * Kept by hand across regenerations, keyed by URL: `method` (how to read it: "html",
 * "pdf", "image", "api", "gov.uk content API", …), `status` ("readable" | "blocked" |
 * "js" | "image" | "paywalled") and `note`. Pages with no rows yet (a list we know
 * about but couldn't read) live in `known`. Per destination, `recheckDays` (default
 * 180; shorter for volatile rules, with `recheckReason`) drives the "due for re-check"
 * section of `pnpm coverage`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const FILE = join(ROOT, "data", "source-registry.json");
const read = <T>(file: string): T => JSON.parse(readFileSync(join(ROOT, "data", file), "utf8")) as T;

type Src = { name: string; url: string };
type Row = {
  status: string;
  verified_at?: string | null;
  destination: string;
  category?: string;
  legal_source?: Src;
  _sources?: Src[];
};
export type RegistryPage = {
  url: string;
  name: string;
  rows: number;
  lastChecked: string | null;
  method?: string;
  status?: "readable" | "blocked" | "js" | "image" | "paywalled";
  note?: string;
};
export type RegistryEntry = {
  code: string;
  name: string;
  recheckDays: number;
  recheckReason?: string;
  entry: RegistryPage[];
  customs: RegistryPage[];
  medicine: RegistryPage[];
  known?: Array<{ topic: "entry" | "customs" | "medicine"; url: string; status: RegistryPage["status"]; note: string }>;
};

const DEFAULT_RECHECK = 180;

function collect(rows: Row[], topicOf: (r: Row) => "entry" | "customs" | "medicine") {
  const out = new Map<string, { entry: Map<string, RegistryPage>; customs: Map<string, RegistryPage>; medicine: Map<string, RegistryPage> }>();
  for (const r of rows) {
    if (r.status !== "verified") continue;
    const dest = out.get(r.destination) ?? { entry: new Map(), customs: new Map(), medicine: new Map() };
    out.set(r.destination, dest);
    const topic = dest[topicOf(r)];
    const seen = new Set<string>();
    for (const s of [r.legal_source, ...(r._sources ?? [])]) {
      if (!s?.url || seen.has(s.url)) continue;
      seen.add(s.url);
      const page = topic.get(s.url) ?? { url: s.url, name: s.name, rows: 0, lastChecked: null };
      page.rows++;
      if (r.verified_at && (!page.lastChecked || r.verified_at > page.lastChecked)) page.lastChecked = r.verified_at;
      topic.set(s.url, page);
    }
  }
  return out;
}

function main(): void {
  const entries = read<Row[]>("entry-requirements.json");
  const customs = read<Row[]>("customs-items.json");
  const names = new Map<string, string>([
    ...read<Array<{ code: string; name: string }>>("destinations.json").map((d) => [d.code, d.name] as const),
    ...read<{ countries: Array<{ code: string; name: string }> }>("countries.json").countries.map((c) => [c.code, c.name] as const),
    ["EU", "European Union (harmonised customs)"],
  ]);
  const previous = existsSync(FILE) ? (JSON.parse(readFileSync(FILE, "utf8")) as RegistryEntry[]) : [];
  const prevByCode = new Map(previous.map((p) => [p.code, p]));
  const prevPage = new Map<string, RegistryPage>();
  for (const p of previous) for (const pg of [...p.entry, ...p.customs, ...p.medicine]) prevPage.set(`${p.code}|${pg.url}`, pg);

  const derived = new Map<string, ReturnType<typeof collect> extends Map<string, infer V> ? V : never>();
  for (const [code, v] of collect(entries, () => "entry")) derived.set(code, v);
  for (const [code, v] of collect(customs, (r) => (r.category === "medication" ? "medicine" : "customs"))) {
    const d = derived.get(code) ?? { entry: new Map(), customs: new Map(), medicine: new Map() };
    for (const k of ["customs", "medicine"] as const) for (const [u, pg] of v[k]) d[k].set(u, pg);
    derived.set(code, d);
  }

  const codes = [...new Set([...derived.keys(), ...previous.map((p) => p.code)])].sort();
  const registry: RegistryEntry[] = codes.map((code) => {
    const d = derived.get(code) ?? { entry: new Map(), customs: new Map(), medicine: new Map() };
    const prev = prevByCode.get(code);
    const pages = (m: Map<string, RegistryPage>) =>
      [...m.values()]
        .map((pg) => {
          const kept = prevPage.get(`${code}|${pg.url}`);
          return {
            ...pg,
            ...(kept?.method ? { method: kept.method } : {}),
            ...(kept?.status ? { status: kept.status } : {}),
            ...(kept?.note ? { note: kept.note } : {}),
          };
        })
        .sort((a, b) => b.rows - a.rows || a.url.localeCompare(b.url));
    return {
      code,
      name: names.get(code) ?? code,
      recheckDays: prev?.recheckDays ?? DEFAULT_RECHECK,
      ...(prev?.recheckReason ? { recheckReason: prev.recheckReason } : {}),
      entry: pages(d.entry),
      customs: pages(d.customs),
      medicine: pages(d.medicine),
      ...(prev?.known?.length ? { known: prev.known } : {}),
    };
  });
  const text = `${JSON.stringify(registry, null, 2)}\n`;
  if (process.argv.includes("--check")) {
    const current = existsSync(FILE) ? readFileSync(FILE, "utf8") : "";
    if (current !== text) {
      console.error("data/source-registry.json is out of date: run `pnpm sources:registry`.");
      process.exit(1);
    }
    console.log("Source registry is up to date.");
    return;
  }
  writeFileSync(FILE, text);
  console.log(`Wrote ${registry.length} destinations to data/source-registry.json.`);
}

main();
