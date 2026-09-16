import { NextResponse } from "next/server";
import { resolveTripCheck } from "../../../../lib/trip-check";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Public, read-only API over the same engine that powers Trip Check itself —
 * the data-licensing/distribution angle of the verified corpus (AGENTS.md
 * §14): other travel sites can embed a real, cited compliance answer
 * instead of building their own research pipeline. No auth, no accounts, no
 * request logging beyond normal server logs — consistent with the site's
 * own "nothing stored on our servers" promise. See /developers for usage
 * notes and the (unenforced but requested) attribution ask.
 *
 * GET /api/v1/trip-check?nationality=US&destination=GB&items=alcohol,laptop
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const nationality = searchParams.get("nationality");
  const destination = searchParams.get("destination");
  const itemsParam = searchParams.get("items") ?? "";

  if (!nationality || !destination) {
    return NextResponse.json(
      {
        error: "Missing required query parameters: nationality, destination.",
        example: "/api/v1/trip-check?nationality=US&destination=GB&items=alcohol",
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const items = itemsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20); // generous but bounded — this is a lookup API, not a bulk-import one

  const result = resolveTripCheck(nationality, destination, items);

  return NextResponse.json(
    {
      ...result,
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
