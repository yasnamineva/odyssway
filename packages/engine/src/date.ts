import { InvalidDateError } from "./errors";

/**
 * Date-only arithmetic (AGENTS.md §13.1): dates are ISO `YYYY-MM-DD` strings
 * at the boundary and integer "epoch days" (days since 1970-01-01) inside the
 * engine. `Date` is used only via `Date.UTC`, which is timezone-independent;
 * no local-timezone arithmetic ever happens here.
 */
export type ISODate = string;

const MS_PER_DAY = 86_400_000;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse an ISO date to an integer epoch day. Throws on malformed or nonexistent dates (e.g. 2023-02-29). */
export function toEpochDay(iso: ISODate): number {
  const m = ISO_RE.exec(iso);
  if (!m) {
    throw new InvalidDateError(`Invalid ISO date (expected YYYY-MM-DD): ${JSON.stringify(iso)}`);
  }
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new InvalidDateError(`Nonexistent calendar date: ${iso}`);
  }
  return ms / MS_PER_DAY;
}

/** Convert an integer epoch day back to an ISO date string. */
export function fromEpochDay(epochDay: number): ISODate {
  if (!Number.isInteger(epochDay)) {
    throw new InvalidDateError(`Epoch day must be an integer, got: ${epochDay}`);
  }
  return new Date(epochDay * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Add (or subtract) whole days to an ISO date. */
export function addDays(iso: ISODate, days: number): ISODate {
  return fromEpochDay(toEpochDay(iso) + days);
}

/** True if `iso` is a well-formed, existing calendar date. */
export function isValidISODate(iso: string): boolean {
  try {
    toEpochDay(iso);
    return true;
  } catch {
    return false;
  }
}
