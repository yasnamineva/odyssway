import type { CustomsItemCategory } from "@odyssway/engine";

/**
 * §7 `/bring/[item]` — generalizes customs-items.json (already-verified data,
 * no new research) into standalone per-category SEO landing pages. Slugs are
 * hand-picked for search phrasing ("cannabis" over the schema's cbd_cannabis,
 * "e-cigarettes" over e_cigarettes) rather than a mechanical enum-to-kebab
 * conversion. "other" is intentionally excluded — it isn't a coherent
 * single search-intent keyword, so a page for it would be thin content.
 */
export const BRING_CATEGORIES: Record<
  Exclude<CustomsItemCategory, "other">,
  { slug: string; label: string; searchLabel: string }
> = {
  alcohol: { slug: "alcohol", label: "Alcohol", searchLabel: "alcohol" },
  tobacco: { slug: "tobacco", label: "Tobacco & Cigarettes", searchLabel: "tobacco or cigarettes" },
  cash: { slug: "cash", label: "Cash & Currency", searchLabel: "cash" },
  medication: { slug: "medication", label: "Medication", searchLabel: "medication" },
  cbd_cannabis: { slug: "cannabis", label: "Cannabis & CBD", searchLabel: "cannabis or CBD" },
  food_animal: { slug: "meat-and-dairy", label: "Meat & Dairy", searchLabel: "meat or dairy products" },
  food_plant: { slug: "fresh-produce", label: "Fresh Produce", searchLabel: "fresh fruit or produce" },
  e_cigarettes: { slug: "e-cigarettes", label: "E-Cigarettes & Vapes", searchLabel: "e-cigarettes or vapes" },
  weapons: { slug: "weapons", label: "Weapons", searchLabel: "a weapon" },
  drones: { slug: "drones", label: "Drones", searchLabel: "a drone" },
};

export type BringCategory = keyof typeof BRING_CATEGORIES;

export function bringCategoryBySlug(slug: string): BringCategory | undefined {
  const entry = (Object.entries(BRING_CATEGORIES) as Array<[BringCategory, { slug: string }]>).find(
    ([, v]) => v.slug === slug,
  );
  return entry?.[0];
}
