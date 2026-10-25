"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { engineContext, schengenCountries } from "../lib/countries";
import { countDays, type CounterTrip, type DestinationCount } from "../lib/day-counter";
import { destinations } from "../lib/destination-index";
import { publishedNationalities } from "../lib/nationalities";
import SearchableSelect from "./SearchableSelect";
import SourceNote from "./SourceNote";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none";
const labelClass = "block text-xs font-medium text-slate-600";

/** Today's date as YYYY-MM-DD from the user's calendar (date-only, §13.1). */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const schengenSet = new Set(schengenCountries.map((c) => c.code));

export default function DayCounter() {
  const t = useTranslations("dayCounter");
  const tc = useTranslations("tripCheck");
  const [nationality, setNationality] = useState("");
  const [onDate, setOnDate] = useState("");
  const [trips, setTrips] = useState<CounterTrip[]>([{ destination: "", entry: "", exit: "" }]);
  const [engine, setEngine] = useState<typeof import("../lib/trip-engine") | null>(null);

  useEffect(() => {
    setOnDate(todayISO());
    let live = true;
    void import("../lib/trip-engine").then((m) => {
      if (live) setEngine(m);
    });
    return () => {
      live = false;
    };
  }, []);

  const results: DestinationCount[] = useMemo(() => {
    if (!engine || !nationality || !onDate) return [];
    try {
      return countDays(
        nationality,
        trips,
        onDate,
        (n, d) => engine.resolveTripCheck(n, d, []),
        schengenSet,
        engineContext,
      );
    } catch {
      return [];
    }
  }, [engine, nationality, trips, onDate]);

  const destinationGroups = [
    {
      label: tc("toGroupSchengenStates"),
      options: schengenCountries.map((c) => ({ value: c.code, label: c.name })),
    },
    {
      label: tc("toGroupDestinations"),
      options: destinations.filter((d) => d.status === "verified").map((d) => ({ value: d.code, label: d.name })),
    },
  ];

  const update = (i: number, patch: Partial<CounterTrip>) =>
    setTrips((prev) => prev.map((tr, j) => (j === i ? { ...tr, ...patch } : tr)));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t("subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="dc-nationality">
            {tc("fromLabel")}
          </label>
          <SearchableSelect
            id="dc-nationality"
            data-testid="dc-nationality"
            value={nationality}
            onChange={setNationality}
            placeholder={tc("fromPlaceholder")}
            noResultsLabel={tc("noMatches")}
            groups={[{ options: publishedNationalities.map((n) => ({ value: n.nationality, label: n.name })) }]}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="dc-on-date">
            {t("onDateLabel")}
          </label>
          <input id="dc-on-date" data-testid="dc-on-date" type="date" className={inputClass} value={onDate} onChange={(e) => setOnDate(e.target.value)} />
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">{t("tripsTitle")}</h2>
      <ul className="mt-2 space-y-3">
        {trips.map((trip, i) => (
          <li key={i} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_9rem_9rem_auto] sm:items-end" data-testid="dc-trip">
            <div>
              <label className={labelClass} htmlFor={`dc-dest-${i}`}>
                {t("countryLabel")}
              </label>
              <SearchableSelect
                id={`dc-dest-${i}`}
                data-testid={`dc-dest-${i}`}
                value={trip.destination}
                onChange={(v) => update(i, { destination: v })}
                placeholder={tc("toPlaceholder")}
                noResultsLabel={tc("noMatches")}
                groups={destinationGroups}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`dc-entry-${i}`}>
                {t("entryLabel")}
              </label>
              <input id={`dc-entry-${i}`} data-testid={`dc-entry-${i}`} type="date" className={inputClass} value={trip.entry} onChange={(e) => update(i, { entry: e.target.value })} />
            </div>
            <div>
              <label className={labelClass} htmlFor={`dc-exit-${i}`}>
                {t("exitLabel")}
              </label>
              <input id={`dc-exit-${i}`} data-testid={`dc-exit-${i}`} type="date" className={inputClass} value={trip.exit} onChange={(e) => update(i, { exit: e.target.value })} />
            </div>
            <button
              type="button"
              aria-label={t("removeTrip", { n: i + 1 })}
              onClick={() => setTrips((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : [{ destination: "", entry: "", exit: "" }]))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-red-600"
            >
              ×
            </button>
            {trip.entry && trip.exit && trip.exit < trip.entry && (
              <p className="text-xs text-red-700 sm:col-span-4">{t("reversed")}</p>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        data-testid="dc-add-trip"
        onClick={() => setTrips((prev) => [...prev, { destination: "", entry: "", exit: "" }])}
        className="mt-3 text-xs font-semibold text-brand-700 underline underline-offset-2"
      >
        {t("addTrip")}
      </button>
      <p className="mt-2 text-[11px] text-slate-500">{t("privacy")}</p>

      {results.length > 0 && (
        <div className="mt-6 space-y-4" data-testid="dc-results">
          {results.map((r) => (
            <ResultCard key={r.kind === "schengen" ? "SCHENGEN" : r.destination} r={r} />
          ))}
          <p className="text-xs text-slate-500">{t("disclaimer")}</p>
        </div>
      )}
    </section>
  );
}

function Verdict({ ok }: { ok: boolean }) {
  const t = useTranslations("dayCounter");
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ok ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}
      data-testid="dc-verdict"
    >
      {ok ? t("withinLimit") : t("overLimit")}
    </span>
  );
}

function ResultCard({ r }: { r: DestinationCount }) {
  const t = useTranslations("dayCounter");
  const tc = useTranslations("tripCheck");
  if (r.kind === "schengen") {
    return (
      <section className="rounded-2xl border border-slate-200 p-4" data-testid="dc-card">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-bold text-slate-900">{t("schengenTitle")}</h3>
          <Verdict ok={r.compliant} />
        </div>
        <p className="mt-1 text-sm text-slate-700">{tc("stayRollingWindow", { maxDays: 90, windowDays: 180 })}</p>
        <p className="mt-2 text-sm text-slate-800" data-testid="dc-schengen-used">
          {t("schengenUsed", { date: r.onDate, used: r.daysUsedOnDate, remaining: r.daysRemainingOnDate })}
        </p>
        {r.firstViolationDay && <p className="mt-1 text-sm text-red-700">{t("schengenViolation", { date: r.firstViolationDay })}</p>}
        <a href="/calculator" className="mt-2 inline-block text-xs font-semibold text-brand-700 underline underline-offset-2">
          {t("calculatorLink")}
        </a>
      </section>
    );
  }
  if (r.kind === "not_covered") {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" data-testid="dc-card">
        {t("notCovered", { country: r.destinationName })}
      </section>
    );
  }
  if (r.kind === "no_count") {
    return (
      <section className="rounded-2xl border border-slate-200 p-4" data-testid="dc-card">
        <h3 className="font-display text-base font-bold text-slate-900">{r.destinationName}</h3>
        <p className="mt-1 text-sm text-slate-700">{r.basis === "visa_required"
            ? tc("stayVisaRequired")
            : r.basis === "citizen" || r.basis === "free_movement"
              ? t("noCount")
              : tc("stayUnconfirmed")}</p>
        {r.legalSource && (
          <SourceNote className="mt-2" name={r.legalSource.name} url={r.legalSource.url} date={r.verifiedAt} sourceLabel={tc("sourceLabel")} checkedLabel={r.verifiedAt ? tc("checkedOn", { date: r.verifiedAt }) : undefined} />
        )}
      </section>
    );
  }
  const p = r.policy;
  const rule =
    p.kind === "fixed_per_entry"
      ? tc("stayFixedPerEntry", { maxDays: p.maxDays })
      : p.maxDaysPerEntry
        ? tc("stayRollingWindowPerEntry", { perEntry: p.maxDaysPerEntry, maxDays: p.maxDays, windowDays: p.windowDays })
        : tc("stayRollingWindow", { maxDays: p.maxDays, windowDays: p.windowDays });
  return (
    <section className="rounded-2xl border border-slate-200 p-4" data-testid="dc-card">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-base font-bold text-slate-900">{r.destinationName}</h3>
        <Verdict ok={r.result.compliant} />
      </div>
      <p className="mt-1 text-sm text-slate-700">{rule}</p>
      <ul className="mt-2 space-y-1 text-sm text-slate-800">
        {r.result.stays.map((s) => (
          <li key={`${s.entry}-${s.exit}`} data-testid="dc-stay">
            {t("stayLine", { entry: s.entry, exit: s.exit, days: s.days })}
            {s.overPerEntry > 0 && <span className="ml-1 font-semibold text-red-700">{t("overBy", { days: s.overPerEntry })}</span>}
          </li>
        ))}
      </ul>
      {p.kind === "rolling_window" && r.result.peakInWindow !== undefined && (
        <p className="mt-1 text-sm text-slate-700">{t("peak", { days: r.result.peakInWindow, windowDays: p.windowDays })}</p>
      )}
      {r.result.firstWindowViolation && <p className="mt-1 text-sm text-red-700">{t("windowViolation", { date: r.result.firstWindowViolation })}</p>}
      {r.legalSource && (
        <SourceNote className="mt-2" name={r.legalSource.name} url={r.legalSource.url} date={r.verifiedAt} sourceLabel={tc("sourceLabel")} checkedLabel={r.verifiedAt ? tc("checkedOn", { date: r.verifiedAt }) : undefined} />
      )}
    </section>
  );
}
