/**
 * Verification changelog generator (AGENTS.md §7 `/changelog`, §11).
 *
 * Derives a public, chronological log of every rule-data change from the git
 * history of the production data files — never hand-maintained. For each
 * commit touching a data file it records what changed (commit subject), when,
 * and the file's legal source + verification stamp AT THAT COMMIT.
 *
 * Output: data/changelog.json (committed, so builds without full git history
 * — e.g. shallow CI clones — still have it). Runs automatically as part of
 * `pnpm build` at the repo root; if git is unavailable the existing committed
 * file is kept.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUTPUT = join(ROOT, "data", "changelog.json");
/** When each destination first appeared in destinations.json — feeds the homepage "Recently added". */
const HISTORY_OUTPUT = join(ROOT, "data", "destination-history.json");

/** Production rule-data files (bookkeeping files like source-hashes are not rules). */
const DATA_FILES = [
  "data/countries.json",
  "data/etias.json",
  "data/nationality-rules.json",
  "data/ees.json",
  "data/destinations.json",
  "data/entry-requirements.json",
  "data/customs-items.json",
  "data/overstay-penalties.json",
  "data/trip-charges.json",
];

interface ChangelogEntry {
  commit: string;
  date: string; // commit date, YYYY-MM-DD
  dataset: string; // file name without .json
  summary: string; // commit subject = what changed / why
  verified_at: string | null;
  verified_by: string | null;
  source: { name: string; url: string } | null;
  /** Destination codes whose rows this commit added, changed or removed in this file ("EU" = harmonised EU customs). */
  destinations?: string[];
}

/** Files whose rows map to a destination, and how to key and locate each row. */
const ROW_KEYS: Record<string, { key: (r: Record<string, unknown>) => string; dest: (r: Record<string, unknown>) => string }> = {
  "data/entry-requirements.json": { key: (r) => `${r.nationality}>${r.destination}`, dest: (r) => String(r.destination) },
  "data/customs-items.json": { key: (r) => String(r.slug), dest: (r) => String(r.destination) },
  "data/destinations.json": { key: (r) => String(r.code), dest: (r) => String(r.code) },
  "data/trip-charges.json": { key: (r) => String(r.id), dest: (r) => String(r.destination) },
};

const parsedByBlob = new Map<string, Map<string, { dest: string; json: string }>>();

/** Rows of a file at a commit, keyed; cached by blob id so unchanged versions are parsed once. */
function rowsAt(commit: string, file: string): Map<string, { dest: string; json: string }> {
  let blob: string;
  try {
    blob = git(["rev-parse", `${commit}:${file}`]).trim();
  } catch {
    return new Map(); // file didn't exist at that commit
  }
  const cached = parsedByBlob.get(blob);
  if (cached) return cached;
  const spec = ROW_KEYS[file]!;
  const out = new Map<string, { dest: string; json: string }>();
  try {
    for (const r of JSON.parse(git(["cat-file", "blob", blob])) as Record<string, unknown>[]) {
      out.set(spec.key(r), { dest: spec.dest(r), json: JSON.stringify(r) });
    }
  } catch {
    // unparsable historical version: report no destinations rather than guess
  }
  parsedByBlob.set(blob, out);
  return out;
}

function changedDestinations(commit: string, file: string): string[] | undefined {
  if (!ROW_KEYS[file]) return undefined;
  const before = rowsAt(`${commit}^`, file);
  const after = rowsAt(commit, file);
  const dests = new Set<string>();
  for (const [k, v] of after) if (before.get(k)?.json !== v.json) dests.add(v.dest);
  for (const [k, v] of before) if (!after.has(k)) dests.add(v.dest);
  return [...dests].sort();
}

function git(args: string[]): string {
  // Data files are several MB; the default 1 MB output buffer would fail silently.
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function extractStamp(json: string): Pick<ChangelogEntry, "verified_at" | "verified_by" | "source"> {
  try {
    const parsed = JSON.parse(json) as unknown;
    // Array files carry the stamp per row — use the most recently verified
    // row (the first row is arbitrary and often months stale); envelope
    // files carry it at the top level.
    type Stamped = {
      verified_at?: string | null;
      verified_by?: string | null;
      legal_source?: { name: string; url: string };
    };
    const carrier = (
      Array.isArray(parsed)
        ? (parsed as Stamped[]).reduce<Stamped | undefined>(
            (best, row) => ((row.verified_at ?? "") > (best?.verified_at ?? "") ? row : best),
            undefined,
          )
        : parsed
    ) as Stamped | undefined;
    return {
      verified_at: carrier?.verified_at ?? null,
      verified_by: carrier?.verified_by ?? null,
      source: carrier?.legal_source ?? null,
    };
  } catch {
    return { verified_at: null, verified_by: null, source: null };
  }
}

function generate(): ChangelogEntry[] {
  const log = git([
    "log",
    "--format=%H%x09%cs%x09%s",
    "--name-only",
    "--",
    ...DATA_FILES,
  ]);

  const entries: ChangelogEntry[] = [];
  let commit = "";
  let date = "";
  let summary = "";
  for (const line of log.split("\n")) {
    if (line.includes("\t")) {
      [commit = "", date = "", summary = ""] = line.split("\t");
    } else if (DATA_FILES.includes(line.trim())) {
      const file = line.trim();
      let stamp: ReturnType<typeof extractStamp>;
      try {
        stamp = extractStamp(git(["show", `${commit}:${file}`]));
      } catch {
        // File deleted in this commit — record the change without a stamp.
        stamp = { verified_at: null, verified_by: null, source: null };
      }
      const destinations = changedDestinations(commit, file);
      entries.push({
        commit,
        date,
        dataset: file.replace("data/", "").replace(".json", ""),
        summary,
        ...stamp,
        ...(destinations && destinations.length > 0 ? { destinations } : {}),
      });
    }
  }
  // git log is already newest-first; keep it that way.
  return entries;
}

/** First commit date at which each destination code appears in destinations.json. */
function destinationHistory(): Record<string, string> {
  const current = JSON.parse(readFileSync(join(ROOT, "data", "destinations.json"), "utf8")) as Array<{ code: string }>;
  const out: Record<string, string> = {};
  for (const { code } of current) {
    const dates = git(["log", "--reverse", "--format=%cs", "-S", `"code": "${code}"`, "--", "data/destinations.json"])
      .split("\n")
      .filter(Boolean);
    if (dates[0]) out[code] = dates[0];
  }
  return out;
}

try {
  // A shallow clone (Vercel, default CI checkouts) only sees the last few
  // commits: regenerating there would publish a truncated history.
  if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
    throw new Error("shallow clone");
  }
  writeFileSync(HISTORY_OUTPUT, `${JSON.stringify(destinationHistory(), null, 2)}\n`);
  const entries = generate();
  if (entries.length === 0) {
    throw new Error("git produced no entries (shallow clone?)");
  }
  writeFileSync(OUTPUT, `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Wrote ${entries.length} changelog entries to data/changelog.json`);
} catch (e) {
  try {
    readFileSync(OUTPUT, "utf8");
    console.warn(
      `Changelog not regenerated (${(e as Error).message}); keeping the committed data/changelog.json.`,
    );
  } catch {
    console.error("No git history AND no committed changelog — cannot proceed.");
    process.exit(1);
  }
}
