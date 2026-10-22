import { fromEpochDay, toEpochDay, type ISODate } from "./date";

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
 *
 * `maxDaysPerEntry` is set on a rolling window only when the source also caps
 * each single stay (e.g. 30 days per entry inside 90 in 180); callers show both.
 */
export type StayPolicy =
  | { kind: "rolling_window"; windowDays: number; maxDays: number; maxDaysPerEntry?: number }
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

/** One stay in a single destination: entry and exit days both count (§6.1). */
export interface Stay {
  entry: ISODate;
  exit: ISODate;
}

export interface StayCheck {
  entry: ISODate;
  exit: ISODate;
  /** Days present on this stay, entry and exit included. */
  days: number;
  /** Days over the per-entry cap (fixed_per_entry, or rolling_window.maxDaysPerEntry), else 0. */
  overPerEntry: number;
}

export interface StaysResult {
  compliant: boolean;
  stays: StayCheck[];
  /** rolling_window only: the most days present in any single window. */
  peakInWindow?: number;
  /** rolling_window only: the first day the window total went over the limit. */
  firstWindowViolation?: ISODate | null;
}

/**
 * Checks several stays in one destination against that destination's own
 * stay policy (the multi-country day counter, GROWTH_AND_ROADMAP.md §1.6).
 * Overlapping stays count each day once. `visa_required` has no day count,
 * so callers must not use this for it.
 */
export function evaluateStays(
  policy: Exclude<StayPolicy, { kind: "visa_required" }>,
  stays: Stay[],
): StaysResult {
  const checks: StayCheck[] = stays.map((s) => {
    const a = toEpochDay(s.entry);
    const b = toEpochDay(s.exit);
    if (b < a) throw new RangeError(`Exit ${s.exit} is before entry ${s.entry}.`);
    const days = b - a + 1;
    const cap = policy.kind === "fixed_per_entry" ? policy.maxDays : policy.maxDaysPerEntry;
    return { entry: s.entry, exit: s.exit, days, overPerEntry: cap ? Math.max(0, days - cap) : 0 };
  });
  const perEntryOk = checks.every((c) => c.overPerEntry === 0);
  if (policy.kind === "fixed_per_entry") return { compliant: perEntryOk, stays: checks };

  const presence = new Set<number>();
  for (const s of stays) {
    for (let d = toEpochDay(s.entry); d <= toEpochDay(s.exit); d++) presence.add(d);
  }
  const days = [...presence].sort((x, y) => x - y);
  let peak = 0;
  let firstViolation: number | null = null;
  for (const d of days) {
    let used = 0;
    for (const p of days) if (p > d - policy.windowDays && p <= d) used++;
    if (used > peak) peak = used;
    if (used > policy.maxDays && firstViolation === null) firstViolation = d;
  }
  return {
    compliant: perEntryOk && firstViolation === null,
    stays: checks,
    peakInWindow: peak,
    firstWindowViolation: firstViolation === null ? null : fromEpochDay(firstViolation),
  };
}
