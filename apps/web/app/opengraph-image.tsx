import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../lib/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Odyssway — can you go, for how long, and what can you bring?";

export default function Image() {
  return ogCard({ title: "Can you go — and for how long?", sub: "Entry rules, stay limits, documents and customs for your exact trip. Free." });
}
