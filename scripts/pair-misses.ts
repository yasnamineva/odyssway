/**
 * Prints the Trip Check searches for passport × destination pairs we don't cover yet
 * (apps/web/app/api/pair-miss), most searched first. Needs UPSTASH_REDIS_REST_URL/TOKEN.
 *
 *   pnpm pair:misses            # this month
 *   pnpm pair:misses 2026-11    # a given month
 */
const month = process.argv[2] ?? new Date().toISOString().slice(0, 7);
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error("Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
  process.exit(1);
}
async function main(): Promise<void> {
  const res = await fetch(`${url!}/hgetall/${encodeURIComponent(`pairmiss:${month}`)}`, {
    headers: { Authorization: `Bearer ${token!}` },
  });
  const { result } = (await res.json()) as { result: string[] | null };
  const pairs: Array<[string, number]> = [];
  for (let i = 0; result && i < result.length; i += 2) pairs.push([result[i]!, Number(result[i + 1])]);
  pairs.sort((a, b) => b[1] - a[1]);
  console.log(`Uncovered pairs searched in ${month}: ${pairs.length}`);
  for (const [pair, n] of pairs) console.log(`${String(n).padStart(5)}  ${pair}`);
}

void main();
