"use client";

import {
  EngineError,
  addDays,
  buildPresence,
  checkTimeline,
  isValidISODate,
  maxStay,
  nextEntry,
  planTrip,
  status,
  toEpochDay,
  type TimelineResult,
  type MaxStayResult,
  type NextEntryResult,
  type PlanTripResult,
  type StatusResult,
  type Trip,
} from "@borderline/engine";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  countriesVerifiedAt,
  countryName,
  engineContext,
  nonSchengenCountries,
  schengenCountries,
} from "../lib/countries";
import { decodeShareState, encodeShareState } from "../lib/share";

const OFFICIAL_CALCULATOR_URL =
  "https://ec.europa.eu/assets/home/visa-calculator/calculator.htm?lang=en";
const MANUAL_URL =
  "https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf";

interface TripRow {
  id: number;
  entry: string;
  exit: string;
  /** ISO country code, or "" = Schengen Area, country unspecified. */
  country: string;
  /** Stay under a residence permit / long-stay (D) visa issued by `country`. */
  permit: boolean;
}

/** The user's local calendar date — their "today" at the border. */
function localTodayISO(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Unspecified country = "ZZ" (Schengen Area, country unspecified) — the
 * engine counts those days like any current Schengen member. Picking a real
 * country activates non-Schengen exclusion and per-date accession handling
 * from the verified dataset; the permit flag marks the stay as excluded under
 * a residence permit / D visa issued by that country. */
function toTrip(row: TripRow): Trip {
  const country = row.country || "ZZ";
  return {
    entry: row.entry,
    exit: row.exit,
    country,
    basis:
      row.permit && row.country
        ? { kind: "d_visa_or_permit", issuingCountry: row.country }
        : { kind: "visa_free" },
  };
}

function rowIsComplete(row: TripRow): boolean {
  return isValidISODate(row.entry) && isValidISODate(row.exit);
}

function rowHasOrderError(row: TripRow): boolean {
  return rowIsComplete(row) && row.entry > row.exit;
}

interface ForecastEntry {
  entry: string;
  result: MaxStayResult;
}

interface Results {
  status: StatusResult;
  maxStay: MaxStayResult;
  plan: PlanTripResult | null;
  planEarliest: NextEntryResult | null;
  /** Epoch days with counted presence — drives the 180-day window strip. */
  presence: ReadonlySet<number>;
  /** Forward planner: longest stay for a handful of upcoming entry dates. */
  forecast: ForecastEntry[];
  /** "When can I stay N days?" answer, null while N is invalid. */
  finder: NextEntryResult | null;
  /** Compliance of the entered trips themselves, across the whole timeline. */
  timeline: TimelineResult;
}

/** Colors validated with the dataviz palette checker (see git history). */
const STRIP_COUNTED = "#3767a8";
const STRIP_PLANNED = "#d97706";

const FORECAST_OFFSETS = [0, 7, 14, 30, 45, 60, 90];

const STORAGE_KEY = "borderline.calculator.v1";

interface StoredState {
  trips: Array<{ entry: string; exit: string; country: string; permit: boolean }>;
  planEntry: string;
  planExit: string;
  desiredStay: string;
}

let nextRowId = 1;
function newRow(entry = "", exit = "", country = "", permit = false): TripRow {
  return { id: nextRowId++, entry, exit, country, permit };
}

const KNOWN_CODES = new Set(
  [...schengenCountries, ...nonSchengenCountries].map((c) => c.code),
);

export default function Calculator() {
  const t = useTranslations("calc");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<TripRow[]>([newRow()]);
  const [refDate, setRefDate] = useState("");
  const [planEntry, setPlanEntry] = useState("");
  const [planExit, setPlanExit] = useState("");
  const [desiredStay, setDesiredStay] = useState("90");
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);

  useEffect(() => {
    const decoded = decodeShareState(window.location.search, KNOWN_CODES);
    if (decoded.trips && decoded.trips.length > 0) {
      // A shared link wins over anything stored on this device.
      setRows(decoded.trips.map((t) => newRow(t.entry, t.exit, t.country, t.permit)));
      if (decoded.planEntry) setPlanEntry(decoded.planEntry);
      if (decoded.planExit) setPlanExit(decoded.planExit);
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as StoredState;
          if (stored.trips.length > 0) {
            setRows(
              stored.trips.map((t) => newRow(t.entry, t.exit, t.country, t.permit)),
            );
          }
          setPlanEntry(stored.planEntry ?? "");
          setPlanExit(stored.planExit ?? "");
          if (stored.desiredStay) setDesiredStay(stored.desiredStay);
          setSaveEnabled(true);
        }
      } catch {
        // Corrupt or unavailable storage: start fresh.
      }
    }
    setRefDate(decoded.refDate ?? localTodayISO());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      if (saveEnabled) {
        const stored: StoredState = {
          trips: rows
            .filter(rowIsComplete)
            .map(({ entry, exit, country, permit }) => ({ entry, exit, country, permit })),
          planEntry,
          planExit,
          desiredStay,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (private mode quota etc.) — saving is best-effort.
    }
  }, [mounted, saveEnabled, rows, planEntry, planExit, desiredStay]);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    [locale],
  );
  const formatDate = (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`));

  const trips = useMemo(
    () => rows.filter((r) => rowIsComplete(r) && !rowHasOrderError(r)).map(toTrip),
    [rows],
  );

  const planComplete =
    isValidISODate(planEntry) && isValidISODate(planExit) && planEntry <= planExit;

  const desiredStayDays = /^\d+$/.test(desiredStay) ? Number(desiredStay) : NaN;
  const desiredStayValid =
    Number.isInteger(desiredStayDays) && desiredStayDays >= 1 && desiredStayDays <= 90;

  const results = useMemo((): { data: Results | null; error: string | null } => {
    if (!mounted || !isValidISODate(refDate)) return { data: null, error: null };
    try {
      const s = status(trips, refDate, engineContext);
      const ms = maxStay(trips, refDate, engineContext);
      let plan: PlanTripResult | null = null;
      let planEarliest: NextEntryResult | null = null;
      if (planComplete) {
        plan = planTrip(trips, planEntry, planExit, engineContext);
        if (!plan.compliant && plan.tripLengthDays <= 90) {
          planEarliest = nextEntry(trips, plan.tripLengthDays, planEntry, engineContext);
        }
      }
      const { presence } = buildPresence(trips, engineContext);
      const forecast = FORECAST_OFFSETS.map((offset) => {
        const entry = addDays(refDate, offset);
        return { entry, result: maxStay(trips, entry, engineContext) };
      });
      const finder = desiredStayValid
        ? nextEntry(trips, desiredStayDays, refDate, engineContext)
        : null;
      const timeline = checkTimeline(trips, engineContext);
      return {
        data: { status: s, maxStay: ms, plan, planEarliest, presence, forecast, finder, timeline },
        error: null,
      };
    } catch (e) {
      return { data: null, error: e instanceof EngineError ? e.message : String(e) };
    }
  }, [mounted, trips, refDate, planComplete, planEntry, planExit, desiredStayValid, desiredStayDays]);

  const updateRow = (id: number, patch: Partial<TripRow>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setCopied(false);
  };

  const share = async () => {
    const query = encodeShareState({
      trips: rows.filter(rowIsComplete),
      refDate,
      planEntry,
      planExit,
    });
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.replaceState(null, "", `?${query}`);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard unavailable (permissions/insecure context): the URL bar
      // already carries the link, so sharing still works by copying it there.
    }
  };

  const reset = () => {
    setRows([newRow()]);
    setRefDate(localTodayISO());
    setPlanEntry("");
    setPlanExit("");
    setDesiredStay("90");
    setCopied(false);
    setReportCopied(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const addPlanToTrips = () => {
    setRows((rs) => [
      ...rs.filter((r) => r.entry !== "" || r.exit !== ""),
      newRow(planEntry, planExit),
    ]);
    setPlanEntry("");
    setPlanExit("");
  };

  const copyReport = async () => {
    if (!results.data) return;
    const s = results.data.status;
    const ms = results.data.maxStay;
    const lines: string[] = [
      t("report.title", { date: formatDate(localTodayISO()) }),
      "",
      t("report.staysHeading"),
      ...rows.filter((r) => rowIsComplete(r) && !rowHasOrderError(r)).map((r) => {
        const days = toEpochDay(r.exit) - toEpochDay(r.entry) + 1;
        const base = t("report.stayLine", {
          entry: formatDate(r.entry),
          exit: formatDate(r.exit),
          days,
          country: r.country ? countryName(r.country) : t("countryUnspecified"),
        });
        return r.permit ? `${base} ${t("report.permitSuffix")}` : base;
      }),
      "",
      t("statusSentence", {
        start: formatDate(s.windowStart),
        end: formatDate(s.onDate),
        used: s.daysUsed,
        remaining: s.daysRemaining,
      }),
      ...(ms.maxDays > 0 && ms.lastAllowedDay
        ? [
            t("maxStaySentence", {
              entry: formatDate(ms.entry),
              exit: formatDate(ms.lastAllowedDay),
              days: ms.maxDays,
            }),
          ]
        : []),
      t("nextSafeEntry", { date: formatDate(s.nextSafeEntry) }),
      "",
      t("report.disclaimer"),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setReportCopied(true);
    } catch {
      // Clipboard unavailable — nothing sensible to do without it.
    }
  };

  if (!mounted) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-100" aria-hidden />;
  }

  const inputClass =
    "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
  const labelClass = "block text-xs font-medium text-slate-600";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-slate-700">
        <h2 className="mb-1 font-semibold text-slate-900">{t("scopeTitle")}</h2>
        <p>{t("scopeNote")}</p>
        <p className="mt-2 text-xs text-slate-500">
          <a href={MANUAL_URL} rel="noopener noreferrer" className="underline">
            {t("scopeSource")}
          </a>
          <br />
          {t("dataChecked", { date: countriesVerifiedAt })}{" "}
          <a href="/changelog#dataset-countries" className="underline">
            {t("updateHistory")}
          </a>
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          {t("pastTripsTitle")}
        </h2>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id}>
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <label className={labelClass} htmlFor={`entry-${row.id}`}>
                    {t("entry")}
                  </label>
                  <input
                    id={`entry-${row.id}`}
                    type="date"
                    className={inputClass}
                    value={row.entry}
                    onChange={(e) => updateRow(row.id, { entry: e.target.value })}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className={labelClass} htmlFor={`exit-${row.id}`}>
                    {t("exit")}
                  </label>
                  <input
                    id={`exit-${row.id}`}
                    type="date"
                    className={inputClass}
                    value={row.exit}
                    onChange={(e) => updateRow(row.id, { exit: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  aria-label={t("removeTrip")}
                  onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== row.id) : [newRow()]))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 hover:border-red-200 hover:text-red-500"
                >
                  ×
                </button>
              </div>
              <div className="mt-2">
                <label className={labelClass} htmlFor={`country-${row.id}`}>
                  {t("country")}
                </label>
                <select
                  id={`country-${row.id}`}
                  className={inputClass}
                  value={row.country}
                  onChange={(e) =>
                    updateRow(row.id, {
                      country: e.target.value,
                      ...(e.target.value === "" ? { permit: false } : {}),
                    })
                  }
                >
                  <option value="">{t("countryUnspecified")}</option>
                  <optgroup label={t("countryGroupSchengen")}>
                    {schengenCountries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={t("countryGroupNonSchengen")}>
                    {nonSchengenCountries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <label
                className={`mt-2 flex items-start gap-2 text-xs ${
                  row.country ? "text-slate-600" : "text-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5"
                  disabled={!row.country}
                  checked={row.permit}
                  onChange={(e) => updateRow(row.id, { permit: e.target.checked })}
                />
                <span>{t("permitLabel")}</span>
              </label>
              {row.permit ? (
                <p className="mt-1 text-xs text-slate-500">{t("permitHint")}</p>
              ) : null}
              {rowIsComplete(row) && !rowHasOrderError(row) ? (
                <p className="mt-1 text-xs text-slate-500">
                  {t("rowDayCount", {
                    days: toEpochDay(row.exit) - toEpochDay(row.entry) + 1,
                  })}
                </p>
              ) : null}
              {rowHasOrderError(row) ? (
                <p className="mt-1 text-xs text-red-600">{t("rowOrderError")}</p>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow()])}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {t("addTrip")}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-800"
          >
            {t("reset")}
          </button>
        </div>
        <div className="mt-4">
          <label className={labelClass} htmlFor="refDate">
            {t("checkDateLabel")}
          </label>
          <input
            id="refDate"
            type="date"
            className={inputClass}
            value={refDate}
            onChange={(e) => setRefDate(e.target.value)}
          />
        </div>
        <label className="mt-4 flex items-start gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={saveEnabled}
            onChange={(e) => setSaveEnabled(e.target.checked)}
          />
          <span>
            {t("saveLabel")}{" "}
            <span className="text-slate-400">{t("saveHint")}</span>
          </span>
        </label>
      </section>

      {results.error ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t("computeError", { message: results.error })}
        </section>
      ) : null}

      {results.data && !results.data.timeline.compliant ? (
        <section
          data-testid="timeline-warning"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-900"
        >
          {t("timelineWarning", {
            date: formatDate(results.data.timeline.firstViolationDay!),
          })}
        </section>
      ) : null}

      {results.data ? (
        <StatusCard
          results={results.data}
          formatDate={formatDate}
          onShare={share}
          copied={copied}
          onCopyReport={copyReport}
          reportCopied={reportCopied}
        />
      ) : null}

      {results.data ? (
        <WindowStrip
          presence={results.data.presence}
          refDate={refDate}
          planStart={planComplete ? planEntry : null}
          planEnd={planComplete ? planExit : null}
          formatDate={formatDate}
        />
      ) : null}

      {results.data ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{t("finderTitle")}</h2>
          <p className="mb-3 text-xs text-slate-500">{t("finderHint")}</p>
          <div className="flex items-end gap-3">
            <div>
              <label className={labelClass} htmlFor="desiredStay">
                {t("finderLabel")}
              </label>
              <input
                id="desiredStay"
                type="number"
                min={1}
                max={90}
                inputMode="numeric"
                className={`${inputClass} w-24`}
                value={desiredStay}
                onChange={(e) => setDesiredStay(e.target.value)}
              />
            </div>
            <div className="min-w-0 flex-1 pb-1 text-sm leading-relaxed text-slate-700">
              {results.data.finder ? (
                <p data-testid="finder-result">
                  {t("finderResult", {
                    days: results.data.finder.desiredStay,
                    date: formatDate(results.data.finder.earliestEntry),
                    exit: formatDate(results.data.finder.lastAllowedDay),
                  })}
                </p>
              ) : (
                <p className="text-xs text-red-600">{t("finderInvalid")}</p>
              )}
            </div>
          </div>
          <ForecastList forecast={results.data.forecast} formatDate={formatDate} />
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">{t("planTitle")}</h2>
        <p className="mb-3 text-xs text-slate-500">{t("planHint")}</p>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <label className={labelClass} htmlFor="planEntry">
              {t("planEntry")}
            </label>
            <input
              id="planEntry"
              type="date"
              className={inputClass}
              value={planEntry}
              onChange={(e) => setPlanEntry(e.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className={labelClass} htmlFor="planExit">
              {t("planExit")}
            </label>
            <input
              id="planExit"
              type="date"
              className={inputClass}
              value={planExit}
              onChange={(e) => setPlanExit(e.target.value)}
            />
          </div>
        </div>
        {results.data?.plan ? (
          <PlanResult
            plan={results.data.plan}
            planEarliest={results.data.planEarliest}
            formatDate={formatDate}
            onAddToTrips={addPlanToTrips}
          />
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-600">
        <h2 className="mb-1 font-semibold text-slate-800">{t("estimatedTitle")}</h2>
        <p>{t("estimatedNote")}</p>
        <p className="mt-2">
          <a
            href={OFFICIAL_CALCULATOR_URL}
            rel="noopener noreferrer"
            className="underline hover:text-slate-800"
          >
            {t("officialCalculator")}
          </a>
        </p>
      </section>
    </div>
  );
}

function StatusCard({
  results,
  formatDate,
  onShare,
  copied,
  onCopyReport,
  reportCopied,
}: {
  results: Results;
  formatDate: (iso: string) => string;
  onShare: () => void;
  copied: boolean;
  onCopyReport: () => void;
  reportCopied: boolean;
}) {
  const t = useTranslations("calc");
  const s = results.status;
  const ms = results.maxStay;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{t("statusTitle")}</h2>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <div data-testid="days-used" className="font-display text-3xl font-bold tabular-nums text-slate-900">
            {s.daysUsed}
          </div>
          <div className="text-xs text-slate-500">{t("daysUsed")}</div>
        </div>
        <div
          className={`rounded-xl p-3 text-center ${
            s.overstayDays > 0 ? "bg-red-50" : "bg-emerald-50"
          }`}
        >
          <div
            data-testid="days-remaining"
            className={`font-display text-3xl font-bold tabular-nums ${
              s.overstayDays > 0 ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {s.daysRemaining}
          </div>
          <div className="text-xs text-slate-500">{t("daysRemaining")}</div>
        </div>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-slate-700">
        <p>
          {t("statusSentence", {
            start: formatDate(s.windowStart),
            end: formatDate(s.onDate),
            used: s.daysUsed,
            remaining: s.daysRemaining,
          })}
        </p>
        {s.overstayDays > 0 ? (
          <p data-testid="overstay-warning" className="font-medium text-red-700">
            {t("overstayWarning", { days: s.overstayDays })}
          </p>
        ) : null}
        {ms.maxDays > 0 && ms.lastAllowedDay ? (
          <p>
            {t("maxStaySentence", {
              entry: formatDate(ms.entry),
              exit: formatDate(ms.lastAllowedDay),
              days: ms.maxDays,
            })}
          </p>
        ) : (
          <p className="font-medium text-red-700">
            {t("maxStayBlocked", { entry: formatDate(ms.entry) })}
          </p>
        )}
        <p className="text-slate-500">
          {t("nextSafeEntry", { date: formatDate(s.nextSafeEntry) })}
        </p>
        {s.exclusions.map((ex, i) => (
          <p key={i} data-testid="exclusion-note" className="text-xs text-slate-500">
            {ex.reason === "pre_accession_days"
              ? t("exclusionPreAccession", {
                  country: countryName(ex.trip.country),
                  days: ex.daysExcluded,
                })
              : ex.reason === "residence_permit_issuing_state"
                ? t("exclusionPermit", {
                    country: countryName(ex.trip.country),
                    days: ex.daysExcluded,
                  })
                : t("exclusionNonSchengen", {
                    country: countryName(ex.trip.country),
                    days: ex.daysExcluded,
                  })}
          </p>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onShare}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("share")}
        </button>
        <button
          type="button"
          onClick={onCopyReport}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("report.button")}
        </button>
      </div>
      {copied ? <p className="mt-2 text-xs text-emerald-700">{t("shareCopied")}</p> : null}
      {reportCopied ? (
        <p data-testid="report-copied" className="mt-2 text-xs text-emerald-700">
          {t("report.copied")}
        </p>
      ) : null}
    </section>
  );
}

/** 180-day rolling window as one cell per day (mark colors validated for CVD). */
function WindowStrip({
  presence,
  refDate,
  planStart,
  planEnd,
  formatDate,
}: {
  presence: ReadonlySet<number>;
  refDate: string;
  planStart: string | null;
  planEnd: string | null;
  formatDate: (iso: string) => string;
}) {
  const t = useTranslations("calc");
  const end = toEpochDay(refDate);
  const start = end - 179;
  const planFrom = planStart ? toEpochDay(planStart) : null;
  const planTo = planEnd ? toEpochDay(planEnd) : null;

  const cells = [];
  for (let d = start; d <= end; d++) {
    const counted = presence.has(d);
    const planned =
      !counted && planFrom !== null && planTo !== null && d >= planFrom && d <= planTo;
    const date = formatDate(addDays(refDate, d - end));
    const state = counted
      ? t("stripStateCounted")
      : planned
        ? t("stripStatePlanned")
        : t("stripStateFree");
    cells.push(
      <div
        key={d}
        title={`${date} — ${state}`}
        className="h-3 rounded-[2px]"
        style={{
          backgroundColor: counted
            ? STRIP_COUNTED
            : planned
              ? STRIP_PLANNED
              : "var(--color-slate-100)",
        }}
      />,
    );
  }

  return (
    <section
      data-testid="window-strip"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-slate-900">{t("stripTitle")}</h2>
      <p className="mb-3 text-xs text-slate-500">
        {t("stripCaption", {
          start: formatDate(addDays(refDate, -179)),
          end: formatDate(refDate),
        })}
      </p>
      <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[2px]">{cells}</div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: STRIP_COUNTED }}
          />
          {t("stripLegendCounted")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: STRIP_PLANNED }}
          />
          {t("stripLegendPlanned")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] border border-slate-200 bg-slate-100" />
          {t("stripLegendFree")}
        </span>
      </div>
    </section>
  );
}

/** Forward planner: the longest compliant stay for upcoming entry dates. */
function ForecastList({
  forecast,
  formatDate,
}: {
  forecast: ForecastEntry[];
  formatDate: (iso: string) => string;
}) {
  const t = useTranslations("calc");
  return (
    <div className="mt-4" data-testid="forecast">
      <h3 className="text-xs font-semibold text-slate-700">{t("forecastTitle")}</h3>
      <ul className="mt-2 divide-y divide-slate-100 text-sm text-slate-700">
        {forecast.map(({ entry, result }) => (
          <li key={entry} className="flex items-baseline justify-between gap-3 py-1.5">
            <span className="text-slate-500">{formatDate(entry)}</span>
            <span className="text-right">
              {result.maxDays > 0 && result.lastAllowedDay
                ? t("forecastRow", {
                    days: result.maxDays,
                    exit: formatDate(result.lastAllowedDay),
                  })
                : t("forecastRowBlocked")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanResult({
  plan,
  planEarliest,
  formatDate,
  onAddToTrips,
}: {
  plan: PlanTripResult;
  planEarliest: NextEntryResult | null;
  formatDate: (iso: string) => string;
  onAddToTrips: () => void;
}) {
  const t = useTranslations("calc");

  if (plan.compliant) {
    return (
      <div
        data-testid="plan-result"
        className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-900"
      >
        <p>
          {t("planCompliant", {
            days: plan.tripLengthDays,
            entry: formatDate(plan.entry),
            exit: formatDate(plan.exit),
            remaining: plan.daysRemainingAfterTrip,
          })}
        </p>
        <button
          type="button"
          onClick={onAddToTrips}
          className="mt-2 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
        >
          {t("planAddToTrips")}
        </button>
      </div>
    );
  }

  return (
    <div
      data-testid="plan-result"
      className="mt-3 space-y-2 rounded-xl bg-red-50 p-3 text-sm leading-relaxed text-red-900"
    >
      {plan.latestSafeExit ? (
        <p>
          {t("planViolation", {
            violation: formatDate(plan.firstViolationDay!),
            entry: formatDate(plan.entry),
            exit: formatDate(plan.latestSafeExit),
          })}
        </p>
      ) : (
        <p>{t("planNoEntry", { entry: formatDate(plan.entry) })}</p>
      )}
      {planEarliest ? (
        <p className="font-medium">
          {t("planEarliestEntry", {
            days: planEarliest.desiredStay,
            date: formatDate(planEarliest.earliestEntry),
          })}
        </p>
      ) : null}
    </div>
  );
}
