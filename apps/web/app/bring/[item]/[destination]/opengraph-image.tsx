import { getTranslations } from "next-intl/server";
import { BRING_CATEGORIES } from "../../../../lib/bring-categories";
import { bringPair, bringPairs } from "../../../../lib/bring-pages";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../../../lib/og-card";
import { seoVerdictKey } from "../../../../lib/seo-text";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Can you bring this to this country? The answer, from the official source";

/** Prerendered at build (the card reads fonts from disk), one per answer page. */
export function generateStaticParams() {
  return bringPairs.map((p) => ({ item: p.itemSlug, destination: p.destinationSlug }));
}

export default async function Image({ params }: { params: Promise<{ item: string; destination: string }> }) {
  const { item, destination } = await params;
  const pair = bringPair(item, destination)!;
  const ts = await getTranslations("seo");
  const single = pair.rows.length === 1 ? pair.rows[0]! : undefined;
  const answer = single ? ts(`verdict.${seoVerdictKey(single)}`) : `${pair.rows.length} rules, depending on the item`;
  return ogCard({
    eyebrow: "Can you bring it?",
    title: `${BRING_CATEGORIES[pair.category].label} to ${pair.destination.name}`,
    sub: `${answer}.${pair.lastVerified ? ` Checked against the official source on ${pair.lastVerified}.` : ""}`,
  });
}
