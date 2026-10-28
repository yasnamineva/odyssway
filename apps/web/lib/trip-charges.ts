import { schemas, type TripChargeRecord } from "@odyssway/engine";
import rawTripCharges from "../../../data/trip-charges.json";

/**
 * Government charges a visitor pays (levies, departure taxes, compulsory insurance),
 * from data/trip-charges.json. Verified rows only; never prices of private services.
 */
export type TripCharge = TripChargeRecord;

/** Schema-validated at module load: a bad data edit fails the build. */
export const tripCharges: TripCharge[] = schemas.tripChargesFileSchema
  .parse(rawTripCharges)
  .filter((c) => c.status === "verified");

export function chargesForDestination(code: string): TripCharge[] {
  return tripCharges.filter((c) => c.destination === code.toUpperCase());
}
