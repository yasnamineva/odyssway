"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { count } from "../lib/count";
import { schengenCountries } from "../lib/countries";
import { destinationByCode, destinations, destinationSlug } from "../lib/destination-index";
import { downloadIcsCalendar } from "../lib/ics";
import { publishedNationalities } from "../lib/nationalities";
import {
  planReadiness,
  type ReadinessAction,
  type ReadinessInput,
  type ReadinessResult,
  type ReadinessStopInput,
  type ReadinessTraveller,
} from "../lib/readiness";
import { chargesForDestination } from "../lib/trip-charges";
import { StopStatus } from "./RoutePassportCheck";
import TripChargeList from "./TripChargeList";
import SearchableSelect from "./SearchableSelect";
import SourceNote from "./SourceNote";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none";
const labelClass = "block text-xs font-medium text-slate-600";
const MAX_TRAVELLERS = 6;
const MAX_STOPS = 6;
const BUFFER_WEEKS = [2, 4, 6, 8, 12];
const STORAGE_KEY = "odyssway:readiness";

const STATUS_STYLES: Record<string, string> = {
  passed: "text-red-700",
  now: "text-amber-700",
  soon: "text-amber-700",
  ok: "text-slate-800",
};

const emptyTraveller = (): ReadinessTraveller => ({ name: "", nationality: "", passportExpiry: "" });
const emptyStop = (): ReadinessStopInput => ({ destination: "", arrival: "", departure: "" });
const EMPTY: ReadinessResult = { travellers: [], actions: [], travel: "" };

interface Saved {
  input: ReadinessInput;
  checkedAt: string;
}

/** Today's date as YYYY-MM-DD from the user's calendar (date-only, §13.1). */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hubPath(code: string): string | undefined {
  const dest = destinationByCode(code);
  return dest ? `/destinations/${destinationSlug(dest.name)}` : undefined;
}

/**
 * @param changeDates For each destination code, the dates its rows changed
 *   (from the changelog), so a saved plan can say what changed since it was checked.
 */
export default function ReadinessPlanner({ changeDates }: { changeDates: Record<string, string[]> }) {
  const t = useTranslations("readiness");
  const tc = useTranslations("tripCheck");
  const [travellers, setTravellers] = useState<ReadinessTraveller[]>([emptyTraveller()]);
  const [stops, setStops] = useState<ReadinessStopInput[]>([emptyStop()]);
  const [leaveHome, setLeaveHome] = useState("");
  const [bufferWeeks, setBufferWeeks] = useState(8);
  const [remember, setRemember] = useState(false);
  const [checkedAt, setCheckedAt] = useState("");
  const [today, setToday] = useState("");
  const [engine, setEngine] = useState<typeof import("../lib/trip-engine") | null>(null);
  const counted = useRef(false);

  useEffect(() => {
    setToday(todayISO());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Saved;
        setTravellers(saved.input.travellers.length ? saved.input.travellers : [emptyTraveller()]);
        setStops(saved.input.stops.length ? saved.input.stops : [emptyStop()]);
        setLeaveHome(saved.input.leaveHome);
        setBufferWeeks(saved.input.bufferWeeks);
        setCheckedAt(saved.checkedAt);
        setRemember(true);
      }
    } catch {
      // Storage blocked or a stale shape: start empty.
    }
    let live = true;
    void import("../lib/trip-engine").then((m) => {
      if (live) setEngine(m);
    });
    return () => {
      live = false;
    };
  }, []);

  const input: ReadinessInput = useMemo(
    () => ({ travellers, stops, leaveHome, bufferWeeks }),
    [travellers, stops, leaveHome, bufferWeeks],
  );

  const result: ReadinessResult = useMemo(() => {
    if (!engine || !today) return EMPTY;
    try {
      return planReadiness(input, today, engine.resolveTripCheck);
    } catch {
      return EMPTY;
    }
  }, [engine, today, input]);

  useEffect(() => {
    if (result.travellers.length > 0 && !counted.current) {
      counted.current = true;
      count("readiness_check");
    }
  }, [result]);

  // A saved plan follows the form; the "checked on" date only moves when the user says so.
  useEffect(() => {
    if (!remember || !checkedAt) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, checkedAt } satisfies Saved));
    } catch {
      // Storage blocked: the plan still works for this visit.
    }
  }, [remember, checkedAt, input]);

  const toggleRemember = (on: boolean) => {
    setRemember(on);
    if (on) {
      setCheckedAt(today);
      count("readiness_saved");
    } else {
      setCheckedAt("");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Nothing to remove.
      }
    }
  };

  const changed = useMemo(() => {
    if (!checkedAt) return [];
    const codes = [...new Set(stops.map((s) => s.destination).filter(Boolean))];
    return codes.filter((c) => (changeDates[c] ?? []).some((d) => d > checkedAt));
  }, [checkedAt, stops, changeDates]);

  const destinationGroups = [
    { label: tc("toGroupSchengenStates"), options: schengenCountries.map((c) => ({ value: c.code, label: c.name })) },
    {
      label: tc("toGroupDestinations"),
      options: destinations.filter((d) => d.status === "verified").map((d) => ({ value: d.code, label: d.name })),
    },
  ];
  const nameOf = (code: string) =>
    destinationByCode(code)?.name ?? schengenCountries.find((c) => c.code === code)?.name ?? code;

  const updateTraveller = (i: number, patch: Partial<ReadinessTraveller>) =>
    setTravellers((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const updateStop = (i: number, patch: Partial<ReadinessStopInput>) =>
    setStops((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const actionTitle = (a: ReadinessAction) => {
    const vars = { traveller: a.traveller, country: a.destinationName };
    if (a.kind === "authorisation") return t(a.basis === "eta_required" ? "action.authorisation_eta" : "action.authorisation_visa", vars);
    return t(`action.${a.kind}`, vars);
  };

  const addToCalendar = () => {
    downloadIcsCalendar(
      "odyssway-trip-readiness.ics",
      result.actions.map((a) => ({
        id: a.id,
        title: actionTitle(a),
        description: [a.line, legalText(a), "odyssway.com/readiness"].filter(Boolean).join("\n"),
        date: a.recommended ?? a.legal!.date,
      })),
    );
    count("readiness_ics");
  };

  const legalText = (a: ReadinessAction) => {
    if (!a.legal) return t("noOfficialDeadline");
    if (a.legal.type === "opens") return t(a.hours ? "legalOpensHours" : "legalOpens", { date: a.legal.date, arrival: a.arrival });
    return t(a.hours ? "legalDueHours" : "legalDue", { date: a.legal.date });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t("subtitle")}</p>

      {checkedAt && (
        <div
          className={`mt-6 rounded-xl p-3 text-sm ${changed.length ? "bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-700"}`}
          data-testid="rd-recheck"
        >
          {changed.length > 0 ? (
            <>
              <p className="font-semibold">{t("recheckTitle")}</p>
              <p className="mt-1">{t("recheckBody", { date: checkedAt, countries: changed.map(nameOf).join(", ") })}</p>
              <ul className="mt-1 flex flex-wrap gap-x-3 text-xs">
                {changed.map((c) => {
                  const href = hubPath(c);
                  return href ? (
                    <li key={c}>
                      <a href={href} className="font-semibold underline underline-offset-2">
                        {nameOf(c)}
                      </a>
                    </li>
                  ) : null;
                })}
              </ul>
              <button
                type="button"
                onClick={() => setCheckedAt(today)}
                className="mt-2 rounded-lg border border-amber-300 px-3 py-1 text-xs font-semibold hover:bg-amber-100"
              >
                {t("recheckDone")}
              </button>
            </>
          ) : (
            <p>{t("recheckNone", { date: checkedAt })}</p>
          )}
        </div>
      )}

      <h2 className="mt-6 text-sm font-semibold text-slate-900">{t("travellersTitle")}</h2>
      <ol className="mt-2 space-y-3">
        {travellers.map((tr, i) => (
          <li key={i} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[10rem_minmax(0,1fr)_10rem_auto] sm:items-end">
            <div>
              <label className={labelClass} htmlFor={`rd-name-${i}`}>
                {t("travellerName")}
              </label>
              <input
                id={`rd-name-${i}`}
                type="text"
                className={inputClass}
                placeholder={t("travellerNamePlaceholder", { n: i + 1 })}
                value={tr.name}
                onChange={(e) => updateTraveller(i, { name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`rd-nat-${i}`}>
                {t("passportLabel")}
              </label>
              <SearchableSelect
                id={`rd-nat-${i}`}
                data-testid={`rd-nat-${i}`}
                value={tr.nationality}
                onChange={(v) => updateTraveller(i, { nationality: v })}
                placeholder={tc("fromPlaceholder")}
                noResultsLabel={tc("noMatches")}
                groups={[{ options: publishedNationalities.map((n) => ({ value: n.nationality, label: n.name })) }]}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`rd-expiry-${i}`}>
                {t("expiryLabel")}
              </label>
              <input
                id={`rd-expiry-${i}`}
                data-testid={`rd-expiry-${i}`}
                type="date"
                className={inputClass}
                value={tr.passportExpiry}
                onChange={(e) => updateTraveller(i, { passportExpiry: e.target.value })}
              />
            </div>
            <button
              type="button"
              aria-label={t("removeTraveller", { n: i + 1 })}
              onClick={() => setTravellers((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : [emptyTraveller()]))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-red-600"
            >
              ×
            </button>
          </li>
        ))}
      </ol>
      {travellers.length < MAX_TRAVELLERS && (
        <button
          type="button"
          data-testid="rd-add-traveller"
          onClick={() => setTravellers((prev) => [...prev, emptyTraveller()])}
          className="mt-3 text-xs font-semibold text-brand-700 underline underline-offset-2"
        >
          {t("addTraveller")}
        </button>
      )}

      <h2 className="mt-6 text-sm font-semibold text-slate-900">{t("routeTitle")}</h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="rd-leave">
            {t("leaveHomeLabel")}
          </label>
          <input id="rd-leave" data-testid="rd-leave" type="date" className={inputClass} value={leaveHome} onChange={(e) => setLeaveHome(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="rd-buffer">
            {t("bufferLabel")}
          </label>
          <select
            id="rd-buffer"
            data-testid="rd-buffer"
            className={inputClass}
            value={bufferWeeks}
            onChange={(e) => setBufferWeeks(Number(e.target.value))}
          >
            {BUFFER_WEEKS.map((n) => (
              <option key={n} value={n}>
                {t("bufferOption", { n })}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ol className="mt-3 space-y-3">
        {stops.map((stop, i) => (
          <li key={i} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_9.5rem_9.5rem_auto] sm:items-end">
            <div>
              <label className={labelClass} htmlFor={`rd-dest-${i}`}>
                {t("stopLabel", { n: i + 1 })}
              </label>
              <SearchableSelect
                id={`rd-dest-${i}`}
                data-testid={`rd-dest-${i}`}
                value={stop.destination}
                onChange={(v) => updateStop(i, { destination: v })}
                placeholder={tc("toPlaceholder")}
                noResultsLabel={tc("noMatches")}
                groups={destinationGroups}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`rd-arrival-${i}`}>
                {t("arrivalLabel")}
              </label>
              <input
                id={`rd-arrival-${i}`}
                data-testid={`rd-arrival-${i}`}
                type="date"
                className={inputClass}
                value={stop.arrival}
                onChange={(e) => updateStop(i, { arrival: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`rd-departure-${i}`}>
                {t("departureLabel")}
              </label>
              <input
                id={`rd-departure-${i}`}
                data-testid={`rd-departure-${i}`}
                type="date"
                className={inputClass}
                value={stop.departure}
                onChange={(e) => updateStop(i, { departure: e.target.value })}
              />
            </div>
            <button
              type="button"
              aria-label={t("removeStop", { n: i + 1 })}
              onClick={() => setStops((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : [emptyStop()]))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-red-600"
            >
              ×
            </button>
          </li>
        ))}
      </ol>
      {stops.length < MAX_STOPS && (
        <button
          type="button"
          data-testid="rd-add-stop"
          onClick={() => setStops((prev) => [...prev, emptyStop()])}
          className="mt-3 text-xs font-semibold text-brand-700 underline underline-offset-2"
        >
          {t("addStop")}
        </button>
      )}
      <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" data-testid="rd-remember" checked={remember} onChange={(e) => toggleRemember(e.target.checked)} />
        {t("saveLabel")}
      </label>
      <p className="mt-1 text-[11px] text-slate-500">{remember && checkedAt ? t("savedNote", { date: checkedAt }) : t("privacy")}</p>

      {result.travellers.length > 0 && (
        <div className="mt-8 space-y-6" data-testid="rd-results">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" data-testid="rd-timeline">
            <h2 className="text-sm font-semibold text-slate-900">{t("timelineTitle")}</h2>
            {result.actions.length === 0 ? (
              <p className="mt-1 text-sm text-slate-700">{t("noActions")}</p>
            ) : (
              <>
                <ol className="mt-2 space-y-3">
                  {result.actions.map((a) => {
                    const status = a.kind === "form_window" ? t(`windowStatus.${a.status}`) : t(`status.${a.status}`);
                    return (
                      <li key={a.id} className="text-sm" data-testid="rd-action">
                        <p className="font-semibold text-slate-900">
                          {actionTitle(a)}
                          {status && <span className={`ml-2 text-xs font-semibold ${STATUS_STYLES[a.status]}`}>{status}</span>}
                        </p>
                        {a.recommended && <p className="text-slate-800">{t("recommended", { date: a.recommended })}</p>}
                        <p className="text-slate-700" data-testid="rd-legal">
                          {legalText(a)}
                        </p>
                        {a.kind === "passport" && <p className="text-xs text-red-800">{t("passportFix")}</p>}
                        {a.line && <p className="mt-0.5 text-xs text-slate-500">“{a.line}”</p>}
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-3 text-xs text-slate-500">{t("recommendedNote", { weeks: bufferWeeks, travel: result.travel })}</p>
                <p className="mt-1 text-xs text-slate-500">{t("authorisationGuides")}</p>
                <button
                  type="button"
                  data-testid="rd-calendar"
                  onClick={addToCalendar}
                  className="mt-3 rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800"
                >
                  {t("calendarButton")}
                </button>
              </>
            )}
          </section>

          <h2 className="font-display text-lg font-bold text-slate-900">{t("stopsTitle")}</h2>
          {result.travellers.map((tr) =>
            tr.stops.map((stop) => {
              const href = hubPath(stop.destination);
              return (
                <section key={`${tr.name}-${stop.destination}-${stop.arrival}`} className="rounded-2xl border border-slate-200 p-4" data-testid="rd-stop">
                  <h3 className="text-base font-semibold text-slate-900">
                    {t("stopHeading", { traveller: tr.name, country: stop.destinationName })}
                  </h3>
                  <p className="text-xs text-slate-500">{t("stopDates", { arrival: stop.arrival, departure: stop.departure })}</p>
                  {stop.covered ? (
                    <>
                      <p className="mt-2 text-sm font-medium text-slate-800">{tc(`routeBasis.${stop.basis}`)}</p>
                      <StopStatus status={stop.passport} />
                      {stop.basis !== "citizen" && stop.basis !== "free_movement" && (
                        <>
                          <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("documentsTitle")}</h4>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {stop.documentsNeeded.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                          {stop.notes && <p className="mt-2 text-xs leading-relaxed text-slate-600">{stop.notes}</p>}
                          {chargesForDestination(stop.destination).length > 0 && (
                            <>
                              <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("chargesTitle")}</h4>
                              <p className="mt-1 text-xs text-slate-600">{t("chargesNote", { country: stop.destinationName })}</p>
                              <TripChargeList charges={chargesForDestination(stop.destination)} compact />
                            </>
                          )}
                        </>
                      )}
                      {stop.legalSource && (
                        <SourceNote
                          className="mt-3"
                          name={stop.legalSource.name}
                          url={stop.legalSource.url}
                          date={stop.verifiedAt}
                          sourceLabel={tc("sourceLabel")}
                          checkedLabel={stop.verifiedAt ? tc("checkedOn", { date: stop.verifiedAt }) : undefined}
                        />
                      )}
                    </>
                  ) : (
                    <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" data-testid="rd-not-covered">
                      {t("notCovered", { country: stop.destinationName })}
                      {stop.officialAuthorityUrl && (
                        <>
                          {" "}
                          <a href={stop.officialAuthorityUrl} className="underline" rel="noopener noreferrer" target="_blank">
                            {t("officialSource")}
                          </a>
                        </>
                      )}
                    </p>
                  )}
                  {href && (
                    <a href={href} className="mt-2 inline-block text-xs font-semibold text-brand-700 underline underline-offset-2">
                      {t("fullRules", { country: stop.destinationName })}
                    </a>
                  )}
                </section>
              );
            }),
          )}
          <p className="text-xs text-slate-500">{t("disclaimer")}</p>
        </div>
      )}
    </section>
  );
}
