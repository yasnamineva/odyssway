import deMessages from "../messages/de.json";
import { medicationProducts, productPairs, type MedicationProduct, type ProductPair } from "./medication-products";
export { verdictCounts } from "./medication-products";
import { germanRowsReady } from "./translations";

/**
 * German named-medicine pages (GROWTH_AND_ROADMAP.md §5.5). A pair gets a German page
 * only when every row on its English page has a fresh, complete German translation, the
 * same rule the German "Can I bring it?" pages use; a product hub needs two such pairs,
 * as in English.
 */
export const germanProductPairs: ProductPair[] = productPairs.filter(germanRowsReady);

const germanPairSet = new Set(germanProductPairs);

export const germanProducts: MedicationProduct[] = medicationProducts.filter(
  (p) => germanProductPairs.filter((pair) => pair.product.slug === p.slug).length >= 2,
);

const NAMES = (deMessages.dePages.medications as { productNames: Record<string, string> }).productNames;

/** The German name (Codein, Oxycodon); brand names stay as they are. */
export function germanProductName(p: MedicationProduct): string {
  return NAMES[p.slug] ?? p.name;
}

export function hasGermanProductPage(pair: ProductPair): boolean {
  return germanPairSet.has(pair);
}

export function hasGermanProductHub(slug: string): boolean {
  return germanProducts.some((p) => p.slug === slug);
}

export function germanPairsForProduct(slug: string): ProductPair[] {
  return germanProductPairs.filter((p) => p.product.slug === slug);
}

export function germanProductPair(productSlug: string, destSlug: string): ProductPair | undefined {
  return germanProductPairs.find((p) => p.product.slug === productSlug && p.destinationSlug === destSlug);
}
