import {
  checkPassportValidity,
  isValidISODate,
  remainingValidity,
  toEpochDay,
  type PassportValidityResult,
  type PassportValidityRule,
  type RemainingValidity,
} from "@odyssway/engine";

/**
 * Passport check across a multi-country route (GROWTH_AND_ROADMAP.md §1.6):
 * one expiry date, each stop's own dates, each stop judged only by its own
 * verified rule. A stop whose rule gives no reference date gets the remaining
 * validity, never a verdict; a stop with no verified rule says so.
 */
export interface RouteStop {
  destinationName: string;
  covered: boolean;
  passportLine?: string;
  passportValidity?: PassportValidityRule;
  arrival: string;
  departure: string;
}

export type StopPassportStatus =
  | { kind: "pending" }
  | { kind: "reversed" }
  | { kind: "not_covered" }
  | { kind: "no_rule" }
  | { kind: "verdict"; result: PassportValidityResult; line: string }
  | { kind: "no_reference"; line: string; atArrival: RemainingValidity; atDeparture: RemainingValidity }
  /** The rule names no period at all ("Valid passport"): quote it, show what's left. */
  | { kind: "no_period"; line: string; atArrival: RemainingValidity; atDeparture: RemainingValidity };

/** Same test Trip Check uses before offering the single-stop passport check. */
const NAMES_A_PERIOD = /\b(\d+|one|two|three|six)[ -](months?|days?)\b/i;

export function checkRouteStop(stop: RouteStop, expiry: string): StopPassportStatus {
  if (!stop.covered) return { kind: "not_covered" };
  if (!stop.passportLine) return { kind: "no_rule" };
  if (!isValidISODate(expiry) || !isValidISODate(stop.arrival) || !isValidISODate(stop.departure)) {
    return { kind: "pending" };
  }
  if (toEpochDay(stop.departure) < toEpochDay(stop.arrival)) return { kind: "reversed" };
  if (stop.passportValidity) {
    return {
      kind: "verdict",
      result: checkPassportValidity(stop.passportValidity, { arrival: stop.arrival, departure: stop.departure }, expiry),
      line: stop.passportLine,
    };
  }
  return {
    kind: NAMES_A_PERIOD.test(stop.passportLine) ? "no_reference" : "no_period",
    line: stop.passportLine,
    atArrival: remainingValidity(expiry, stop.arrival),
    atDeparture: remainingValidity(expiry, stop.departure),
  };
}

/** Index of the first stop whose verified rule the passport fails, or -1. */
export function firstFailingStop(statuses: StopPassportStatus[]): number {
  return statuses.findIndex((s) => s.kind === "verdict" && !s.result.compliant);
}
