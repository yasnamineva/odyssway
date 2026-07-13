/**
 * Freshness / change-detection (AGENTS.md §11): fetch the configured official
 * sources, hash their content, diff against stored hashes, and write a review
 * report to data/UNVERIFIED/source-changes-{date}.md when something changed.
 *
 * Run weekly via GitHub Action (.github/workflows/watch-sources.yml) or
 * manually: pnpm watch:sources
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface WatchedSource {
  id: string;
  url: string;
  usedBy: string;
}

/** Official URLs whose changes require human review. Extend as data/ees.json grows. */
const SOURCES: WatchedSource[] = [
  {
    id: "ec-short-stay-calculator-manual",
    url: "https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf",
    usedBy: "engine rules + golden test fixtures",
  },
  {
    id: "ec-short-stay-calculator-page",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en",
    usedBy: "engine rules, /rules/90-180-rule",
  },
  {
    id: "eu-ees-hub",
    url: "https://travel-europe.europa.eu/ees_en",
    usedBy: "/ees pages (verify URL is still canonical)",
  },
  {
    id: "eu-etias-hub",
    url: "https://travel-europe.europa.eu/etias_en",
    usedBy: "data/etias.json, /etias/status (verify URL is still canonical)",
  },
  {
    id: "ec-ees-policy-page",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/smart-borders/entry-exit-system_en",
    usedBy: "/ees and /ees/what-to-expect content (rollout dates, data collected)",
  },
  {
    id: "ec-schengen-area-page",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/schengen-area_en",
    usedBy: "data/countries.json (membership list, Cyprus status)",
  },
  {
    id: "eeas-visa-free-etias",
    url: "https://www.eeas.europa.eu/eeas/coming-visa-free-country-and-travelling-europe_en",
    usedBy: "data/etias.json (launch window, validity, 30-country scope; fee figure on this page is stale — EUR 20 per Delegated Regulation (EU) 2025/1411)",
  },
];

const ROOT = join(import.meta.dirname, "..");
const HASHES_FILE = join(ROOT, "data", "source-hashes.json");
const REPORT_DIR = join(ROOT, "data", "UNVERIFIED");

function loadHashes(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(HASHES_FILE, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

async function fetchHash(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "borderline-source-watch/0.1 (change detection for compliance data)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  return createHash("sha256").update(body).digest("hex");
}

const today = new Date().toISOString().slice(0, 10);
const previous = loadHashes();
const next: Record<string, string> = { ...previous };
const changes: string[] = [];
const failures: string[] = [];

for (const source of SOURCES) {
  try {
    const hash = await fetchHash(source.url);
    const old = previous[source.id];
    if (old === undefined) {
      changes.push(`- **${source.id}** — first snapshot recorded (no baseline to diff).`);
    } else if (old !== hash) {
      changes.push(
        `- **${source.id}** — CONTENT CHANGED. Review ${source.url} and re-verify: ${source.usedBy}.`,
      );
    }
    next[source.id] = hash;
  } catch (e) {
    failures.push(`- **${source.id}** — fetch failed (${(e as Error).message}): ${source.url}`);
  }
}

writeFileSync(HASHES_FILE, `${JSON.stringify(next, null, 2)}\n`);

if (changes.length > 0 || failures.length > 0) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const report = [
    `# Source changes — ${today}`,
    "",
    "Official sources changed (or could not be checked). A human must review",
    "each item, update the affected data, and bump `verified_at`.",
    "",
    ...(changes.length > 0 ? ["## Changed", "", ...changes, ""] : []),
    ...(failures.length > 0 ? ["## Fetch failures (URL moved? blocked?)", "", ...failures, ""] : []),
  ].join("\n");
  const reportPath = join(REPORT_DIR, `source-changes-${today}.md`);
  writeFileSync(reportPath, report);
  console.log(`Wrote ${reportPath}`);
  console.log(report);
} else {
  console.log("No source changes detected.");
}
