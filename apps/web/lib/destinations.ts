import { schemas, type CustomsItemRecord, type EntryRequirementRecord } from "@odyssway/engine";
import rawCustomsItems from "../../../data/customs-items.json";
import rawEntryRequirements from "../../../data/entry-requirements.json";

export {
  EU_CUSTOMS_CODE,
  destinationByCode,
  destinationBySlug,
  destinationPath,
  destinations,
  destinationSlug,
  queuedDestinations,
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
