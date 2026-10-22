import {
  checkTimeline,
  evaluateStays,
  status,
  type EngineContext,
  type StaysResult,
  type StayPolicy,
  type Trip,
} from "@odyssway/engine";
import type { EntryBasis, TripCheckResult } from "./trip-check";

/**
 * Multi-country day counter (GROWTH_AND_ROADMAP.md §1.6): one list of trips,
 * each destination checked against its own verified stay rule. Schengen
 * trips are pooled and run through the same engine as /calculator, so
 * permits, non-Schengen days and accession dates are handled identically.
 * Everything runs in the browser; nothing is stored or sent.
 */
export interface CounterTrip {
  destination: string;
  entry: string;
  exit: string;
}

export interface SchengenCount {
  kind: "schengen";
  trips: CounterTrip[];
  compliant: boolean;
  firstViolationDay: string | null;
  daysUsedOnDate: number;
  daysRemainingOnDate: number;
  onDate: string;
}

export interface PolicyCount {
  kind: "policy";
  destination: string;
  destinationName: string;
  basis: EntryBasis;
  policy: Exclude<StayPolicy, { kind: "visa_required" }>;
  result: StaysResult;
  legalSource?: { name: string; url: string };
  verifiedAt?: string;
}

/** Covered, but the rule gives no day count (visa terms decide, or free movement / citizen). */
export interface NoCount {
  kind: "no_count";
  destination: string;
  destinationName: string;
  basis: EntryBasis;
  legalSource?: { name: string; url: string };
  verifiedAt?: string;
}

export interface NotCovered {
  kind: "not_covered";
  destination: string;
  destinationName: string;
}

export type DestinationCount = SchengenCount | PolicyCount | NoCount | NotCovered;

type Resolve = (nationality: string, destination: string) => TripCheckResult;

export function countDays(
  nationality: string,
  trips: CounterTrip[],
  onDate: string,
  resolve: Resolve,
  schengenCodes: ReadonlySet<string>,
  ctx: EngineContext,
): DestinationCount[] {
  const valid = trips.filter((t) => t.destination && t.entry && t.exit && t.exit >= t.entry);
  const out: DestinationCount[] = [];

  const schengenTrips = valid.filter((t) => schengenCodes.has(t.destination));
  const [firstSchengen] = schengenTrips;
  if (firstSchengen) {
    const sample = resolve(nationality, firstSchengen.destination);
    if (sample.basis === "citizen" || sample.basis === "free_movement") {
      out.push({ kind: "no_count", destination: "SCHENGEN", destinationName: sample.destinationName, basis: sample.basis });
    } else if (sample.covered) {
      const basis = sample.basis === "visa_required" ? ({ kind: "c_visa" } as const) : ({ kind: "visa_free" } as const);
      const engineTrips: Trip[] = schengenTrips.map((t) => ({ entry: t.entry, exit: t.exit, country: t.destination, basis }));
      const timeline = checkTimeline(engineTrips, ctx);
      const s = status(engineTrips, onDate, ctx);
      out.push({
        kind: "schengen",
        trips: schengenTrips,
        compliant: timeline.compliant,
        firstViolationDay: timeline.firstViolationDay,
        daysUsedOnDate: s.daysUsed,
        daysRemainingOnDate: s.daysRemaining,
        onDate,
      });
    }
  }

  const others = [...new Set(valid.filter((t) => !schengenCodes.has(t.destination)).map((t) => t.destination))];
  for (const code of others) {
    const r = resolve(nationality, code);
    const stays = valid.filter((t) => t.destination === code).map((t) => ({ entry: t.entry, exit: t.exit }));
    if (!r.covered) {
      out.push({ kind: "not_covered", destination: code, destinationName: r.destinationName });
    } else if (!r.stayPolicy || r.stayPolicy.kind === "visa_required") {
      out.push({ kind: "no_count", destination: code, destinationName: r.destinationName, basis: r.basis, legalSource: r.legalSource, verifiedAt: r.verifiedAt });
    } else {
      out.push({
        kind: "policy",
        destination: code,
        destinationName: r.destinationName,
        basis: r.basis,
        policy: r.stayPolicy,
        result: evaluateStays(r.stayPolicy, stays),
        legalSource: r.legalSource,
        verifiedAt: r.verifiedAt,
      });
    }
  }
  return out;
}
