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

/** Production rule-data files (bookkeeping files like source-hashes are not rules). */
const DATA_FILES = [
  "data/countries.json",
  "data/etias.json",
  "data/nationality-rules.json",
  "data/ees.json",
];

interface ChangelogEntry {
  commit: string;
  date: string; // commit date, YYYY-MM-DD
  dataset: string; // file name without .json
  summary: string; // commit subject = what changed / why
  verified_at: string | null;
  verified_by: string | null;
  source: { name: string; url: string } | null;
}

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
}

function extractStamp(json: string): Pick<ChangelogEntry, "verified_at" | "verified_by" | "source"> {
  try {
    const parsed = JSON.parse(json) as unknown;
    // Array files carry the stamp per row; envelope files at the top level.
    const carrier = (Array.isArray(parsed) ? parsed[0] : parsed) as {
      verified_at?: string | null;
      verified_by?: string | null;
      legal_source?: { name: string; url: string };
    } | undefined;
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
      entries.push({
        commit,
        date,
        dataset: file.replace("data/", "").replace(".json", ""),
        summary,
        ...stamp,
      });
    }
  }
  // git log is already newest-first; keep it that way.
  return entries;
}

try {
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
