import { ImageResponse } from "next/og";
import { OgCard } from "../../lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Blog"
        title="Regulation changes, explained and cited"
        sub="What actually changed in travel rules — every claim traced to the official source and the date we checked it."
        accent="#34d399"
      />
    ),
    { ...size },
  );
}
