import type { DestinationRecord, EntryRequirementRecord } from "@odyssway/engine";
import { destinationSlug, destinations, entryRequirements } from "./destinations";
import { nationalityRules, type NationalityRule } from "./nationalities";

/**
 * One page per verified (nationality × destination) entry-requirement row —
 * "Japan entry requirements for US citizens". Only verified rows on verified
 * destinations produce a page (AGENTS.md §7 thin-content rule); each page
 * adds the comparison across passports and destinations that the single row
 * can't show, so no two pages carry the same substance.
 */
export interface TravelPair {
  row: EntryRequirementRecord;
  nationality: NationalityRule;
  nationalitySlug: string;
  destination: DestinationRecord;
  destinationSlug: string;
}

export const travelPairs: TravelPair[] = (() => {
  const pairs: TravelPair[] = [];
  for (const row of entryRequirements) {
    if (row.status !== "verified") continue;
    const nationality = nationalityRules.find((n) => n.nationality === row.nationality);
    const destination = destinations.find((d) => d.code === row.destination && d.status === "verified");
    if (!nationality || !destination) continue;
    pairs.push({
      row,
      nationality,
      nationalitySlug: destinationSlug(nationality.name),
      destination,
      destinationSlug: destinationSlug(destination.name),
    });
  }
  return pairs;
})();

export function travelPairPath(pair: { destinationSlug: string; nationalitySlug: string }): string {
  return `/destinations/${pair.destinationSlug}/${pair.nationalitySlug}`;
}

export function travelPair(destSlug: string, natSlug: string): TravelPair | undefined {
  return travelPairs.find((p) => p.destinationSlug === destSlug && p.nationalitySlug === natSlug);
}
