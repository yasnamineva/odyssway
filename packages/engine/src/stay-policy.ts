/**
 * Generalized "how long can I stay" beyond the Schengen rolling window.
 *
 * `rolling_window` is the Schengen 90/180 model — already fully implemented by
 * status()/planTrip()/maxStay()/checkTimeline() in engine.ts, which this type
 * describes but does not reimplement. `fixed_per_entry` covers the far more
 * common world pattern (a flat N-day limit each time you enter, no rolling
 * lookback) — the US Visa Waiver Program, UK Standard Visitor route, and
 * Canada's visitor status all work this way. `visa_required` means no
 * automatic duration exists — the visa terms decide it, so the engine does
 * not compute a number and callers must not display one.
 */
export type StayPolicy =
  | { kind: "rolling_window"; windowDays: number; maxDays: number }
  | { kind: "fixed_per_entry"; maxDays: number }
  | { kind: "visa_required" };

export interface SimpleStayResult {
  compliant: boolean;
  maxDays: number;
  tripLengthDays: number;
}

/**
 * Evaluates a single trip against a `fixed_per_entry` policy. There is no
 * lookback across other trips (unlike the rolling window) — each entry is
 * judged on its own, per how these regimes actually work.
 */
export function evaluateSimpleStay(
  policy: Extract<StayPolicy, { kind: "fixed_per_entry" }>,
  tripLengthDays: number,
): SimpleStayResult {
  if (!Number.isInteger(tripLengthDays) || tripLengthDays < 1) {
    throw new RangeError(`tripLengthDays must be a positive integer, got ${tripLengthDays}.`);
  }
  return {
    compliant: tripLengthDays <= policy.maxDays,
    maxDays: policy.maxDays,
    tripLengthDays,
  };
}
