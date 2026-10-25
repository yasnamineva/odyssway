import { applyByDate, isValidISODate, toEpochDay, type CustomsItemRecord } from "@odyssway/engine";
import type { TripCheckResult } from "./trip-check";

/**
 * Medication travel planner (GROWTH_AND_ROADMAP.md §2.1): each medicine on each
 * stop of the route, against that country's own verified row, with the permit
 * "apply by" date where the authority states a lead time we could structure.
 * Everything runs in the browser; nothing is stored or sent.
 */
export interface PlannerStopInput {
  destination: string;
  arrival: string;
}

export interface PlannerInput {
  nationality: string;
  /** The day you leave home; falls back to the first arrival date. */
  leaveHome: string;
  stops: PlannerStopInput[];
  medicines: string[];
}

export type DeadlineStatus = "passed" | "soon" | "ok";

export interface PlannerMedicine {
  query: string;
  match: CustomsItemRecord | null;
  /** Latest date to apply for the permit, when the lead time is structured. */
  applyBy?: string;
  status?: DeadlineStatus;
}

export interface PlannerStop {
  destination: string;
  destinationName: string;
  arrival: string;
  officialAuthorityUrl?: string;
  medicines: PlannerMedicine[];
}

export interface PlannerDeadline {
  destinationName: string;
  query: string;
  permit: string;
  applyBy: string;
  status: DeadlineStatus;
}

export interface PlannerResult {
  stops: PlannerStop[];
  deadlines: PlannerDeadline[];
}

type Resolve = (nationality: string, destination: string, items: string[]) => TripCheckResult;

/** Within this many days of today, a deadline is flagged as close. */
const SOON_DAYS = 7;

function deadlineStatus(applyBy: string, today: string): DeadlineStatus {
  const diff = toEpochDay(applyBy) - toEpochDay(today);
  if (diff < 0) return "passed";
  return diff <= SOON_DAYS ? "soon" : "ok";
}

export function planMedications(input: PlannerInput, today: string, resolve: Resolve): PlannerResult {
  const medicines = [...new Set(input.medicines.map((m) => m.trim()).filter(Boolean))];
  const stops = input.stops.filter((s) => s.destination && isValidISODate(s.arrival));
  if (!input.nationality || medicines.length === 0 || stops.length === 0) return { stops: [], deadlines: [] };
  const firstArrival = [...stops].sort((a, b) => toEpochDay(a.arrival) - toEpochDay(b.arrival))[0]!.arrival;
  const travel = isValidISODate(input.leaveHome) ? input.leaveHome : firstArrival;

  const out: PlannerStop[] = stops.map((stop) => {
    const r = resolve(input.nationality, stop.destination, medicines);
    return {
      destination: stop.destination,
      destinationName: r.destinationName,
      arrival: stop.arrival,
      officialAuthorityUrl: r.officialAuthorityUrl,
      medicines: r.items.map((it) => {
        const rule = it.match?.procedure?.leadTimeRule;
        if (!rule) return { query: it.query, match: it.match };
        const applyBy = applyByDate(rule, { travel, arrival: stop.arrival });
        return { query: it.query, match: it.match, applyBy, status: deadlineStatus(applyBy, today) };
      }),
    };
  });

  const deadlines: PlannerDeadline[] = out
    .flatMap((s) =>
      s.medicines
        .filter((m) => m.applyBy && m.status && m.match?.procedure)
        .map((m) => ({
          destinationName: s.destinationName,
          query: m.query,
          permit: m.match!.procedure!.title,
          applyBy: m.applyBy!,
          status: m.status!,
        })),
    )
    .sort((a, b) => toEpochDay(a.applyBy) - toEpochDay(b.applyBy));

  return { stops: out, deadlines };
}
