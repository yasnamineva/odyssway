import { schemas, type DestinationRecord } from "@odyssway/engine";
import rawDestinations from "../../../data/destinations.json";

/**
 * The destination list alone (~25 KB), split out of lib/destinations so client
 * components (Trip Check's pickers) can use it without pulling the full customs
 * and entry-requirement corpus (~2.8 MB) into their first load.
 */

/** Sentinel destination code for EU/Schengen-harmonized customs rules (data/customs-items.json). */
export const EU_CUSTOMS_CODE = "EU";

/** Schema-validated at module load: a bad data edit fails the build. */
export const destinations: DestinationRecord[] =
  schemas.destinationsFileSchema.parse(rawDestinations);

export function destinationByCode(code: string): DestinationRecord | undefined {
  const upper = code.toUpperCase();
  return destinations.find((d) => d.code === upper);
}

/** URL slug from a display name: "United States" → "united-states". */
export function destinationSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Canonical destination hub URL — by name, the way people search
 * ("japan entry requirements"); the old code URLs redirect here (next.config.ts). */
export function destinationPath(dest: { name: string }): string {
  return `/destinations/${destinationSlug(dest.name)}`;
}

export function destinationBySlug(slug: string): DestinationRecord | undefined {
  return destinations.find((d) => destinationSlug(d.name) === slug);
}

/**
 * Destinations shown in the trip-check picker as "coming soon" — plain
 * display names and official-site links only, never a legal claim, so this
 * is safe to hardcode here rather than read from the not-yet-verified draft
 * data directory (production code must never reference that — AGENTS.md
 * §13.3). No entry requirement or customs data exists yet for these;
 * resolveTripCheck() always returns `covered: false` for them.
 */
export const queuedDestinations: Array<{ code: string; name: string; officialAuthorityUrl: string }> = [];
