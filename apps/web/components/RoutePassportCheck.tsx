"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { checkRouteStop, firstFailingStop, type StopPassportStatus } from "../lib/route-passport";
import type { TripCheckResult } from "../lib/trip-check";

/**
 * Passport check for a whole Trip Check route (GROWTH_AND_ROADMAP.md §1.6):
 * one expiry date, each stop's own dates and own verified rule. Dates stay in
 * this component's state — never in the URL, never sent anywhere.
 */
export default function RoutePassportCheck({ legs }: { legs: TripCheckResult[] }) {
  const t = useTranslations("tripCheck.routePassport");
  const tp = useTranslations("tripCheck.passport");
  const id = useId();
  const [expiry, setExpiry] = useState("");
  const [dates, setDates] = useState<Record<string, { arrival: string; departure: string }>>({});

  const statuses: StopPassportStatus[] = legs.map((leg) =>
    checkRouteStop(
      {
        destinationName: leg.destinationName,
        covered: leg.covered,
        passportLine: leg.passportLine,
        passportValidity: leg.passportValidity,
        arrival: dates[leg.destination]?.arrival ?? "",
        departure: dates[leg.destination]?.departure ?? "",
      },
      expiry,
    ),
  );
  const failing = firstFailingStop(statuses);
  const verdicts = statuses.filter((s) => s.kind === "verdict").length;
  const setDate = (code: string, key: "arrival" | "departure", value: string) =>
    setDates((prev) => ({
      ...prev,
      [code]: { arrival: prev[code]?.arrival ?? "", departure: prev[code]?.departure ?? "", [key]: value },
    }));

  const inputClass = "mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900";

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-testid="tc-route-passport">
      <h2 className="text-sm font-semibold text-slate-900">{t("title")}</h2>
      <p className="mt-1 text-xs text-slate-600">{t("hint")}</p>
      <label htmlFor={`${id}-expiry`} className="mt-3 block max-w-xs text-xs font-medium text-slate-700">
        {tp("expiryLabel")}
        <input
          id={`${id}-expiry`}
          data-testid="tc-route-passport-expiry"
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className={inputClass}
        />
      </label>
      <ol className="mt-3 space-y-3">
        {legs.map((leg, i) => {
          const s = statuses[i] ?? { kind: "pending" as const };
          const dateInputs = s.kind !== "not_covered" && s.kind !== "no_rule";
          return (
            <li key={leg.destination} className="rounded-xl border border-slate-100 p-3" data-testid="tc-route-passport-stop">
              <p className="text-sm font-semibold text-slate-900">{leg.destinationName}</p>
              {dateInputs && (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {(["arrival", "departure"] as const).map((key) => (
                    <label key={key} htmlFor={`${id}-${i}-${key}`} className="block text-xs font-medium text-slate-700">
                      {tp(`${key}Label`)}
                      <input
                        id={`${id}-${i}-${key}`}
                        data-testid={`tc-route-passport-${key}-${i}`}
                        type="date"
                        value={dates[leg.destination]?.[key] ?? ""}
                        onChange={(e) => setDate(leg.destination, key, e.target.value)}
                        className={inputClass}
                      />
                    </label>
                  ))}
                </div>
              )}
              <StopStatus status={s} />
            </li>
          );
        })}
      </ol>
      {verdicts > 0 && (
        <p
          className={`mt-3 text-sm font-medium ${failing >= 0 ? "text-red-800" : "text-emerald-800"}`}
          aria-live="polite"
          data-testid="tc-route-passport-summary"
        >
          {failing >= 0
            ? t("summaryFail", { country: legs[failing]?.destinationName ?? "" })
            : t("summaryPass", { count: verdicts })}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-500">{tp("privacy")}</p>
    </section>
  );
}

export function StopStatus({ status: s }: { status: StopPassportStatus }) {
  const t = useTranslations("tripCheck.routePassport");
  const tp = useTranslations("tripCheck.passport");
  const remaining = (a: { months: number; days: number }, d: { months: number; days: number }) =>
    tp("remaining", { arrivalMonths: a.months, arrivalDays: a.days, departureMonths: d.months, departureDays: d.days });
  const box = "mt-2 text-sm";
  switch (s.kind) {
    case "not_covered":
      return <p className={`${box} text-slate-500`}>{t("notCovered")}</p>;
    case "no_rule":
      return <p className={`${box} text-slate-500`}>{t("noRule")}</p>;
    case "pending":
      return null;
    case "reversed":
      return <p className={`${box} text-amber-800`}>{tp("datesBackwards")}</p>;
    case "verdict":
      return (
        <div className={box} data-testid="tc-route-passport-result">
          <p className="text-xs text-slate-600">{tp("rule", { line: s.line })}</p>
          <p className={`mt-1 font-medium ${s.result.compliant ? "text-emerald-800" : "text-red-800"}`}>
            {s.result.compliant
              ? tp("pass", { date: s.result.validUntilAtLeast, margin: s.result.marginDays })
              : tp("fail", { date: s.result.validUntilAtLeast, short: -s.result.marginDays })}
          </p>
        </div>
      );
    case "no_reference":
    case "no_period":
      return (
        <div className={box} data-testid="tc-route-passport-result">
          <p className="text-xs text-slate-600">{tp("rule", { line: s.line })}</p>
          <p className="mt-1 text-slate-800">{s.kind === "no_reference" ? tp("noReferenceDate") : t("noPeriod")}</p>
          <p className="mt-1 text-slate-700">{remaining(s.atArrival, s.atDeparture)}</p>
        </div>
      );
  }
}
