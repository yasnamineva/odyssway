import { ImageResponse } from "next/og";
import { OgCard } from "../../lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Schengen Calculator"
        title="The 90/180-day rule, computed exactly"
        sub="Multiple trips, residence-permit exclusions, dual citizenship — a day-by-day timeline that matches the EU's own methodology."
        accent="#eab308"
      />
    ),
    { ...size },
  );
}
