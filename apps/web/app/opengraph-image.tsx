import { ImageResponse } from "next/og";
import { OgCard } from "../lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Odyssway — can you go, for how long, and what can you bring?";

/**
 * Generated, not fetched: every OG/share card on this site is rendered
 * server-side at request time, matching the brand exactly (navy, serif
 * headline, cited-sources footer) instead of pulling in external stock
 * photography we'd have no licensing basis to use.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        title="Can you go — and for how long?"
        sub="Free trip-compliance tools, cited to official sources — not a guess."
        accent="#eab308"
      />
    ),
    { ...size },
  );
}
