import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../lib/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Odyssway blog — travel rules that just changed";

export default function Image() {
  return ogCard({ eyebrow: "Blog", title: "The travel rules that just changed", sub: "Visa-free cuts, travel authorisations, medicine at the border — each fact checked against official sources." });
}
