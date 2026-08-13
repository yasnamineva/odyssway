import {
  schemas,
  type CustomsItemRecord,
  type DestinationRecord,
  type EntryRequirementRecord,
} from "@odyssway/engine";
import rawCustomsItems from "../../../data/customs-items.json";
import rawDestinations from "../../../data/destinations.json";
import rawEntryRequirements from "../../../data/entry-requirements.json";

/** Sentinel destination code for EU/Schengen-harmonized customs rules (data/customs-items.json). */
export const EU_CUSTOMS_CODE = "EU";

/** Schema-validated at module load: a bad data edit fails the build. */
export const destinations: DestinationRecord[] =
  schemas.destinationsFileSchema.parse(rawDestinations);

export const entryRequirements: EntryRequirementRecord[] =
  schemas.entryRequirementsFileSchema.parse(rawEntryRequirements);

export const customsItems: CustomsItemRecord[] =
  schemas.customsItemsFileSchema.parse(rawCustomsItems);

/**
 * Destinations actually resolvable in Trip Check — i.e. with at least one
 * verified entry-requirement row, not just a destination stub. A destination
 * can briefly exist in `destinations.json` while its entry-requirement rows
 * are still being verified, so this (not `destinations.length`) is the
 * honest number to surface in marketing copy (AGENTS.md §3: never overstate
 * coverage).
 */
export const coveredDestinationCount = new Set(
  entryRequirements.filter((r) => r.status === "verified").map((r) => r.destination),
).size;

export function destinationByCode(code: string): DestinationRecord | undefined {
  const upper = code.toUpperCase();
  return destinations.find((d) => d.code === upper);
}

/**
 * Destinations shown in the trip-check picker as "coming soon" — plain
 * display names and official-site links only, never a legal claim, so this
 * is safe to hardcode here rather than read from the not-yet-verified draft
 * data directory (production code must never reference that — AGENTS.md
 * §13.3). No entry requirement or customs data exists yet for these;
 * resolveTripCheck() always returns `covered: false` for them.
 */
export const queuedDestinations: Array<{ code: string; name: string; officialAuthorityUrl: string }> = [
  { code: "BR", name: "Brazil", officialAuthorityUrl: "https://www.gov.br/mre/en" },
];
