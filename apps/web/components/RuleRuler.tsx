"use client";

import { MAX_DAYS_IN_WINDOW, WINDOW_DAYS, fromEpochDay, status, toEpochDay, type Trip } from "@odyssway/engine";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { engineContext } from "../lib/countries";

/** A fictional traveller's three Schengen trips — illustrative inputs, not
 * legal facts. Every number shown is computed by the real engine from them,
 * so the ruler teaches the rule with the same arithmetic the calculator uses. */
const EXAMPLE_TRIPS: Trip[] = [
  { entry: "2025-11-10", exit: "2025-12-09", country: "PT", basis: { kind: "visa_free" } },
  { entry: "2026-01-15", exit: "2026-02-13", country: "ES", basis: { kind: "visa_free" } },
  { entry: "2026-03-20", exit: "2026-04-23", country: "IT", basis: { kind: "visa_free" } },
];
const RANGE_START = toEpochDay("2025-10-01");
const RANGE_END = toEpochDay("2026-09-30");
const RANGE_DAYS = RANGE_END - RANGE_START + 1;
/** Opens on the last fully compliant day of the third trip (90 of 90), so
 * the first nudge of the slider to the right shows what an overstay looks like. */
const INITIAL_DAY = toEpochDay("2026-04-18");

const pct = (day: number) => ((day - RANGE_START) / RANGE_DAYS) * 100;

export default function RuleRuler() {
  const t = useTranslations("home.rule");
  const locale = useLocale();
  const [day, setDay] = useState(INITIAL_DAY);

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
    [locale],
  );
  const monthFmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }), [locale]);
  const formatDay = (d: number) => fmt.format(new Date(`${fromEpochDay(d)}T00:00:00Z`));

  const result = status(EXAMPLE_TRIPS, fromEpochDay(day), engineContext);
  const windowStart = day - (WINDOW_DAYS - 1);
  const over = result.overstayDays > 0;

  const months = useMemo(() => {
    const out: Array<{ day: number; label: string }> = [];
    for (let d = RANGE_START; d <= RANGE_END; d++) {
      const iso = fromEpochDay(d);
      if (iso.endsWith("-01")) out.push({ day: d, label: monthFmt.format(new Date(`${iso}T00:00:00Z`)) });
    }
    return out;
  }, [monthFmt]);

  return (
    <div className="rounded-md border border-slate-300 bg-[#fffdf8] p-5 sm:p-7">
      {/* Read-out */}
      <div className="grid grid-cols-3 gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-slate-500 uppercase">{t("dateLabel")}</p>
          <p className="mt-1 font-display text-lg font-bold text-slate-900 tabular-nums sm:text-xl">{formatDay(day)}</p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.14em] text-slate-500 uppercase">{t("usedLabel")}</p>
          <p
            className={`mt-1 font-display text-lg font-bold tabular-nums sm:text-xl ${over ? "text-red-700" : "text-slate-900"}`}
          >
            {result.daysUsed} / {MAX_DAYS_IN_WINDOW}
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.14em] text-slate-500 uppercase">{t("remainingLabel")}</p>
          <p className="mt-1 font-display text-lg font-bold text-slate-900 tabular-nums sm:text-xl">
            {result.daysRemaining}
          </p>
        </div>
      </div>

      {/* Ruler */}
      <div className="relative mt-10 select-none" aria-hidden="true">
        <div className="relative h-14">
          {/* The 180-day window bracket */}
          <div
            className={`absolute -top-3 bottom-0 rounded-sm border-x-2 border-t-2 transition-[left,width] duration-75 ${
              over ? "border-red-700/70 bg-red-700/5" : "border-brand-600/70 bg-brand-500/5"
            }`}
            style={{
              left: `${Math.max(0, pct(windowStart))}%`,
              width: `${pct(day + 1) - Math.max(0, pct(windowStart))}%`,
            }}
          >
            <span
              className={`absolute -top-5 left-0 text-[10px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase ${
                over ? "text-red-700" : "text-brand-700"
              }`}
            >
              {t("windowLabel", { days: WINDOW_DAYS })}
            </span>
          </div>
          {/* Day track */}
          <div className="absolute inset-x-0 top-5 h-5 border-y border-slate-300 bg-slate-100" />
          {EXAMPLE_TRIPS.map((trip) => {
            const s = toEpochDay(trip.entry);
            const e = toEpochDay(trip.exit);
            const insideStart = Math.max(s, windowStart);
            const insideEnd = Math.min(e, day);
            return (
              <div key={trip.entry}>
                <div
                  className="absolute top-5 h-5 bg-slate-400/60"
                  style={{ left: `${pct(s)}%`, width: `${pct(e + 1) - pct(s)}%` }}
                />
                {insideEnd >= insideStart ? (
                  <div
                    className={`absolute top-5 h-5 ${over ? "bg-red-700" : "bg-brand-600"}`}
                    style={{ left: `${pct(insideStart)}%`, width: `${pct(insideEnd + 1) - pct(insideStart)}%` }}
                  />
                ) : null}
              </div>
            );
          })}
          {/* Today marker */}
          <div className="absolute top-1 bottom-0 w-px bg-slate-900" style={{ left: `${pct(day)}%` }} />
        </div>
        <div className="relative mt-1 h-4 text-[10px] text-slate-500">
          {months.map((m) => (
            <span key={m.day} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${pct(m.day)}%` }}>
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <label className="mt-6 block">
        <span className="sr-only">{t("sliderLabel")}</span>
        <input
          type="range"
          min={RANGE_START + WINDOW_DAYS - 1}
          max={RANGE_END}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          aria-valuetext={`${formatDay(day)}: ${result.daysUsed} / ${MAX_DAYS_IN_WINDOW}`}
          className="w-full accent-brand-600"
        />
      </label>

      <p className={`mt-4 text-sm leading-relaxed ${over ? "text-red-800" : "text-slate-700"}`}>
        {over
          ? t("over", { days: result.overstayDays })
          : t("under", { start: formatDay(windowStart), remaining: result.daysRemaining })}
      </p>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{t("legend")}</p>
    </div>
  );
}
