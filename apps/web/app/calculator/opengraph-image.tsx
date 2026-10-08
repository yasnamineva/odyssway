import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../lib/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Schengen 90/180-day calculator";

export default function Image() {
  return ogCard({ eyebrow: "Schengen calculator", title: "The 90/180-day rule, counted exactly", sub: "Several trips, residence permits, dual citizenship — matched to the EU's own method." });
}
