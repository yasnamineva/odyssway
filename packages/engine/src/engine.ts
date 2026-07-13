import { fromEpochDay, toEpochDay, type ISODate } from "./date";
import { EngineError, InvalidTripError } from "./errors";
import { buildPresence } from "./presence";
import type {
  EngineContext,
  MaxStayResult,
  NextEntryResult,
  PlanTripResult,
  StatusResult,
  TimelineResult,
  Trip,
} from "./types";

/** 90 days in any 180-day rolling window; both bounds inclusive: [D − 179, D]. */
export const WINDOW_DAYS = 180;
export const MAX_DAYS_IN_WINDOW = 90;

/** |presence ∩ [day − 179, day]| — the windows are tiny, so clarity beats cleverness. */
function countInWindow(presence: ReadonlySet<number>, day: number): number {
  let used = 0;
  for (let d = day - (WINDOW_DAYS - 1); d <= day; d++) {
    if (presence.has(d)) used++;
  }
  return used;
}

/** Longest compliant consecutive stay starting at `entry`, given existing presence. */
function maxStayFrom(presence: ReadonlySet<number>, entry: number): number {
  const sim = new Set(presence);
  let days = 0;
  for (let d = entry; days < MAX_DAYS_IN_WINDOW; d++) {
    const alreadyPresent = sim.has(d);
    if (!alreadyPresent) sim.add(d);
    if (countInWindow(sim, d) > MAX_DAYS_IN_WINDOW) {
      if (!alreadyPresent) sim.delete(d);
      break;
    }
    days++;
  }
  return days;
}

/**
 * Earliest day ≥ `from` allowing a compliant stay of `desiredStay` days.
 * Always terminates: after 90+ days of absence a full 90-day stay is possible,
 * so an answer exists at latest on max(presence) + 91.
 */
function findNextEntryDay(
  presence: ReadonlySet<number>,
  from: number,
  desiredStay: number,
): number {
  let lastPresence = Number.NEGATIVE_INFINITY;
  for (const d of presence) {
    if (d > lastPresence) lastPresence = d;
  }
  const bound =
    presence.size === 0 ? from : Math.max(from, lastPresence + WINDOW_DAYS / 2 + 1);
  for (let d = from; d <= bound; d++) {
    if (maxStayFrom(presence, d) >= desiredStay) return d;
  }
  /* v8 ignore next 2 -- unreachable by the absence argument above */
  throw new EngineError("Internal error: next entry search did not terminate.");
}

/** Days used / remaining in the window ending on `onDate` (AGENTS.md §6.3 status). */
export function status(
  trips: Trip[],
  onDate: ISODate,
  ctx: EngineContext = {},
): StatusResult {
  const day = toEpochDay(onDate);
  const { presence, exclusions } = buildPresence(trips, ctx);
  const daysUsed = countInWindow(presence, day);
  return {
    onDate,
    windowStart: fromEpochDay(day - (WINDOW_DAYS - 1)),
    daysUsed,
    daysRemaining: Math.max(0, MAX_DAYS_IN_WINDOW - daysUsed),
    overstayDays: Math.max(0, daysUsed - MAX_DAYS_IN_WINDOW),
    presentOnDate: presence.has(day),
    nextSafeEntry: fromEpochDay(findNextEntryDay(presence, day, 1)),
    exclusions,
  };
}

/**
 * Is a planned future stay compliant on EVERY day of the stay?
 * Reports the first violating day, and the latest safe exit for the same entry.
 */
export function planTrip(
  trips: Trip[],
  entry: ISODate,
  exit: ISODate,
  ctx: EngineContext = {},
): PlanTripResult {
  const start = toEpochDay(entry);
  const end = toEpochDay(exit);
  if (start > end) {
    throw new InvalidTripError(`Planned entry ${entry} is after exit ${exit}.`);
  }
  const { presence } = buildPresence(trips, ctx);

  const sim = new Set(presence);
  for (let d = start; d <= end; d++) sim.add(d);

  let firstViolationDay: number | null = null;
  for (let d = start; d <= end; d++) {
    if (countInWindow(sim, d) > MAX_DAYS_IN_WINDOW) {
      firstViolationDay = d;
      break;
    }
  }

  const safeDays = maxStayFrom(presence, start);
  const daysUsedOnExit = countInWindow(sim, end);
  return {
    entry,
    exit,
    tripLengthDays: end - start + 1,
    compliant: firstViolationDay === null,
    firstViolationDay:
      firstViolationDay === null ? null : fromEpochDay(firstViolationDay),
    latestSafeExit: safeDays > 0 ? fromEpochDay(start + safeDays - 1) : null,
    daysUsedOnExit,
    daysRemainingAfterTrip: Math.max(0, MAX_DAYS_IN_WINDOW - daysUsedOnExit),
  };
}

/** Longest compliant stay entering on `entry`, and the forced exit date. */
export function maxStay(
  trips: Trip[],
  entry: ISODate,
  ctx: EngineContext = {},
): MaxStayResult {
  const start = toEpochDay(entry);
  const { presence } = buildPresence(trips, ctx);
  const days = maxStayFrom(presence, start);
  return {
    entry,
    maxDays: days,
    lastAllowedDay: days > 0 ? fromEpochDay(start + days - 1) : null,
  };
}

/**
 * Whole-timeline compliance: is EVERY day of presence across all entered
 * trips (past and future) within the 90/180 rule? Catches the case where a
 * trip is fine in isolation but pushes a later listed trip over the limit —
 * something per-trip checks miss.
 */
export function checkTimeline(
  trips: Trip[],
  ctx: EngineContext = {},
): TimelineResult {
  const { presence } = buildPresence(trips, ctx);
  const days = [...presence].sort((a, b) => a - b);
  for (const d of days) {
    if (countInWindow(presence, d) > MAX_DAYS_IN_WINDOW) {
      return { compliant: false, firstViolationDay: fromEpochDay(d) };
    }
  }
  return { compliant: true, firstViolationDay: null };
}

/** Earliest entry date ≥ `from` allowing `desiredStay` consecutive compliant days. */
export function nextEntry(
  trips: Trip[],
  desiredStay: number,
  from: ISODate,
  ctx: EngineContext = {},
): NextEntryResult {
  if (
    !Number.isInteger(desiredStay) ||
    desiredStay < 1 ||
    desiredStay > MAX_DAYS_IN_WINDOW
  ) {
    throw new EngineError(
      `desiredStay must be an integer between 1 and ${MAX_DAYS_IN_WINDOW}, got ${desiredStay}.`,
    );
  }
  const { presence } = buildPresence(trips, ctx);
  const day = findNextEntryDay(presence, toEpochDay(from), desiredStay);
  return {
    desiredStay,
    earliestEntry: fromEpochDay(day),
    lastAllowedDay: fromEpochDay(day + desiredStay - 1),
  };
}
