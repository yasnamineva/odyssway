import { schemas, type CustomsItemRecord, type EntryRequirementRecord } from "@odyssway/engine";
import rawCustomsItems from "../../../data/customs-items.json";
import rawEntryRequirements from "../../../data/entry-requirements.json";
import destinationHistory from "../../../data/destination-history.json";
import { destinations } from "./destination-index";

export {
  EU_CUSTOMS_CODE,
  destinationByCode,
  destinationBySlug,
  destinationPath,
  destinations,
  destinationSlug,
  queuedDestinations,
  withArticle,
} from "./destination-index";


/** Schema-validated at module load: a bad data edit fails the build. */
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

/**
 * The newest destinations, by the date each first appeared in destinations.json
 * (derived from git by scripts/generate-changelog.ts, never hand-edited). Only
 * destinations with verified entry rows are listed, so a stub never shows.
 */
export function recentlyAddedDestinations(count: number): Array<{ code: string; name: string; added: string }> {
  const history = destinationHistory as Record<string, string>;
  const covered = new Set(entryRequirements.filter((r) => r.status === "verified").map((r) => r.destination));
  return destinations
    .filter((d) => d.status === "verified" && covered.has(d.code) && history[d.code])
    .map((d) => ({ code: d.code, name: d.name, added: history[d.code]! }))
    .sort((a, b) => (a.added === b.added ? a.name.localeCompare(b.name) : b.added.localeCompare(a.added)))
    .slice(0, count);
}
