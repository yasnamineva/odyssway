"use client";

import {
  EngineError,
  isValidISODate,
  maxStay,
  nextEntry,
  planTrip,
  status,
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
 * from the verified dataset. */
function toTrip(row: TripRow): Trip {
  return {
    entry: row.entry,
    exit: row.exit,
    country: row.country || "ZZ",
    basis: { kind: "visa_free" },
  };
}

function rowIsComplete(row: TripRow): boolean {
  return isValidISODate(row.entry) && isValidISODate(row.exit);
}

function rowHasOrderError(row: TripRow): boolean {
  return rowIsComplete(row) && row.entry > row.exit;
}

interface Results {
  status: StatusResult;
  maxStay: MaxStayResult;
  plan: PlanTripResult | null;
  planEarliest: NextEntryResult | null;
}

let nextRowId = 1;
function newRow(entry = "", exit = "", country = ""): TripRow {
  return { id: nextRowId++, entry, exit, country };
}

const KNOWN_CODES = new Set(
  [...schengenCountries, ...nonSchengenCountries].map((c) => c.code),
);

/** URL-encoded state (§6.5): dates live in the link, nothing on our servers. */
function encodeState(rows: TripRow[], refDate: string, planEntry: string, planExit: string): string {
  const params = new URLSearchParams();
  const t = rows
    .filter(rowIsComplete)
    .map((r) => (r.country ? `${r.entry}.${r.exit}.${r.country}` : `${r.entry}.${r.exit}`))
    .join("~");
  if (t) params.set("t", t);
  params.set("d", refDate);
  if (planEntry) params.set("pe", planEntry);
  if (planExit) params.set("px", planExit);
  return params.toString();
}

function decodeState(search: string): {
  rows: TripRow[] | null;
  refDate: string | null;
  planEntry: string | null;
  planExit: string | null;
} {
  const params = new URLSearchParams(search);
  const rows =
    params
      .get("t")
      ?.split("~")
      .map((pair) => pair.split("."))
      .filter(
        (p) =>
          (p.length === 2 || p.length === 3) &&
          isValidISODate(p[0]!) &&
          isValidISODate(p[1]!),
      )
      .map((p) =>
        newRow(p[0]!, p[1]!, p[2] !== undefined && KNOWN_CODES.has(p[2]) ? p[2] : ""),
      ) ?? null;
  const date = (key: string) => {
    const v = params.get(key);
    return v !== null && isValidISODate(v) ? v : null;
  };
  return { rows, refDate: date("d"), planEntry: date("pe"), planExit: date("px") };
}

export default function Calculator() {
  const t = useTranslations("calc");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<TripRow[]>([newRow()]);
  const [refDate, setRefDate] = useState("");
  const [planEntry, setPlanEntry] = useState("");
  const [planExit, setPlanExit] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const decoded = decodeState(window.location.search);
    if (decoded.rows && decoded.rows.length > 0) setRows(decoded.rows);
    setRefDate(decoded.refDate ?? localTodayISO());
    if (decoded.planEntry) setPlanEntry(decoded.planEntry);
    if (decoded.planExit) setPlanExit(decoded.planExit);
    setMounted(true);
  }, []);

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
      return { data: { status: s, maxStay: ms, plan, planEarliest }, error: null };
    } catch (e) {
      return { data: null, error: e instanceof EngineError ? e.message : String(e) };
    }
  }, [mounted, trips, refDate, planComplete, planEntry, planExit]);

  const updateRow = (id: number, patch: Partial<TripRow>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setCopied(false);
  };

  const share = async () => {
    const query = encodeState(rows, refDate, planEntry, planExit);
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.replaceState(null, "", `?${query}`);
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  const reset = () => {
    setRows([newRow()]);
    setRefDate(localTodayISO());
    setPlanEntry("");
    setPlanExit("");
    setCopied(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  if (!mounted) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-100" aria-hidden />;
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
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
          {t("dataChecked", { date: countriesVerifiedAt })}
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
                <div className="flex-1">
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
                <div className="flex-1">
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
                  onChange={(e) => updateRow(row.id, { country: e.target.value })}
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
      </section>

      {results.error ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t("computeError", { message: results.error })}
        </section>
      ) : null}

      {results.data ? (
        <StatusCard
          results={results.data}
          formatDate={formatDate}
          onShare={share}
          copied={copied}
        />
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">{t("planTitle")}</h2>
        <p className="mb-3 text-xs text-slate-500">{t("planHint")}</p>
        <div className="flex gap-2">
          <div className="flex-1">
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
          <div className="flex-1">
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
}: {
  results: Results;
  formatDate: (iso: string) => string;
  onShare: () => void;
  copied: boolean;
}) {
  const t = useTranslations("calc");
  const s = results.status;
  const ms = results.maxStay;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{t("statusTitle")}</h2>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <div className="text-3xl font-bold tabular-nums text-slate-900">{s.daysUsed}</div>
          <div className="text-xs text-slate-500">{t("daysUsed")}</div>
        </div>
        <div
          className={`rounded-xl p-3 text-center ${
            s.overstayDays > 0 ? "bg-red-50" : "bg-emerald-50"
          }`}
        >
          <div
            className={`text-3xl font-bold tabular-nums ${
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
          <p className="font-medium text-red-700">
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
          <p key={i} className="text-xs text-slate-500">
            {ex.reason === "pre_accession_days"
              ? t("exclusionPreAccession", {
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
      <div className="mt-4">
        <button
          type="button"
          onClick={onShare}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("share")}
        </button>
        {copied ? <p className="mt-2 text-xs text-emerald-700">{t("shareCopied")}</p> : null}
      </div>
    </section>
  );
}

function PlanResult({
  plan,
  planEarliest,
  formatDate,
}: {
  plan: PlanTripResult;
  planEarliest: NextEntryResult | null;
  formatDate: (iso: string) => string;
}) {
  const t = useTranslations("calc");

  if (plan.compliant) {
    return (
      <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-900">
        {t("planCompliant", {
          days: plan.tripLengthDays,
          entry: formatDate(plan.entry),
          exit: formatDate(plan.exit),
          remaining: plan.daysRemainingAfterTrip,
        })}
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-xl bg-red-50 p-3 text-sm leading-relaxed text-red-900">
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
