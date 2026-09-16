import { NextResponse } from "next/server";
import { destinations } from "../../../../lib/destinations";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** GET /api/v1/destinations — every verified destination, with its citation. */
export async function GET(): Promise<NextResponse> {
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
        "Free to use with attribution (a visible link back to odyssway.com). See /developers.",
    },
    { headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=3600" } },
  );
}

export function OPTIONS(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
