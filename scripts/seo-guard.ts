/**
 * Pre-push SEO guard: run before every push to main. It blocks a deploy that could
 * erase our search visibility (AGENTS.md §0, "Search safety").
 *
 * Why it exists: on 2–8 Nov 2026 about 3,800 templated pages went live in a week
 * (passport pages, brand × country medicine pages, machine-translated German pages) and
 * Google impressions fell from ~1,000 a day to almost none. Nothing in CI noticed.
 *
 * It compares the local production build (served by `next start`) with the live site and
 * the latest Search Console export, and fails when:
 *   1. the build adds more indexable URLs than the budget (default: 25, or 2% of live);
 *   2. a page that earned impressions in the latest export and is in the live sitemap stops
 *      being indexable on the build (not 200, noindex, canonical elsewhere, or out of the sitemap), unless it's
 *      listed with a reason in scripts/seo-guard-allow.txt;
 *   3. robots.txt blocks crawling, or the home page carries noindex;
 *   4. a sitemap URL on the build isn't 200, carries noindex, or canonicalises elsewhere
 *      (all new URLs plus a sample of the rest);
 *   5. a new URL's main text is over 85% the same as an existing page of the same kind.
 *
 *   pnpm build && pnpm seo:guard                 # starts `next start` on :4322 itself
 *   pnpm seo:guard -- --base http://localhost:4321   # use a running server
 *   SEO_GUARD_MAX_ADDED=400 pnpm seo:guard        # larger batch, only with the owner's OK
 */
import { spawn, type ChildProcess } from "node:child_process";
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE = "https://odyssway.com";
const SAMPLE = 300;
const DUPLICATE_LIMIT = 0.85;

type Check = { ok: boolean; problems: string[] };

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
}

async function get(url: string): Promise<{ status: number; text: string; headers: Headers }> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": "odyssway-seo-guard" } });
      return { status: res.status, text: res.status === 200 ? await res.text() : "", headers: res.headers };
    } catch (e) {
      if (attempt >= 2) throw e;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

function sitemapPaths(xml: string): Set<string> {
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname.replace(/\/$/, "") || "/"));
}

/** Newest Search Console "Pages.csv" under seo/gsc (export folders end in a date). */
function latestGscPages(): { file: string; pages: Map<string, number> } | null {
  const found: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (e === "Pages.csv" && /Performance/.test(p)) found.push(p);
    }
  };
  walk(join(ROOT, "seo", "gsc"));
  if (found.length === 0) return null;
  const dated = (p: string) => p.match(/(\d{4}-\d{2}-\d{2})[^/]*\/Pages\.csv$/)?.[1] ?? "";
  const file = found.sort((a, b) => dated(a).localeCompare(dated(b))).at(-1)!;
  const pages = new Map<string, number>();
  for (const line of readFileSync(file, "utf8").split("\n").slice(1)) {
    const [url, , impressions] = line.split(",");
    if (!url || !impressions || Number(impressions) <= 0) continue;
    pages.set(new URL(url).pathname.replace(/\/$/, "") || "/", Number(impressions));
  }
  return { file, pages };
}

function allowList(): Map<string, string> {
  const file = join(ROOT, "scripts", "seo-guard-allow.txt");
  const m = new Map<string, string>();
  if (!existsSync(file)) return m;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const [path, ...reason] = t.split(/\s+/);
    if (reason.length === 0) throw new Error(`seo-guard-allow.txt: "${path}" needs a reason`);
    m.set(path!, reason.join(" "));
  }
  return m;
}

/** Indexability of one page on the build. */
function pageProblems(path: string, res: { status: number; text: string; headers: Headers }): string[] {
  const out: string[] = [];
  if (res.status !== 200) return [`${path}: HTTP ${res.status}${res.headers.get("location") ? ` → ${res.headers.get("location")}` : ""}`];
  if (/noindex/i.test(res.headers.get("x-robots-tag") ?? "")) out.push(`${path}: X-Robots-Tag noindex`);
  const robots = res.text.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? "";
  if (/noindex/i.test(robots)) out.push(`${path}: meta robots "${robots}"`);
  const canonical = res.text.match(/<link rel="canonical" href="([^"]*)"/i)?.[1];
  if (!canonical) out.push(`${path}: no canonical`);
  else if ((new URL(canonical, LIVE).pathname.replace(/\/$/, "") || "/") !== path) out.push(`${path}: canonical → ${canonical}`);
  return out;
}

function mainText(html: string): string[] {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  return main
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);
}

/** Share of a's text (by characters) whose lines also appear in b. */
function overlap(a: string[], b: string[]): number {
  const bs = new Set(b);
  const total = a.reduce((n, l) => n + l.length, 0);
  return total === 0 ? 0 : a.filter((l) => bs.has(l)).reduce((n, l) => n + l.length, 0) / total;
}

async function startServer(): Promise<{ base: string; proc: ChildProcess }> {
  const web = join(ROOT, "apps", "web");
  const buildId = join(web, ".next", "BUILD_ID");
  if (!existsSync(buildId)) throw new Error("No production build: run `pnpm build` first.");
  const headTime = Number(execSync("git log -1 --format=%ct", { cwd: ROOT }).toString().trim()) * 1000;
  if (statSync(buildId).mtimeMs < headTime)
    throw new Error("The build is older than the last commit: run `pnpm build` so the guard checks what you're pushing.");
  const port = 4322;
  const proc = spawn("npx", ["next", "start", "-p", String(port)], { cwd: web, stdio: "ignore" });
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(base)).ok) return { base, proc };
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  proc.kill();
  throw new Error("next start didn't come up on :4322");
}

async function inBatches<T>(items: T[], size: number, fn: (t: T) => Promise<void>): Promise<void> {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn));
}

async function main(): Promise<void> {
  let base = arg("--base");
  let proc: ChildProcess | undefined;
  if (!base) ({ base, proc } = await startServer());
  const check: Check = { ok: true, problems: [] };
  const fail = (msg: string) => {
    check.ok = false;
    check.problems.push(msg);
  };
  try {
    // 1. URL budget.
    const live = sitemapPaths((await get(`${LIVE}/sitemap.xml`)).text);
    const local = sitemapPaths((await get(`${base}/sitemap.xml`)).text);
    if (local.size === 0) fail("The build's sitemap is empty.");
    const added = [...local].filter((p) => !live.has(p));
    const removed = [...live].filter((p) => !local.has(p));
    const budget = Number(process.env.SEO_GUARD_MAX_ADDED ?? Math.max(25, Math.round(live.size * 0.02)));
    console.log(`Sitemap: live ${live.size}, build ${local.size} (+${added.length}, -${removed.length}); budget +${budget}.`);
    if (added.length > budget)
      fail(
        `${added.length} new indexable URLs (budget ${budget}), e.g. ${added.slice(0, 5).join(", ")}. ` +
          "Ship new page types in small batches and check the next Search Console export; a bigger batch needs the owner's OK (SEO_GUARD_MAX_ADDED).",
      );

    // 2. Pages that earn impressions must stay indexable.
    const gsc = latestGscPages();
    const allow = allowList();
    if (!gsc) fail("No Search Console export under seo/gsc: add the latest Performance export before pushing.");
    else {
      const age = (Date.now() - statSync(gsc.file).mtimeMs) / 86_400_000;
      console.log(`Search Console export: ${gsc.file.replace(ROOT + "/", "")} (${gsc.pages.size} pages with impressions, ${age.toFixed(0)} days old).`);
      if (age > 14) console.log("  ⚠ The export is over two weeks old; ask the owner for a fresh one.");
      // Only pages indexable on the live site now: an old redirect is already priced in.
      const earning = [...gsc.pages.keys()].filter((p) => live.has(p) && !allow.has(p));
      await inBatches(earning, 16, async (path) => {
        const res = await get(`${base}${path}`);
        const problems = pageProblems(path, res);
        if (problems.length === 0 && !local.has(path) && path !== "/") problems.push(`${path}: missing from the sitemap`);
        for (const p of problems) fail(`Earning page (${gsc.pages.get(path)} impressions) would lose search: ${p}`);
      });
    }

    // 3. Site-wide blockers.
    const robots = (await get(`${base}/robots.txt`)).text;
    if (/^Disallow:\s*\/\s*$/im.test(robots)) fail("robots.txt disallows the whole site.");
    for (const p of pageProblems("/", await get(`${base}/`))) fail(`Home page: ${p}`);

    // 4. Sitemap URLs are indexable (all new ones, a sample of the rest).
    const rest = [...local].filter((p) => live.has(p));
    const sample = [...added, ...rest.sort(() => Math.random() - 0.5).slice(0, SAMPLE)];
    const texts = new Map<string, string[]>();
    await inBatches(sample, 16, async (path) => {
      const res = await get(`${base}${path}`);
      for (const p of pageProblems(path, res)) fail(`Sitemap URL not indexable: ${p}`);
      texts.set(path, mainText(res.text));
    });

    // 5. New pages must not be near-copies of an existing page of the same kind.
    const kind = (p: string) => p.split("/").slice(0, 2).join("/") + `/${p.split("/").length}`;
    for (const path of added.slice(0, 60)) {
      const mine = texts.get(path) ?? [];
      const siblings = rest.filter((p) => kind(p) === kind(path)).slice(0, 8);
      for (const s of siblings) {
        if (!texts.has(s)) texts.set(s, mainText((await get(`${base}${s}`)).text));
        const o = overlap(mine, texts.get(s)!);
        if (o > DUPLICATE_LIMIT) {
          fail(`New page ${path} is ${(o * 100).toFixed(0)}% the same text as ${s}: give it its own substance or noindex it.`);
          break;
        }
      }
    }
  } finally {
    proc?.kill();
  }
  if (check.ok) {
    console.log("✔ SEO guard passed.");
    return;
  }
  console.error(`✘ SEO guard failed (${check.problems.length}):`);
  for (const p of check.problems.slice(0, 60)) console.error(`  - ${p}`);
  if (check.problems.length > 60) console.error(`  … and ${check.problems.length - 60} more`);
  process.exit(1);
}

main().catch((e) => {
  console.error(`✘ SEO guard error: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
