import { addDays, isValidISODate, timedStepDate, toEpochDay, type TimedStep } from "@odyssway/engine";
import { checkRouteStop, type StopPassportStatus } from "./route-passport";
import type { EntryBasis, TripCheckResult } from "./trip-check";

/**
 * Trip readiness planner (GROWTH_AND_ROADMAP.md §2, "Travel readiness"): each
 * traveller on each stop, against that pair's verified row. Three kinds of date,
 * never mixed up: a legal deadline (from a verified timed step), a window that
 * opens (arrival cards), and our recommended date (the day you leave minus the
 * buffer you chose, never later than the legal deadline). Runs in the browser.
 */
export interface ReadinessTraveller {
  name: string;
  nationality: string;
  passportExpiry: string;
}

export interface ReadinessStopInput {
  destination: string;
  arrival: string;
  departure: string;
}

export interface ReadinessInput {
  travellers: ReadinessTraveller[];
  stops: ReadinessStopInput[];
  /** The day you leave home; falls back to the first arrival date. */
  leaveHome: string;
  bufferWeeks: number;
}

export type ActionKind = "authorisation" | "passport" | "form_window" | "due_before" | "registration";
export type ActionStatus = "passed" | "now" | "soon" | "ok";

export interface ReadinessAction {
  id: string;
  traveller: string;
  destinationName: string;
  kind: ActionKind;
  basis: EntryBasis;
  /** The row's own wording, quoted as is. */
  line?: string;
  /** From a verified rule: the last day (due) or the first day (opens). */
  legal?: { date: string; type: "due" | "opens" };
  /** Our suggestion; absent for form windows and post-arrival registration. */
  recommended?: string;
  /** For form windows: the window closes when you arrive. */
  arrival: string;
  /** True when the timed step is stated in hours, so the exact time depends on your arrival time. */
  hours?: boolean;
  status: ActionStatus;
}

export interface ReadinessStop {
  destination: string;
  destinationName: string;
  arrival: string;
  departure: string;
  basis: EntryBasis;
  covered: boolean;
  officialAuthorityUrl?: string;
  documentsNeeded: string[];
  notes?: string;
  legalSource?: { name: string; url: string };
  verifiedAt?: string;
  passport: StopPassportStatus;
}

export interface ReadinessTravellerResult {
  name: string;
  nationality: string;
  stops: ReadinessStop[];
}

export interface ReadinessResult {
  travellers: ReadinessTravellerResult[];
  /** Every action across travellers and stops, earliest first. */
  actions: ReadinessAction[];
  /** The day the buffer counts back from. */
  travel: string;
}

type Resolve = (nationality: string, destination: string, items: string[]) => TripCheckResult;

/** Within this many days of today, an action is flagged as close. */
const SOON_DAYS = 7;
/** A documentsNeeded line about a visa or travel authorisation (not the passport line). */
const AUTHORISATION_LINE = /\b(visa|e-?visa|eta|esta|k-eta|etias|nzeta|evisitor|authori[sz]ation)\b/i;
const NEEDS_AUTHORISATION: EntryBasis[] = ["eta_required", "visa_required"];

const diff = (a: string, b: string) => toEpochDay(a) - toEpochDay(b);
const earlier = (a: string, b: string) => (diff(a, b) <= 0 ? a : b);

function actionStatus(a: Omit<ReadinessAction, "status">, today: string): ActionStatus {
  if (a.kind === "form_window") {
    if (diff(a.arrival, today) < 0) return "passed";
    const opensIn = diff(a.legal!.date, today);
    if (opensIn <= 0) return "now";
    return opensIn <= SOON_DAYS ? "soon" : "ok";
  }
  if (a.legal?.type === "due" && diff(a.legal.date, today) < 0) return "passed";
  const target = a.recommended ?? a.legal?.date;
  if (!target) return "ok";
  const left = diff(target, today);
  if (left <= 0) return "now";
  return left <= SOON_DAYS ? "soon" : "ok";
}

export function planReadiness(input: ReadinessInput, today: string, resolve: Resolve): ReadinessResult {
  const stops = input.stops
    .filter((s) => s.destination && isValidISODate(s.arrival))
    .map((s) => ({ ...s, departure: isValidISODate(s.departure) ? s.departure : s.arrival }))
    .sort((a, b) => diff(a.arrival, b.arrival));
  const travellers = input.travellers.filter((t) => t.nationality);
  if (stops.length === 0 || travellers.length === 0) return { travellers: [], actions: [], travel: "" };
  const travel = isValidISODate(input.leaveHome) ? input.leaveHome : stops[0]!.arrival;
  const buffer = Math.max(0, Math.round(input.bufferWeeks)) * 7;
  const suggested = addDays(travel, -buffer);

  const actions: ReadinessAction[] = [];
  const results = travellers.map((tr, ti) => {
    const who = tr.name.trim() || `#${ti + 1}`;
    const out: ReadinessStop[] = stops.map((stop, si) => {
      const r = resolve(tr.nationality, stop.destination, []);
      const passport = checkRouteStop(
        {
          destinationName: r.destinationName,
          covered: r.covered,
          passportLine: r.passportLine,
          passportValidity: r.passportValidity,
          arrival: stop.arrival,
          departure: stop.departure,
        },
        tr.passportExpiry,
      );
      const add = (a: Omit<ReadinessAction, "id" | "traveller" | "destinationName" | "basis" | "arrival" | "status">, n: number) => {
        const base = { ...a, id: `odyssway-${ti}-${si}-${a.kind}-${n}`, traveller: who, destinationName: r.destinationName, basis: r.basis, arrival: stop.arrival };
        actions.push({ ...base, status: actionStatus(base, today) });
      };

      const steps: TimedStep[] = r.covered ? (r.timedSteps ?? []) : [];
      const authLine = r.documentsNeeded.find((d) => d !== r.passportLine && AUTHORISATION_LINE.test(d));
      steps.forEach((step, n) => {
        const date = timedStepDate(step, stop.arrival);
        const hours = step.window.unit === "hours" || undefined;
        if (step.window.kind === "opens_before_arrival") {
          add({ kind: "form_window", line: step.line, legal: { date, type: "opens" }, hours }, n);
        } else if (step.window.kind === "due_after_arrival") {
          add({ kind: "registration", line: step.line, legal: { date, type: "due" }, hours }, n);
        } else {
          // A deadline before arrival: our suggestion is never later than it.
          const isAuth = step.line === authLine && NEEDS_AUTHORISATION.includes(r.basis);
          add({ kind: isAuth ? "authorisation" : "due_before", line: step.line, legal: { date, type: "due" }, recommended: earlier(suggested, date), hours }, n);
        }
      });
      const authDated = steps.some((s) => s.window.kind === "due_before_arrival" && s.line === authLine);
      if (NEEDS_AUTHORISATION.includes(r.basis) && !authDated) {
        add({ kind: "authorisation", line: authLine, recommended: suggested }, steps.length);
      }
      if (passport.kind === "verdict" && !passport.result.compliant) {
        add({ kind: "passport", line: passport.line, recommended: suggested }, steps.length + 1);
      }

      return {
        destination: stop.destination,
        destinationName: r.destinationName,
        arrival: stop.arrival,
        departure: stop.departure,
        basis: r.basis,
        covered: r.covered,
        officialAuthorityUrl: r.officialAuthorityUrl,
        documentsNeeded: r.documentsNeeded,
        notes: r.notes,
        legalSource: r.legalSource,
        verifiedAt: r.verifiedAt,
        passport,
      };
    });
    return { name: who, nationality: tr.nationality, stops: out };
  });

  const when = (a: ReadinessAction) => a.recommended ?? a.legal!.date;
  actions.sort((a, b) => diff(when(a), when(b)));
  return { travellers: results, actions, travel };
}
