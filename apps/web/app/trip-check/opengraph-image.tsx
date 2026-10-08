import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../lib/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Trip Check — entry rules, stay limits, documents and customs for one trip";

export default function Image() {
  return ogCard({ eyebrow: "Trip Check", title: "Where are you from, and where are you going?", sub: "Entry rules, stay limits, documents and customs for one specific trip." });
}
