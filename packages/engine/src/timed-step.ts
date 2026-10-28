import { fromEpochDay, toEpochDay, type ISODate } from "./date";

/**
 * A step tied to the arrival date, as a row's own documentsNeeded line states it
 * ("within 72 hours before arrival", "at least 4 days before arrival", "within
 * 24 hours of arrival"). Structured only when the line names the amount and says
 * which side of arrival it's on; otherwise callers quote the line.
 */
export interface TimedStep {
  /** The documentsNeeded line this restates, word for word. */
  line: string;
  window: {
    /**
     * opens_before_arrival: can be done from this long before arrival, up to arrival.
     * due_before_arrival: must be done at least this long before arrival.
     * due_after_arrival: must be done within this long after arrival.
     */
    kind: "opens_before_arrival" | "due_before_arrival" | "due_after_arrival";
    amount: number;
    unit: "hours" | "days";
  };
}

/**
 * Calendar dates for a timed step, from the arrival date. Hours are rounded up to
 * whole days; the exact moment depends on your arrival time, which callers say.
 */
export function timedStepDate(step: TimedStep, arrival: ISODate): ISODate {
  const { kind, amount, unit } = step.window;
  if (!Number.isInteger(amount) || amount < 1) {
    throw new RangeError(`amount must be a positive integer, got ${amount}.`);
  }
  const days = unit === "days" ? amount : Math.ceil(amount / 24);
  const day = toEpochDay(arrival);
  return fromEpochDay(kind === "due_after_arrival" ? day + days : day - days);
}
