import { ImageResponse } from "next/og";
import { OgCard } from "../../lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Trip Check"
        title="Where are you from, and where are you going?"
        sub="Entry rules, stay limits, required documents, and customs — for one specific trip."
        accent="#60a5fa"
      />
    ),
    { ...size },
  );
}
