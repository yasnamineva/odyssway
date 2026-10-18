import { fromEpochDay, toEpochDay, type ISODate } from "./date";

/**
 * How long a passport must still be valid, as a destination states it
 * (GROWTH_AND_ROADMAP.md §1.6). Only rules whose reference date is explicit are
 * representable: "6 months from arrival", "3 months beyond departure", "valid for
 * the whole stay". A rule that gives a period without saying from when ("valid
 * for at least 6 months") has no `PassportValidityRule` — callers show the
 * remaining validity instead of a verdict, and never guess the reference date.
 */
export type PassportValidityRule =
  | { kind: "min_period"; amount: number; unit: "months" | "days"; from: "arrival" | "departure" }
  | { kind: "whole_stay" };

export interface PassportValidityResult {
  /** The passport must still be valid on this date (inclusive). */
  validUntilAtLeast: ISODate;
  compliant: boolean;
  /** Days between the expiry date and the required date; negative when it falls short. */
  marginDays: number;
}

export interface RemainingValidity {
  /** Whole calendar months from `on` until `expiry`. */
  months: number;
  days: number;
}

/**
 * Add calendar months to a date, clamping to the last day of the target month
 * (31 Aug + 6 months = 28 or 29 Feb). Date-only arithmetic via `Date.UTC`.
 */
export function addMonths(iso: ISODate, months: number): ISODate {
  if (!Number.isInteger(months)) throw new RangeError(`months must be an integer, got ${months}.`);
  const day = toEpochDay(iso);
  const d = new Date(fromEpochDay(day) + "T00:00:00Z");
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const target = Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay));
  return new Date(target).toISOString().slice(0, 10);
}

/** Checks a passport expiry date against a destination's stated validity rule. */
export function checkPassportValidity(
  rule: PassportValidityRule,
  trip: { arrival: ISODate; departure: ISODate },
  expiry: ISODate,
): PassportValidityResult {
  if (toEpochDay(trip.departure) < toEpochDay(trip.arrival)) {
    throw new RangeError("departure must not be before arrival.");
  }
  let required: ISODate;
  if (rule.kind === "whole_stay") {
    required = trip.departure;
  } else {
    if (!Number.isInteger(rule.amount) || rule.amount < 1) {
      throw new RangeError(`amount must be a positive integer, got ${rule.amount}.`);
    }
    const anchor = rule.from === "arrival" ? trip.arrival : trip.departure;
    required =
      rule.unit === "months" ? addMonths(anchor, rule.amount) : fromEpochDay(toEpochDay(anchor) + rule.amount);
  }
  const marginDays = toEpochDay(expiry) - toEpochDay(required);
  return { validUntilAtLeast: required, compliant: marginDays >= 0, marginDays };
}

/** How much validity a passport has left on a given date (zero once expired). */
export function remainingValidity(expiry: ISODate, on: ISODate): RemainingValidity {
  const days = Math.max(0, toEpochDay(expiry) - toEpochDay(on));
  let months = 0;
  while (toEpochDay(addMonths(on, months + 1)) <= toEpochDay(expiry)) months++;
  return { months, days };
}
