import { NextResponse } from "next/server";
import { customsItems } from "../../../../lib/destinations";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * GET /api/v1/customs-items — verified customs-item rows, optionally
 * filtered by destination and/or category (alcohol, tobacco, cash,
 * medication, cbd_cannabis, food_animal, food_plant, e_cigarettes,
 * weapons, drones, other — same set /bring/[item] uses).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination")?.toUpperCase();
  const category = searchParams.get("category");

  const rows = customsItems
    .filter((i) => i.status === "verified")
    .filter((i) => !destination || i.destination === destination)
    .filter((i) => !category || i.category === category);

  return NextResponse.json(
    {
      count: rows.length,
      items: rows,
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
