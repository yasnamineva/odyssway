import { getTranslations } from "next-intl/server";
import { productPair, productPairs } from "../../../../lib/medication-products";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../../../lib/og-card";
import { seoVerdictKey } from "../../../../lib/seo-text";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Can you bring this medicine to this country? The answer, from the official source";

/** Prerendered at build (the card reads fonts from disk), one per answer page. */
export function generateStaticParams() {
  return productPairs.map((p) => ({ product: p.product.slug, destination: p.destinationSlug }));
}

export default async function Image({ params }: { params: Promise<{ product: string; destination: string }> }) {
  const { product, destination } = await params;
  const pair = productPair(product, destination)!;
  const ts = await getTranslations("seo");
  const single = pair.rows.length === 1 ? pair.rows[0]! : undefined;
  const answer = single ? ts(`verdict.${seoVerdictKey(single)}`) : "It depends on the medicine's form";
  const date = pair.rows.map((r) => r.verified_at ?? "").sort().at(-1);
  return ogCard({
    eyebrow: "Can you bring it?",
    title: `${pair.product.name} to ${pair.destination.name}`,
    sub: `${answer}.${date ? ` Checked against the official source on ${date}.` : ""}`,
  });
}
