import { addMonths } from "./passport-validity";
import { fromEpochDay, toEpochDay, type ISODate } from "./date";

/**
 * A permit's lead time, as the authority states it ("at least 14 days before you
 * travel", "10 working days before you arrive"). Structured only when the wording
 * names both the amount and the reference date; otherwise callers quote the prose.
 */
export interface LeadTimeRule {
  amount: number;
  unit: "days" | "weeks" | "months" | "working_days";
  /** "travel": the day you leave home; "arrival": the day you arrive in that country. */
  before: "travel" | "arrival";
}

/** Saturday or Sunday, from an epoch day (1970-01-01 was a Thursday). */
function isWeekend(epochDay: number): boolean {
  const dow = (((epochDay + 4) % 7) + 7) % 7; // 0 = Sunday
  return dow === 0 || dow === 6;
}

/**
 * The latest date to apply so the stated lead time is met: the reference date
 * minus the lead time. Working days skip Saturdays and Sundays only — public
 * holidays aren't known, so callers must say the real deadline may be earlier.
 */
export function applyByDate(rule: LeadTimeRule, dates: { travel: ISODate; arrival: ISODate }): ISODate {
  if (!Number.isInteger(rule.amount) || rule.amount < 1) {
    throw new RangeError(`amount must be a positive integer, got ${rule.amount}.`);
  }
  const ref = rule.before === "travel" ? dates.travel : dates.arrival;
  const day = toEpochDay(ref);
  switch (rule.unit) {
    case "days":
      return fromEpochDay(day - rule.amount);
    case "weeks":
      return fromEpochDay(day - rule.amount * 7);
    case "months":
      return addMonths(ref, -rule.amount);
    case "working_days": {
      let d = day;
      let left = rule.amount;
      while (left > 0) {
        d -= 1;
        if (!isWeekend(d)) left -= 1;
      }
      return fromEpochDay(d);
    }
  }
}
