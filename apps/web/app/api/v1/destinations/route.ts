import { NextResponse } from "next/server";
import { DATA_API_BUDGET, retryAfterSeconds, withinBudget } from "../../../../lib/rate-limit";
import { destinations } from "../../../../lib/destinations";

/** Data only changes with a deploy, and each deploy starts a fresh CDN cache. */
const CDN_CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** GET /api/v1/destinations — every verified destination, with its citation. */
export async function GET(): Promise<NextResponse> {
  if (!withinBudget("v1-destinations", DATA_API_BUDGET)) {
    return NextResponse.json(
      { error: "Too many requests. Please retry shortly, or cache responses on your side." },
      { status: 429, headers: { ...CORS_HEADERS, "Retry-After": String(retryAfterSeconds("v1-destinations", DATA_API_BUDGET)) } },
    );
  }
  const verified = destinations
    .filter((d) => d.status === "verified")
    .map((d) => ({
      code: d.code,
      name: d.name,
      region: d.region,
      officialAuthorityUrl: d.officialAuthorityUrl,
      legalSource: d.legal_source,
      verifiedAt: d.verified_at,
    }));

  return NextResponse.json(
    {
      count: verified.length,
      destinations: verified,
      source: "https://odyssway.com/sources",
      license:
        "Free to use with attribution (a visible link back to odyssway.com). Terms: https://odyssway.com/terms",
    },
    { headers: { ...CORS_HEADERS, "Cache-Control": CDN_CACHE } },
  );
}

export function OPTIONS(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
