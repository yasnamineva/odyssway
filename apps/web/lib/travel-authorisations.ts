import { schemas, type TravelAuthorisationRecord } from "@odyssway/engine";
import rawAuthorisations from "../../../data/travel-authorisations.json";

/**
 * ETAs and e-visas as their issuing governments describe them
 * (data/travel-authorisations.json). Verified rows only.
 */
export type TravelAuthorisation = TravelAuthorisationRecord;

/** Schema-validated at module load: a bad data edit fails the build. */
export const travelAuthorisations: TravelAuthorisation[] = schemas.travelAuthorisationsFileSchema
  .parse(rawAuthorisations)
  .filter((a) => a.status === "verified");

export function authorisationBySlug(slug: string): TravelAuthorisation | undefined {
  return travelAuthorisations.find((a) => a.slug === slug);
}

export function authorisationsForDestination(code: string): TravelAuthorisation[] {
  return travelAuthorisations.filter((a) => a.destination === code.toUpperCase());
}

export function authorisationPath(a: { slug: string }): string {
  return `/authorisations/${a.slug}`;
}

/** Each source once, in order: the per-claim list when there is one, else the row's source. */
export function authorisationSources(a: TravelAuthorisation): Array<{ claim?: string; name: string; url: string }> {
  return a._sources?.length ? a._sources : [a.legal_source];
}
