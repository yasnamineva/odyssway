"use client";

import {
  checkPassportValidity,
  isValidISODate,
  remainingValidity,
  toEpochDay,
  type PassportValidityRule,
} from "@odyssway/engine";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

/**
 * Passport validity check inside a Trip Check result (GROWTH_AND_ROADMAP.md §1.6).
 * Dates stay in this component's state: never in the URL, never sent anywhere.
 * A verdict is shown only when the destination's rule names its reference date;
 * otherwise we show how much validity is left and quote the rule as written.
 */
export default function PassportValidityCheck({
  rule,
  line,
  headingLevel = 3,
}: {
  rule?: PassportValidityRule;
  line: string;
  /** 3 inside a Trip Check result; 2 where the panel sits directly under the page's h1. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const t = useTranslations("tripCheck.passport");
  const id = useId();
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [expiry, setExpiry] = useState("");

  const ready =
    isValidISODate(arrival) &&
    isValidISODate(departure) &&
    isValidISODate(expiry) &&
    toEpochDay(departure) >= toEpochDay(arrival);
  const result = ready && rule ? checkPassportValidity(rule, { arrival, departure }, expiry) : null;
  const atArrival = ready ? remainingValidity(expiry, arrival) : null;
  const atDeparture = ready ? remainingValidity(expiry, departure) : null;
  const datesBackwards =
    isValidISODate(arrival) && isValidISODate(departure) && toEpochDay(departure) < toEpochDay(arrival);

  const field = (key: "arrival" | "departure" | "expiry", value: string, set: (v: string) => void) => (
    <label htmlFor={`${id}-${key}`} className="block text-xs font-medium text-slate-700">
      {t(`${key}Label`)}
      <input
        id={`${id}-${key}`}
        type="date"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
      />
    </label>
  );

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4" data-testid="passport-check">
      <Heading className="text-sm font-semibold text-slate-900">{t("title")}</Heading>
      <p className="mt-1 text-xs text-slate-600">{t("rule", { line })}</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {field("arrival", arrival, setArrival)}
        {field("departure", departure, setDeparture)}
        {field("expiry", expiry, setExpiry)}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {t("privacy")}{" "}
        <a href="/blog/passport-validity-six-months-rule" className="text-blue-700 underline">
          {t("learnMore")}
        </a>
      </p>
      {datesBackwards && (
        <p className="mt-3 text-sm text-amber-800" role="alert">
          {t("datesBackwards")}
        </p>
      )}
      {ready && (
        <div className="mt-3 text-sm" aria-live="polite" data-testid="passport-result">
          {result ? (
            <p className={result.compliant ? "font-medium text-emerald-800" : "font-medium text-red-800"}>
              {result.compliant
                ? t("pass", { date: result.validUntilAtLeast, margin: result.marginDays })
                : t("fail", { date: result.validUntilAtLeast, short: -result.marginDays })}
            </p>
          ) : (
            <p className="text-slate-800">{t("noReferenceDate")}</p>
          )}
          {atArrival && atDeparture && (
            <p className="mt-1 text-slate-700">
              {t("remaining", {
                arrivalMonths: atArrival.months,
                arrivalDays: atArrival.days,
                departureMonths: atDeparture.months,
                departureDays: atDeparture.days,
              })}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">{t("disclaimer")}</p>
        </div>
      )}
    </div>
  );
}
