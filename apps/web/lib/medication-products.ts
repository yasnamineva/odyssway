import type { CustomsItemRecord, DestinationRecord } from "@odyssway/engine";
import { customsItems, destinationSlug, destinations } from "./destinations";

/**
 * Named medicines people search for by brand ("can I bring Adderall to
 * Japan"). A product matches a customs row only when that verified row lists
 * the brand name itself in `names` — we never infer coverage from an active
 * ingredient or drug class, so every page says exactly what Trip Check
 * already answers for that search term, nothing more.
 */
export interface MedicationProduct {
  slug: string;
  name: string;
  /** Lowercase search term that must appear verbatim in a row's `names`. */
  term: string;
}

const PRODUCTS: MedicationProduct[] = [
  { slug: "adderall", name: "Adderall", term: "adderall" },
  { slug: "vyvanse", name: "Vyvanse", term: "vyvanse" },
  { slug: "ritalin", name: "Ritalin", term: "ritalin" },
  { slug: "xanax", name: "Xanax", term: "xanax" },
  { slug: "valium", name: "Valium", term: "valium" },
  { slug: "klonopin", name: "Klonopin", term: "klonopin" },
  { slug: "codeine", name: "Codeine", term: "codeine" },
  { slug: "tramadol", name: "Tramadol", term: "tramadol" },
  { slug: "oxycodone", name: "Oxycodone", term: "oxycodone" },
  { slug: "ozempic", name: "Ozempic", term: "ozempic" },
  { slug: "wegovy", name: "Wegovy", term: "wegovy" },
  { slug: "mounjaro", name: "Mounjaro", term: "mounjaro" },
  { slug: "insulin", name: "Insulin", term: "insulin" },
  { slug: "sudafed", name: "Sudafed", term: "sudafed" },
];

export interface ProductPair {
  product: MedicationProduct;
  destination: DestinationRecord;
  destinationSlug: string;
  rows: CustomsItemRecord[];
}

/** Every (product × verified destination) with at least one verified row naming the product. */
export const productPairs: ProductPair[] = (() => {
  const pairs: ProductPair[] = [];
  const verifiedDestinations = destinations
    .filter((d) => d.status === "verified")
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const product of PRODUCTS) {
    for (const destination of verifiedDestinations) {
      const rows = customsItems.filter(
        (r) =>
          r.destination === destination.code &&
          r.status === "verified" &&
          r.names.some((n) => n.toLowerCase() === product.term),
      );
      if (rows.length === 0) continue;
      pairs.push({ product, destination, destinationSlug: destinationSlug(destination.name), rows });
    }
  }
  return pairs;
})();

/** Products with pages: a product hub needs at least two destinations to compare. */
export const medicationProducts: MedicationProduct[] = PRODUCTS.filter(
  (p) => productPairs.filter((pair) => pair.product.slug === p.slug).length >= 2,
);

export function productBySlug(slug: string): MedicationProduct | undefined {
  return medicationProducts.find((p) => p.slug === slug);
}

/** True when the product has a comparison hub page (/medications/[product]). */
export function hasProductHub(slug: string): boolean {
  return medicationProducts.some((p) => p.slug === slug);
}

/** All pairs for a product — including single-country products, which get a
 * pair page (Sudafed → Japan is a real, specific rule) but no hub. */
export function pairsForProduct(slug: string): ProductPair[] {
  return productPairs.filter((p) => p.product.slug === slug);
}

export function productPair(productSlug: string, destSlug: string): ProductPair | undefined {
  return productPairs.find((p) => p.product.slug === productSlug && p.destinationSlug === destSlug);
}

/** Products with a pair page for this destination. */
export function productsForDestination(code: string): MedicationProduct[] {
  return PRODUCTS.filter((p) =>
    productPairs.some((pair) => pair.product.slug === p.slug && pair.destination.code === code),
  );
}

export function latestVerified(rows: CustomsItemRecord[]): string | null {
  const dates = rows.map((r) => r.verified_at).filter((d): d is string => Boolean(d));
  return dates.length > 0 ? dates.sort().at(-1)! : null;
}
