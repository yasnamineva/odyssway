import { NextResponse } from "next/server";
import rawNationalities from "../../../../../data/nationality-rules.json";
import { bodySizeOk, COUNTER_BUDGET, retryAfterSeconds, withinBudget } from "../../../lib/rate-limit";

/**
 * Counts Trip Check searches for a passport × destination pair we don't cover yet
 * (owner-approved 2026-11-03; /privacy, section 2), so demand decides which
 * destinations and passports get researched next.
 *
 * The body is two country codes and nothing else. We add 1 to that pair's counter
 * for the current month: no IP, no identifier, no dates, no free text. Counts go to
 * Upstash Redis (one hash per month, field "NAT-DEST") when UPSTASH_REDIS_REST_URL/
 * TOKEN are set, otherwise only to the hosting log, which keeps entries for about a
 * day. Read them with `pnpm pair:misses`.
 */
const NATIONALITIES = new Set((rawNationalities as Array<{ nationality: string }>).map((n) => n.nationality));
const CODE = /^[A-Z]{2}$/;

export async function POST(request: Request): Promise<NextResponse> {
  if (!withinBudget("pair-miss", COUNTER_BUDGET)) {
    return NextResponse.json(
      { ok: false },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds("pair-miss", COUNTER_BUDGET)) } },
    );
  }
  if (!bodySizeOk(request)) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { nationality, destination } = body as Record<string, unknown>;
  if (typeof nationality !== "string" || typeof destination !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const nat = nationality.toUpperCase();
  const dest = destination.toUpperCase();
  if (!NATIONALITIES.has(nat) || !CODE.test(dest) || nat === dest) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const month = new Date().toISOString().slice(0, 7);
  const key = `pairmiss:${month}`;
  const field = `${nat}-${dest}`;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      await fetch(`${url}/hincrby/${encodeURIComponent(key)}/${encodeURIComponent(field)}/1`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // Counting must never break the page.
    }
  } else {
    console.log(JSON.stringify({ event: "pair_miss", key, field }));
  }
  return NextResponse.json({ ok: true });
}
