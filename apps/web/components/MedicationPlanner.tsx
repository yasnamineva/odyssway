"use client";

import type { CustomsItemRecord } from "@odyssway/engine";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { schengenCountries } from "../lib/countries";
import { destinationByCode, destinations, destinationSlug } from "../lib/destination-index";
import { planMedications, type PlannerResult, type PlannerStopInput } from "../lib/medication-planner";
import { publishedNationalities } from "../lib/nationalities";
import LetterChecklist from "./LetterChecklist";
import SearchableSelect from "./SearchableSelect";
import SourceNote from "./SourceNote";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none";
const labelClass = "block text-xs font-medium text-slate-600";
const MAX_STOPS = 5;

const VERDICT_STYLES: Record<string, string> = {
  prohibited: "bg-red-50 text-red-700 ring-red-200",
  allowed_with_limits: "bg-amber-50 text-amber-800 ring-amber-200",
  allowed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  declaration_required: "bg-blue-50 text-blue-700 ring-blue-200",
  depends: "bg-slate-100 text-slate-700 ring-slate-200",
};

const STATUS_STYLES: Record<string, string> = {
  passed: "text-red-700",
  soon: "text-amber-700",
  ok: "text-slate-800",
};

/** Today's date as YYYY-MM-DD from the user's calendar (date-only, §13.1). */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MedicationPlanner() {
  const t = useTranslations("medicationPlanner");
  const tc = useTranslations("tripCheck");
  const [nationality, setNationality] = useState("");
  const [leaveHome, setLeaveHome] = useState("");
  const [stops, setStops] = useState<PlannerStopInput[]>([{ destination: "", arrival: "" }]);
  const [medicines, setMedicines] = useState<string[]>([]);
  const [medInput, setMedInput] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [today, setToday] = useState("");
  const [engine, setEngine] = useState<typeof import("../lib/trip-engine") | null>(null);

  useEffect(() => {
    setToday(todayISO());
    let live = true;
    void import("../lib/trip-engine").then((m) => {
      if (live) setEngine(m);
    });
    return () => {
      live = false;
    };
  }, []);

  // Every search name on a verified medication row, for suggestions.
  const pool = useMemo(() => {
    if (!engine) return [];
    const names = new Set<string>();
    for (const row of engine.customsItems) {
      if (row.status === "verified" && row.category === "medication") for (const n of row.names) names.add(n);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [engine]);

  const suggestions = useMemo(() => {
    const q = medInput.trim().toLowerCase();
    if (!q) return [];
    return pool.filter((n) => n.toLowerCase().includes(q) && !medicines.includes(n)).slice(0, 8);
  }, [medInput, pool, medicines]);

  const addMedicine = (value?: string) => {
    const v = (value ?? medInput).trim();
    if (v && !medicines.includes(v)) setMedicines((prev) => [...prev, v]);
    setMedInput("");
    setSuggestOpen(false);
  };

  const result: PlannerResult = useMemo(() => {
    if (!engine || !today) return { stops: [], deadlines: [] };
    try {
      return planMedications({ nationality, leaveHome, stops, medicines }, today, engine.resolveTripCheck);
    } catch {
      return { stops: [], deadlines: [] };
    }
  }, [engine, today, nationality, leaveHome, stops, medicines]);

  const destinationGroups = [
    { label: tc("toGroupSchengenStates"), options: schengenCountries.map((c) => ({ value: c.code, label: c.name })) },
    {
      label: tc("toGroupDestinations"),
      options: destinations.filter((d) => d.status === "verified").map((d) => ({ value: d.code, label: d.name })),
    },
  ];

  const updateStop = (i: number, patch: Partial<PlannerStopInput>) =>
    setStops((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t("subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="mp-nationality">
            {tc("fromLabel")}
          </label>
          <SearchableSelect
            id="mp-nationality"
            data-testid="mp-nationality"
            value={nationality}
            onChange={setNationality}
            placeholder={tc("fromPlaceholder")}
            noResultsLabel={tc("noMatches")}
            groups={[{ options: publishedNationalities.map((n) => ({ value: n.nationality, label: n.name })) }]}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="mp-leave">
            {t("leaveHomeLabel")}
          </label>
          <input id="mp-leave" data-testid="mp-leave" type="date" className={inputClass} value={leaveHome} onChange={(e) => setLeaveHome(e.target.value)} />
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">{t("medicinesTitle")}</h2>
      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id="mp-medicine"
            data-testid="mp-medicine-input"
            aria-label={t("medicinesTitle")}
            type="text"
            autoComplete="off"
            className={inputClass}
            placeholder={t("medicinePlaceholder")}
            value={medInput}
            onChange={(e) => {
              setMedInput(e.target.value);
              setSuggestOpen(true);
            }}
            onFocus={() => setSuggestOpen(true)}
            onBlur={() => setSuggestOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addMedicine();
              } else if (e.key === "Escape") setSuggestOpen(false);
            }}
          />
          {suggestOpen && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {suggestions.map((s) => (
                <li
                  key={s}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addMedicine(s)}
                  className="cursor-pointer px-3 py-1.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={() => addMedicine()}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {tc("addItem")}
        </button>
      </div>
      {medicines.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2" data-testid="mp-medicine-tags">
          {medicines.map((m) => (
            <li key={m} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {m}
              <button
                type="button"
                aria-label={t("removeMedicine", { name: m })}
                onClick={() => setMedicines((prev) => prev.filter((x) => x !== m))}
                className="ml-1 text-slate-400 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-6 text-sm font-semibold text-slate-900">{t("routeTitle")}</h2>
      <ol className="mt-2 space-y-3">
        {stops.map((stop, i) => (
          <li key={i} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end">
            <div>
              <label className={labelClass} htmlFor={`mp-dest-${i}`}>
                {t("stopLabel", { n: i + 1 })}
              </label>
              <SearchableSelect
                id={`mp-dest-${i}`}
                data-testid={`mp-dest-${i}`}
                value={stop.destination}
                onChange={(v) => updateStop(i, { destination: v })}
                placeholder={tc("toPlaceholder")}
                noResultsLabel={tc("noMatches")}
                groups={destinationGroups}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`mp-arrival-${i}`}>
                {t("arrivalLabel")}
              </label>
              <input
                id={`mp-arrival-${i}`}
                data-testid={`mp-arrival-${i}`}
                type="date"
                className={inputClass}
                value={stop.arrival}
                onChange={(e) => updateStop(i, { arrival: e.target.value })}
              />
            </div>
            <button
              type="button"
              aria-label={t("removeStop", { n: i + 1 })}
              onClick={() => setStops((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : [{ destination: "", arrival: "" }]))}
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
          data-testid="mp-add-stop"
          onClick={() => setStops((prev) => [...prev, { destination: "", arrival: "" }])}
          className="mt-3 text-xs font-semibold text-brand-700 underline underline-offset-2"
        >
          {t("addStop")}
        </button>
      )}
      <p className="mt-2 text-[11px] text-slate-500">{t("privacy")}</p>

      {result.stops.length > 0 && (
        <div className="mt-8 space-y-6" data-testid="mp-results">
          <Deadlines result={result} />
          {result.stops.map((stop) => (
            <section key={`${stop.destination}-${stop.arrival}`} className="rounded-2xl border border-slate-200 p-4" data-testid="mp-stop">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {t("stopHeading", { country: stop.destinationName, date: stop.arrival })}
              </h2>
              <ul className="mt-3 space-y-4">
                {stop.medicines.map((m) =>
                  m.match ? (
                    <MedicineRow
                      key={m.query}
                      query={m.query}
                      row={m.match}
                      destinationCode={stop.destination}
                      destinationName={stop.destinationName}
                      applyBy={m.applyBy}
                      status={m.status}
                    />
                  ) : (
                    <li key={m.query} className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900" data-testid="mp-not-covered">
                      {t("notCovered", { medicine: m.query, country: stop.destinationName })}
                      {stop.officialAuthorityUrl && (
                        <>
                          {" "}
                          <a href={stop.officialAuthorityUrl} className="underline" rel="noopener noreferrer" target="_blank">
                            {t("officialSource")}
                          </a>
                        </>
                      )}
                    </li>
                  ),
                )}
              </ul>
            </section>
          ))}
          <p className="text-xs text-slate-500">{t("disclaimer")}</p>
        </div>
      )}
    </section>
  );
}

function Deadlines({ result }: { result: PlannerResult }) {
  const t = useTranslations("medicationPlanner");
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" data-testid="mp-deadlines">
      <h2 className="text-sm font-semibold text-slate-900">{t("deadlinesTitle")}</h2>
      {result.deadlines.length === 0 ? (
        <p className="mt-1 text-sm text-slate-700">{t("noDeadlines")}</p>
      ) : (
        <>
          <ol className="mt-2 space-y-2">
            {result.deadlines.map((d) => (
              <li key={`${d.destinationName}-${d.query}`} className="text-sm" data-testid="mp-deadline">
                <span className={`font-semibold ${STATUS_STYLES[d.status]}`}>
                  {t(`deadline.${d.status}`, { date: d.applyBy })}
                </span>{" "}
                <span className="text-slate-700">{t("deadlineLine", { permit: d.permit, country: d.destinationName, medicine: d.query })}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-slate-500">{t("deadlinesNote")}</p>
        </>
      )}
    </section>
  );
}

function MedicineRow({
  query,
  row,
  destinationCode,
  destinationName,
  applyBy,
  status,
}: {
  query: string;
  row: CustomsItemRecord;
  destinationCode: string;
  destinationName: string;
  applyBy?: string;
  status?: string;
}) {
  const t = useTranslations("medicationPlanner");
  const tv = useTranslations("destinationPage.verdict");
  const tc = useTranslations("tripCheck");
  const p = row.procedure;
  const dest = destinationByCode(destinationCode);
  return (
    <li className="rounded-xl border border-slate-100 p-3" data-testid="mp-medicine">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{query}</h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${VERDICT_STYLES[row.verdict] ?? VERDICT_STYLES.depends}`}>
          {tv(row.verdict)}
        </span>
      </div>
      {(row.summary ?? row.limits?.description) && <p className="mt-2 text-sm leading-relaxed text-slate-700">{row.summary ?? row.limits?.description}</p>}
      {row.limits?.quantity && <p className="mt-1 text-xs text-slate-600">{t("limit", { quantity: row.limits.quantity })}</p>}
      {p && (
        <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-950" data-testid="mp-permit">
          <p className="font-semibold">{p.title}</p>
          <p className="mt-1 text-xs">{p.authority}</p>
          {applyBy && status ? (
            <p className={`mt-1 font-semibold ${STATUS_STYLES[status]}`}>{t(`deadline.${status}`, { date: applyBy })}</p>
          ) : (
            p.leadTime && <p className="mt-1">{t("leadTime", { text: p.leadTime })}</p>
          )}
          {applyBy && p.leadTime && <p className="mt-1 text-xs">{t("leadTimeQuote", { text: p.leadTime })}</p>}
          {p.processingTime && <p className="mt-1 text-xs">{t("processing", { text: p.processingTime })}</p>}
          {p.applyUrl && (
            <a href={p.applyUrl} className="mt-1 inline-block text-xs font-semibold underline" rel="noopener noreferrer" target="_blank">
              {t("applyLink")}
            </a>
          )}
        </div>
      )}
      {row.letter && <LetterChecklist letter={row.letter} destinationName={destinationName} />}
      <SourceNote
        className="mt-3"
        name={row.legal_source.name}
        url={row.legal_source.url}
        date={row.verified_at ?? undefined}
        sourceLabel={tc("sourceLabel")}
        checkedLabel={row.verified_at ? tc("checkedOn", { date: row.verified_at }) : undefined}
      />
      {dest && row.category === "medication" && (
        <a href={`/bring/medication/${destinationSlug(dest.name)}`} className="mt-2 inline-block text-xs font-semibold text-brand-700 underline underline-offset-2">
          {t("fullRules", { country: dest.name })}
        </a>
      )}
    </li>
  );
}
