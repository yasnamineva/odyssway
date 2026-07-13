import { toEpochDay } from "./date";
import { CannotComputeError, InvalidTripError } from "./errors";
import type {
  CountryRecord,
  EngineContext,
  PresenceResult,
  Trip,
  TripExclusion,
} from "./types";

/**
 * Expand trips into the set of epoch days that consume 90/180 allowance.
 *
 * Rules applied (legal sources documented in the engine README):
 * - Entry and exit days both count (Schengen Borders Code short-stay definition).
 * - Overlapping trips merge: a day counts once.
 * - Residence permit / D-visa days in the ISSUING state do not count; days in
 *   other Schengen states do.
 * - Trips under a bilateral agreement basis are excluded from the 90/180 count
 *   only when the referenced agreement is provided and `verified`; otherwise
 *   the engine refuses to compute (never a silent guess).
 * - With a countries dataset: days in non-Schengen countries never count, and
 *   membership is resolved per-date via `schengenSince` (historic accessions).
 *   Unknown country codes fail loudly.
 */
export function buildPresence(trips: Trip[], ctx: EngineContext = {}): PresenceResult {
  const presence = new Set<number>();
  const exclusions: TripExclusion[] = [];

  const countryIndex = ctx.countries
    ? new Map(ctx.countries.map((c) => [c.code, c]))
    : null;
  const agreementIndex = new Map(
    (ctx.bilateralAgreements ?? []).map((a) => [a.id, a]),
  );

  for (const trip of trips) {
    const start = toEpochDay(trip.entry);
    const end = toEpochDay(trip.exit);
    if (start > end) {
      throw new InvalidTripError(
        `Trip entry ${trip.entry} is after exit ${trip.exit}.`,
      );
    }
    const tripDays = end - start + 1;

    if (
      trip.basis.kind === "d_visa_or_permit" &&
      trip.basis.issuingCountry === trip.country
    ) {
      exclusions.push({
        trip,
        reason: "residence_permit_issuing_state",
        daysExcluded: tripDays,
      });
      continue;
    }

    if (trip.basis.kind === "bilateral") {
      const agreement = agreementIndex.get(trip.basis.agreementId);
      if (!agreement) {
        throw new CannotComputeError(
          "bilateral_agreement_not_available",
          `No bilateral agreement with id "${trip.basis.agreementId}" was provided. We can't compute this case yet.`,
        );
      }
      if (agreement.status !== "verified") {
        throw new CannotComputeError(
          "bilateral_agreement_unverified",
          `Bilateral agreement "${agreement.id}" is not verified against a primary source. We can't compute this case yet.`,
        );
      }
      if (agreement.schengenState !== trip.country) {
        throw new CannotComputeError(
          "bilateral_agreement_state_mismatch",
          `Bilateral agreement "${agreement.id}" applies to ${agreement.schengenState}, not ${trip.country}.`,
        );
      }
      exclusions.push({
        trip,
        reason: "bilateral_agreement",
        daysExcluded: tripDays,
      });
      continue;
    }

    if (countryIndex && trip.country !== "ZZ") {
      const country = countryIndex.get(trip.country);
      if (!country) {
        throw new CannotComputeError(
          "unknown_country",
          `Country "${trip.country}" is not in the verified countries dataset. We can't compute this case yet.`,
        );
      }
      if (!country.schengenMember) {
        exclusions.push({
          trip,
          reason: "non_schengen_country",
          daysExcluded: tripDays,
        });
        continue;
      }
      const accession = accessionEpochDay(country);
      let excludedPreAccession = 0;
      for (let d = start; d <= end; d++) {
        if (accession !== null && d < accession) {
          excludedPreAccession++;
        } else {
          presence.add(d);
        }
      }
      if (excludedPreAccession > 0) {
        exclusions.push({
          trip,
          reason: "pre_accession_days",
          daysExcluded: excludedPreAccession,
        });
      }
      continue;
    }

    // "ZZ" (Schengen, country unspecified) or no countries dataset: the
    // caller's contract is that the trip is a Schengen short stay.
    for (let d = start; d <= end; d++) {
      presence.add(d);
    }
  }

  return { presence, exclusions };
}

function accessionEpochDay(country: CountryRecord): number | null {
  return country.schengenSince === undefined
    ? null
    : toEpochDay(country.schengenSince);
}
