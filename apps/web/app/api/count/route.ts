import { NextResponse } from "next/server";
import { COUNT_EVENTS, type CountEvent } from "../../../lib/count";

/**
 * Anonymous, cookie-free usage counts (GROWTH_AND_ROADMAP.md §2, item 5): the body
 * is just an event name from a fixed list, and we add 1 to that event's counter
 * for today. No IP, no identifier, nothing the user entered (/privacy, section 3).
 *
 * Counts go to Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set (free tier),
 * otherwise only to the hosting log, which keeps entries for about a day.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let event: unknown;
  try {
    event = ((await request.json()) as { event?: unknown }).event;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof event !== "string" || !(COUNT_EVENTS as readonly string[]).includes(event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const day = new Date().toISOString().slice(0, 10);
  const key = `count:${event as CountEvent}:${day}`;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // Counting must never break the page.
    }
  } else {
    console.log(JSON.stringify({ event: "count", key }));
  }
  return NextResponse.json({ ok: true });
}
