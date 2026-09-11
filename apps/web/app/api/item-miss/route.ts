import { NextResponse } from "next/server";

/**
 * Logs a "bringing X?" search that found no verified customs-item match, so
 * real demand (not guesswork) drives which niche items get researched next.
 *
 * Deliberately narrow: only the item text and destination code, never
 * nationality, dates, or anything else — this stays consistent with the
 * site's "nothing stored on our servers" promise, since customs items are
 * destination-only facts (not tied to who's asking), and this is anonymous
 * product-analytics, not trip data.
 *
 * No database is wired in yet (AGENTS.md §5.8, Phase 2) — structured console
 * logging is durable enough to review via the hosting platform's log viewer
 * today, at zero added cost or infrastructure, and this is a one-line swap
 * for a real table once one exists.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { query, destination } = body as Record<string, unknown>;
  if (typeof query !== "string" || typeof destination !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const cleanQuery = query.trim().slice(0, 100);
  const cleanDestination = destination.trim().toUpperCase().slice(0, 10);
  if (!cleanQuery || !cleanDestination) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  console.log(
    JSON.stringify({
      event: "item_miss",
      query: cleanQuery,
      destination: cleanDestination,
      at: new Date().toISOString(),
    }),
  );

  return NextResponse.json({ ok: true });
}
