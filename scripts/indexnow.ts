/**
 * IndexNow: tell Bing (and the other IndexNow engines — Yandex, Seznam, Naver)
 * which URLs exist or changed, instead of waiting for them to crawl the sitemap.
 *
 * The key is public by design: IndexNow proves site ownership by checking that
 * https://{host}/{key}.txt serves the key, so the key file lives in
 * apps/web/public/ and must be deployed before the first submission.
 *
 * Reads the LIVE sitemap, so it submits exactly what production serves:
 *   pnpm indexnow                     # every sitemap URL (first run)
 *   pnpm indexnow -- --since 2026-10-10   # only URLs whose <lastmod> ≥ date
 *   pnpm indexnow -- /calculator /etias/status   # specific paths
 *   pnpm indexnow -- --dry-run        # print, don't submit
 *
 * Submit only new or changed URLs after the first run — resubmitting unchanged
 * URLs repeatedly is against the protocol's guidance and can get a key ignored.
 */

const KEY = "3608ef3e0be1ef2c49cf87293ca3719b";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://odyssway.com").replace(/\/$/, "");
const ENDPOINT = "https://api.indexnow.org/indexnow";
/** Protocol limit per POST. */
const BATCH_SIZE = 10_000;

interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

async function fetchSitemap(): Promise<SitemapEntry[]> {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => ({
    loc: /<loc>(.*?)<\/loc>/.exec(block)?.[1] ?? "",
    lastmod: /<lastmod>(.*?)<\/lastmod>/.exec(block)?.[1],
  })).filter((e) => e.loc);
}

async function assertKeyFileLive(): Promise<void> {
  const res = await fetch(`${SITE_URL}/${KEY}.txt`);
  const body = res.ok ? (await res.text()).trim() : "";
  if (body !== KEY) {
    throw new Error(`${SITE_URL}/${KEY}.txt does not serve the key — deploy apps/web/public/${KEY}.txt first.`);
  }
}

async function submit(urls: string[]): Promise<void> {
  const host = new URL(SITE_URL).host;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const urlList = urls.slice(i, i + BATCH_SIZE);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
    });
    // 200 = accepted, 202 = accepted but key validation pending (normal on first use).
    if (res.status !== 200 && res.status !== 202) {
      throw new Error(`IndexNow returned ${res.status}: ${await res.text()}`);
    }
    console.log(`Submitted ${urlList.length} URLs (HTTP ${res.status}).`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const dryRun = args.includes("--dry-run");
  const sinceIdx = args.indexOf("--since");
  const since = sinceIdx >= 0 ? args[sinceIdx + 1] : undefined;
  if (sinceIdx >= 0 && !/^\d{4}-\d{2}-\d{2}$/.test(since ?? "")) {
    throw new Error("--since needs a date: --since YYYY-MM-DD");
  }
  const paths = args.filter((a) => a.startsWith("/"));

  let urls: string[];
  if (paths.length > 0) {
    urls = paths.map((p) => `${SITE_URL}${p}`);
  } else {
    const entries = await fetchSitemap();
    // ISO dates compare correctly as strings; lastmod may carry a time part.
    urls = entries.filter((e) => !since || (e.lastmod ?? "").slice(0, 10) >= since).map((e) => e.loc);
  }

  if (urls.length === 0) {
    console.log("Nothing to submit.");
    return;
  }
  if (dryRun) {
    console.log(urls.join("\n"));
    console.log(`\n${urls.length} URLs (dry run, nothing submitted).`);
    return;
  }
  await assertKeyFileLive();
  await submit(urls);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
