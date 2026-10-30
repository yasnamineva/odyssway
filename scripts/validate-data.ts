/**
 * CI gate for /data (Accuracy Policy, AGENTS.md §3 + §5):
 *
 * 1. Every production file in /data must parse against its Zod schema AND
 *    carry status "verified" everywhere (verified = checked against the cited
 *    primary official source, by a human or an agent) — the build FAILS
 *    otherwise.
 * 2. Every file in /data/UNVERIFIED must still parse structurally, but must
 *    NOT claim "verified" status (that's what promotion is for).
 * 3. No production source file (apps/, content/) may reference
 *    data/UNVERIFIED — the build FAILS if one does.
 *
 * Run: pnpm validate:data
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { ZodType } from "zod";
import {
  bilateralAgreementsFileSchema,
  countriesFileSchema,
  customsItemsFileSchema,
  destinationsFileSchema,
  eesFileSchema,
  entryRequirementsFileSchema,
  etiasFileSchema,
  nationalityRulesFileSchema,
  overstayPenaltiesFileSchema,
  tripChargesFileSchema,
  travelAuthorisationsFileSchema,
} from "../packages/engine/src/schemas";

const ROOT = join(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, "data");
const UNVERIFIED_DIR = join(DATA_DIR, "UNVERIFIED");

const SCHEMA_BY_FILE: Record<string, ZodType> = {
  "countries.json": countriesFileSchema,
  "nationality-rules.json": nationalityRulesFileSchema,
  "bilateral-agreements.json": bilateralAgreementsFileSchema,
  "bilateral-candidates.json": bilateralAgreementsFileSchema, // UNVERIFIED only
  "overstay-penalties.json": overstayPenaltiesFileSchema,
  "ees.json": eesFileSchema,
  "etias.json": etiasFileSchema,
  "destinations.json": destinationsFileSchema,
  "entry-requirements.json": entryRequirementsFileSchema,
  "customs-items.json": customsItemsFileSchema,
  "trip-charges.json": tripChargesFileSchema,
  "travel-authorisations.json": travelAuthorisationsFileSchema,
};

const errors: string[] = [];

function rel(path: string): string {
  return relative(ROOT, path);
}

/** Non-rule bookkeeping files that carry no legal content. */
const NON_RULE_FILES = new Set(["source-hashes.json", "changelog.json", "destination-history.json"]);

function jsonFilesIn(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".json") && !NON_RULE_FILES.has(f))
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}

/** Recursively collect every `status` value in a parsed JSON document. */
function collectStatuses(node: unknown, path: string, out: Array<{ path: string; value: unknown }>): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectStatuses(item, `${path}[${i}]`, out));
  } else if (node !== null && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "status") out.push({ path: `${path}.${key}`, value });
      else collectStatuses(value, `${path}.${key}`, out);
    }
  }
}

function validateFile(file: string, mustBeVerified: boolean): void {
  const name = file.split("/").at(-1)!;
  const schema = SCHEMA_BY_FILE[name];
  if (!schema) {
    errors.push(`${rel(file)}: no schema registered for this file name.`);
    return;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    errors.push(`${rel(file)}: invalid JSON — ${(e as Error).message}`);
    return;
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${rel(file)}: ${issue.path.join(".") || "(root)"} — ${issue.message}`);
    }
    return;
  }
  const statuses: Array<{ path: string; value: unknown }> = [];
  collectStatuses(parsed, "$", statuses);
  for (const s of statuses) {
    if (mustBeVerified && s.value !== "verified") {
      errors.push(
        `${rel(file)}: ${s.path} is "${String(s.value)}" — only data verified against a primary official source may live in /data. Move it to data/UNVERIFIED/.`,
      );
    }
    if (!mustBeVerified && s.value === "verified") {
      errors.push(
        `${rel(file)}: ${s.path} claims "verified" inside UNVERIFIED/ — promote it to /data instead.`,
      );
    }
  }
}

/** Fail if production source references UNVERIFIED data. */
function checkNoUnverifiedReferences(): void {
  const scanRoots = [join(ROOT, "apps"), join(ROOT, "content")].filter((d) => {
    try {
      return statSync(d).isDirectory();
    } catch {
      return false;
    }
  });
  const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".mdx", ".md", ".json"]);
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (exts.has(entry.name.slice(entry.name.lastIndexOf(".")))) {
        const text = readFileSync(full, "utf8");
        if (text.includes("UNVERIFIED")) {
          errors.push(
            `${rel(full)}: references UNVERIFIED data — production output must never include it.`,
          );
        }
      }
    }
  };
  scanRoots.forEach(walk);
}

/**
 * `passportValidity` restates a row's own documentsNeeded wording (§1.6). Fail if the
 * wording no longer says what the structured field claims, so the two can't drift.
 */
function checkPassportValidityMatchesText(): void {
  const file = join(DATA_DIR, "entry-requirements.json");
  const rows = JSON.parse(readFileSync(file, "utf8")) as Array<{
    nationality: string;
    destination: string;
    documentsNeeded: string[];
    passportValidity?: { kind: string; amount?: number; unit?: string; from?: string };
  }>;
  const words: Record<number, string> = { 3: "three", 6: "six" };
  for (const r of rows) {
    const pv = r.passportValidity;
    if (!pv) continue;
    const line = r.documentsNeeded.find((d) => /passport|travel document/i.test(d) && /valid|expiry/i.test(d)) ?? "";
    const where = `${rel(file)}: ${r.nationality}→${r.destination} passportValidity`;
    if (pv.kind === "whole_stay") {
      if (!/\b(stay|visit)\b/i.test(line)) errors.push(`${where} says whole_stay but the passport line doesn't: "${line}"`);
      continue;
    }
    const amount = String(pv.amount);
    const hasAmount = new RegExp(`\\b(${amount}|${words[pv.amount ?? 0] ?? amount})[ -]${pv.unit === "days" ? "day" : "month"}`, "i").test(line);
    const anchor = pv.from === "arrival" ? /\b(arrival|entry)\b/i : /\b(departure|stay|leave)\b/i;
    if (!hasAmount || !anchor.test(line)) errors.push(`${where} doesn't match the passport line: "${line}"`);
  }
}

/**
 * `timedSteps` restate documentsNeeded lines tied to the arrival date. Fail if a
 * step's line isn't in the row, or doesn't state that amount and direction.
 */
const TIMED_STEP_PATTERNS: Record<string, (n: string, u: string) => RegExp> = {
  opens_before_arrival: (n, u) =>
    new RegExp(`\\b(within|up to|from|not earlier than)\\b[^.;]*?\\b${n} ${u}\\b before (your flight arrives|you arrive|(the )?arrival)`, "i"),
  due_before_arrival: (n, u) => new RegExp(`\\bat least ${n} ${u} before (your flight arrives|you arrive|(the )?arrival)`, "i"),
  // Registration only ("within 7 days of arrival" can also mean before), and not
  // when the line counts the arrival day itself, which shifts the date by one.
  due_after_arrival: (n, u) => new RegExp(`^(?=.*\\bregist)(?!.*\\bcounted\\b).*\\bwithin ${n} ${u} of arrival\\b`, "i"),
};
function checkTimedStepsMatchText(): void {
  const file = join(DATA_DIR, "entry-requirements.json");
  const rows = JSON.parse(readFileSync(file, "utf8")) as Array<{
    nationality: string;
    destination: string;
    documentsNeeded: string[];
    timedSteps?: Array<{ line: string; window: { kind: string; amount: number; unit: string } }>;
  }>;
  for (const r of rows) {
    for (const step of r.timedSteps ?? []) {
      const where = `${rel(file)}: ${r.nationality}→${r.destination} timedSteps`;
      if (!r.documentsNeeded.includes(step.line)) {
        errors.push(`${where}: line isn't in documentsNeeded: "${step.line}"`);
        continue;
      }
      const unit = step.window.unit === "hours" ? "hours?" : "days?";
      const pattern = TIMED_STEP_PATTERNS[step.window.kind]?.(String(step.window.amount), unit);
      if (!pattern?.test(step.line)) errors.push(`${where} (${step.window.kind}) doesn't match its line: "${step.line}"`);
    }
  }
}

/**
 * A procedure's `leadTimeRule` restates its own `leadTime` wording. Fail if the
 * wording doesn't name the same amount, unit and reference date.
 */
function checkLeadTimeMatchesText(): void {
  const file = join(DATA_DIR, "customs-items.json");
  const rows = JSON.parse(readFileSync(file, "utf8")) as Array<{
    slug: string;
    procedure?: { leadTime?: string; leadTimeRule?: { amount: number; unit: string; before: string } };
  }>;
  const words: Record<number, string> = { 1: "one", 2: "two", 3: "three" };
  const unitWord: Record<string, string> = {
    days: "days?",
    weeks: "weeks?",
    months: "months?",
    working_days: "(working|business) days?",
  };
  for (const r of rows) {
    const rule = r.procedure?.leadTimeRule;
    if (!rule) continue;
    const text = r.procedure?.leadTime ?? "";
    const where = `${rel(file)}: ${r.slug} procedure.leadTimeRule`;
    const amount = `(${rule.amount}|${words[rule.amount] ?? rule.amount})`;
    const hasAmount = new RegExp(`\\b${amount} ${unitWord[rule.unit]}\\b`, "i").test(text);
    const anchor = rule.before === "arrival" ? /\b(arrive|arrival)\b/i : /\b(travel|leave)\b/i;
    if (!hasAmount || !anchor.test(text)) errors.push(`${where} doesn't match the leadTime wording: "${text}"`);
  }
}

/**
 * A customs row's `allowance` restates its own `limits` wording. Fail if an amount
 * (in its unit, or as kg/ml) doesn't appear there, or if the grouping claims more
 * than the wording says: `proportional` needs the wording to allow combining,
 * `total` needs "total"/"combined", and alternatives need an "or".
 */
function checkAllowanceMatchesText(): void {
  const file = join(DATA_DIR, "customs-items.json");
  type Option = { products: string[]; amount: number };
  type Group = { kind: "one_of" | "proportional"; options: Option[] } | { kind: "total"; products: string[]; amount: number };
  const rows = JSON.parse(readFileSync(file, "utf8")) as Array<{
    slug: string;
    limits?: { description: string; quantity?: string };
    allowance?: { groups: Group[] };
  }>;
  const unitOf = (p: string) =>
    ["cigarettes", "cigarillos", "cigars", "heated_tobacco_sticks"].includes(p) ? "pieces" : p === "smoking_tobacco" ? "g" : "l";
  const words: Record<number, string> = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 10: "ten" };
  const num = (n: number) => `(?:${String(n).replace(".", "[.,]")}${words[n] ? `|${words[n]}` : ""})`;
  const patterns = (amount: number, unit: string): RegExp[] => {
    if (unit === "pieces") return [new RegExp(`(?<![\\d.,])${num(amount)}(?![\\d.,]*\\d)`, "i")];
    if (unit === "g")
      return [
        new RegExp(`(?<![\\d.,])${num(amount)}\\s?(g|grams?|grammes?)\\b`, "i"),
        new RegExp(`(?<![\\d.,])${num(amount / 1000)}\\s?(kg|kilograms?)\\b`, "i"),
      ];
    return [
      new RegExp(`(?<![\\d.,])${num(amount)}\\s?(l|litres?|liters?)\\b`, "i"),
      new RegExp(`(?<![\\d.,])${num(Math.round(amount * 1000))}\\s?(ml|millilitres?|milliliters?)\\b`, "i"),
    ];
  };
  for (const r of rows) {
    if (!r.allowance) continue;
    const text = `${r.limits?.quantity ?? ""} ${r.limits?.description ?? ""}`.replace(/(?<=\d),(?=\d{3}\b)/g, "");
    const where = `${rel(file)}: ${r.slug} allowance`;
    for (const g of r.allowance.groups) {
      const amounts =
        g.kind === "total"
          ? [{ amount: g.amount, unit: unitOf(g.products[0]!) }]
          : g.options.map((o) => ({ amount: o.amount, unit: unitOf(o.products[0]!) }));
      for (const { amount, unit } of amounts) {
        if (!patterns(amount, unit).some((re) => re.test(text))) errors.push(`${where}: ${amount} ${unit} isn't in the limits wording`);
      }
      if (g.kind === "proportional" && !/proportion|combin|split|assortment/i.test(text))
        errors.push(`${where}: "proportional" but the wording doesn't say amounts can be combined`);
      if (g.kind === "total" && !/\btotal\b|combined|in all|altogether/i.test(text))
        errors.push(`${where}: "total" but the wording doesn't say the amount is shared`);
      if (g.kind === "one_of" && g.options.length > 1 && !/\bor\b|one of|either/i.test(text))
        errors.push(`${where}: alternatives but the wording has no "or"`);
      const all = g.kind === "total" ? [g.products] : g.options.map((o) => o.products);
      for (const products of all) {
        if (new Set(products.map(unitOf)).size > 1) errors.push(`${where}: an option mixes units (${products.join(", ")})`);
      }
    }
  }
}

/**
 * Published rows rest on official sources only (AGENTS.md §3.2). Fail when a verified
 * row's text leans on secondary material ("commonly reported", "secondary sources",
 * "travel-industry"): such claims belong in data/UNVERIFIED, not in a published note.
 */
function checkNoSecondarySourcing(): void {
  const re = /commonly[- ]reported|commonly cited|secondary (source|sourc|report|press|news)|travel-industry|third-party sources|news reporting/i;
  for (const name of ["customs-items.json", "entry-requirements.json"]) {
    const rows = JSON.parse(readFileSync(join(DATA_DIR, name), "utf8")) as Array<Record<string, unknown>>;
    for (const r of rows) {
      if (r.status !== "verified") continue;
      const text = JSON.stringify([r.summary, r.limits, r.notes, r.documentsNeeded]);
      const m = text.match(re);
      if (m) {
        const id = (r.slug as string) ?? `${r.nationality}→${r.destination}`;
        errors.push(`data/${name}: ${id} cites secondary material ("${m[0]}"); keep only what an official source states`);
      }
    }
  }
}

/**
 * Rows that announce a future change ("takes effect from 1 October 2026") go stale
 * the day it happens. Warn (not fail) once such a date has passed, so the row is
 * re-checked against its source.
 */
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function warnPassedAnnouncements(): void {
  const today = new Date().toISOString().slice(0, 10);
  const re = /\b(take|takes|will take|comes? into|will come into|will start|starts|will apply|will end|will be replaced)\b[^.]{0,40}?\b(\d{1,2}) (january|february|march|april|may|june|july|august|september|october|november|december) (\d{4})/gi;
  for (const name of ["customs-items.json", "entry-requirements.json"]) {
    const rows = JSON.parse(readFileSync(join(DATA_DIR, name), "utf8")) as Array<Record<string, unknown>>;
    for (const r of rows) {
      if (r.status !== "verified") continue;
      const text = JSON.stringify([r.summary, r.limits, r.notes, r.documentsNeeded]);
      for (const m of text.matchAll(re)) {
        const date = `${m[4]}-${String(MONTHS.indexOf(m[3]!.toLowerCase()) + 1).padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
        if (date < today) {
          const id = (r.slug as string) ?? `${r.nationality}→${r.destination}`;
          console.warn(`⚠ ${name}: ${id} announces a change on ${date}, which has passed: "${m[0]}" — re-check the source.`);
        }
      }
    }
  }
}

/**
 * A row's `names` decide which searches it answers. A specific product in `names`
 * that the row's own text never mentions (a firearms rule answering "knife", a meat
 * rule answering "cheese", a narcotics ban answering "cbd") gives a confident answer
 * the source didn't make. Warn so the name is removed or the text sourced (2026-10-26).
 */
const SPECIFIC_NAMES: Record<string, RegExp> = {
  knife: /knife|knives|blade|dagger|sword/, knives: /knife|knives|blade|dagger/,
  "stun gun": /stun|electr|shock|taser/, taser: /taser|stun|electr|shock/,
  "pepper spray": /pepper|spray|gas|irritant/, airsoft: /airsoft|air gun|air-gun|pneumatic/,
  "air rifle": /air rifle|air gun|air-gun|pneumatic/, nunchaku: /nunchak/,
  cbd: /cbd|cannabidiol/, "cbd oil": /cbd|cannabidiol/, cannabidiol: /cbd|cannabidiol/,
  "heated tobacco": /heat/, iqos: /iqos|heat/, "nicotine pouches": /pouch/, snus: /snus|pouch/,
  "shisha tobacco": /shisha|hookah|molasses|water pipe/,
  cheese: /chees|dairy|milk/, milk: /milk|dairy/, eggs: /\begg/, seeds: /seed/,
  flowers: /flower/, soil: /soil/, nuts: /\bnut/, gold: /gold/,
};
function warnUnsupportedNames(): void {
  const file = join(DATA_DIR, "customs-items.json");
  const rows = JSON.parse(readFileSync(file, "utf8")) as Array<Record<string, unknown>>;
  for (const r of rows) {
    if (r.status !== "verified") continue;
    const text = JSON.stringify([r.limits, r.notes, r.summary, r._sources, r.procedure]).toLowerCase();
    for (const n of (r.names as string[]) ?? []) {
      const re = SPECIFIC_NAMES[n.toLowerCase()];
      if (re && !re.test(text)) console.warn(`⚠ ${rel(file)}: ${r.slug} answers searches for "${n}", which its text never mentions.`);
    }
  }
}

// --- run ---
const productionFiles = jsonFilesIn(DATA_DIR);
const unverifiedFiles = jsonFilesIn(UNVERIFIED_DIR);

for (const f of productionFiles) validateFile(f, true);
for (const f of unverifiedFiles) validateFile(f, false);
checkNoUnverifiedReferences();
checkPassportValidityMatchesText();
checkLeadTimeMatchesText();
checkAllowanceMatchesText();
checkNoSecondarySourcing();
checkTimedStepsMatchText();
warnPassedAnnouncements();
warnUnsupportedNames();

console.log(
  `Checked ${productionFiles.length} production data file(s), ${unverifiedFiles.length} UNVERIFIED draft(s).`,
);
if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("✔ Data validation passed.");
