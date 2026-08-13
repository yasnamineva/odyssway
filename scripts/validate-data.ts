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
};

const errors: string[] = [];

function rel(path: string): string {
  return relative(ROOT, path);
}

/** Non-rule bookkeeping files that carry no legal content. */
const NON_RULE_FILES = new Set(["source-hashes.json", "changelog.json"]);

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

// --- run ---
const productionFiles = jsonFilesIn(DATA_DIR);
const unverifiedFiles = jsonFilesIn(UNVERIFIED_DIR);

for (const f of productionFiles) validateFile(f, true);
for (const f of unverifiedFiles) validateFile(f, false);
checkNoUnverifiedReferences();

console.log(
  `Checked ${productionFiles.length} production data file(s), ${unverifiedFiles.length} UNVERIFIED draft(s).`,
);
if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("✔ Data validation passed.");
