"use client";

import type { StayPolicy } from "@odyssway/engine";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { schengenCountries } from "../lib/countries";
import { destinations } from "../lib/destination-index";
import { publishedNationalities } from "../lib/nationalities";
import { SCHENGEN_DESTINATION } from "../lib/schengen-sentinel";
import type { TripCheckResult } from "../lib/trip-check";
import { comparePassports } from "../lib/which-passport";
import SearchableSelect from "./SearchableSelect";
import SourceNote from "./SourceNote";

const labelClass = "block text-xs font-medium text-slate-600";
const nationalityOptions = publishedNationalities.map((n) => ({ value: n.nationality, label: n.name }));

export default function WhichPassport() {
  const t = useTranslations("whichPassport");
  const tc = useTranslations("tripCheck");
  const [destination, setDestination] = useState("");
  const [passportA, setPassportA] = useState("");
  const [passportB, setPassportB] = useState("");
  const [engine, setEngine] = useState<typeof import("../lib/trip-engine") | null>(null);

  useEffect(() => {
    let live = true;
    void import("../lib/trip-engine").then((m) => {
      if (live) setEngine(m);
    });
    return () => {
      live = false;
    };
  }, []);

  const comparison = useMemo(() => {
    if (!engine || !destination || !passportA || !passportB || passportA === passportB) return null;
    return comparePassports(
      engine.resolveTripCheck(passportA, destination, []),
      engine.resolveTripCheck(passportB, destination, []),
    );
  }, [engine, destination, passportA, passportB]);

  const destinationGroups = [
    { options: [{ value: SCHENGEN_DESTINATION, label: tc("schengenArea") }] },
    { label: tc("toGroupSchengenStates"), options: schengenCountries.map((c) => ({ value: c.code, label: c.name })) },
    {
      label: tc("toGroupDestinations"),
      options: destinations.filter((d) => d.status === "verified").map((d) => ({ value: d.code, label: d.name })),
    },
  ];

  const nameOf = (code: string) => publishedNationalities.find((n) => n.nationality === code)?.name ?? code;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t("subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="wp-a">
            {t("passportA")}
          </label>
          <SearchableSelect id="wp-a" data-testid="wp-a" value={passportA} onChange={setPassportA} placeholder={tc("fromPlaceholder")} noResultsLabel={tc("noMatches")} groups={[{ options: nationalityOptions }]} />
        </div>
        <div>
          <label className={labelClass} htmlFor="wp-b">
            {t("passportB")}
          </label>
          <SearchableSelect id="wp-b" data-testid="wp-b" value={passportB} onChange={setPassportB} placeholder={tc("fromPlaceholder")} noResultsLabel={tc("noMatches")} groups={[{ options: nationalityOptions }]} />
        </div>
        <div>
          <label className={labelClass} htmlFor="wp-dest">
            {t("destination")}
          </label>
          <SearchableSelect id="wp-dest" data-testid="wp-dest" value={destination} onChange={setDestination} placeholder={tc("toPlaceholder")} noResultsLabel={tc("noMatches")} groups={destinationGroups} />
        </div>
      </div>
      {passportA && passportA === passportB && <p className="mt-3 text-sm text-amber-800">{t("samePassport")}</p>}

      {comparison && (
        <div className="mt-8" data-testid="wp-results">
          <p
            className={`rounded-xl p-4 text-sm font-medium ${comparison.fewer === "a" || comparison.fewer === "b" ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-800"}`}
            data-testid="wp-verdict"
          >
            {comparison.fewer === "a" || comparison.fewer === "b"
              ? t(`fewer.${comparison.reason ?? "requirement"}`, {
                  passport: nameOf(comparison.fewer === "a" ? passportA : passportB),
                  destination: comparison.a.destinationName,
                })
              : t(`fewer.${comparison.fewer}`, { destination: comparison.a.destinationName })}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Column passport={nameOf(passportA)} result={comparison.a} highlight={comparison.fewer === "a"} />
            <Column passport={nameOf(passportB)} result={comparison.b} highlight={comparison.fewer === "b"} />
          </div>
          <p className="mt-4 text-sm text-slate-700">
            {t("sameDocument")}{" "}
            <a href="/guides/dual-citizens" className="font-semibold text-brand-700 underline underline-offset-2">
              {t("guideLink")}
            </a>
          </p>
          <p className="mt-2 text-xs text-slate-500">{t("disclaimer")}</p>
        </div>
      )}
    </section>
  );
}

function stayText(tc: ReturnType<typeof useTranslations>, p: StayPolicy | null, basis: string, freeMovement: string): string {
  if (p?.kind === "fixed_per_entry") return tc("stayFixedPerEntry", { maxDays: p.maxDays });
  if (p?.kind === "rolling_window")
    return p.maxDaysPerEntry
      ? tc("stayRollingWindowPerEntry", { perEntry: p.maxDaysPerEntry, maxDays: p.maxDays, windowDays: p.windowDays })
      : tc("stayRollingWindow", { maxDays: p.maxDays, windowDays: p.windowDays });
  if (basis === "citizen") return tc("basisCitizen");
  if (basis === "free_movement") return freeMovement;
  return basis === "visa_required" ? tc("stayVisaRequired") : tc("stayUnconfirmed");
}

function Column({ passport, result, highlight }: { passport: string; result: TripCheckResult; highlight: boolean }) {
  const t = useTranslations("whichPassport");
  const tc = useTranslations("tripCheck");
  return (
    <section
      className={`rounded-2xl border p-4 ${highlight ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"}`}
      data-testid="wp-column"
    >
      <h2 className="font-display text-base font-bold text-slate-900">{t("columnHeading", { passport })}</h2>
      <p className="mt-1 text-sm font-semibold text-slate-800">{tc(`routeBasis.${result.basis}`)}</p>
      {result.basis === "not_covered" ? (
        <p className="mt-2 text-sm text-amber-900">
          {t("notCovered")}{" "}
          {result.officialAuthorityUrl && (
            <a href={result.officialAuthorityUrl} className="underline" rel="noopener noreferrer" target="_blank">
              {tc("notCoveredLink")}
            </a>
          )}
        </p>
      ) : (
        <>
          <h3 className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">{t("stay")}</h3>
          <p className="mt-1 text-sm text-slate-700">{stayText(tc, result.stayPolicy, result.basis, t("freeMovement"))}</p>
          {result.documentsNeeded.length > 0 && (
            <>
              <h3 className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">{t("documents")}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.documentsNeeded.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </>
          )}
          {result.notes && <p className="mt-3 text-sm leading-relaxed text-slate-600">{result.notes}</p>}
          {result.legalSource && (
            <SourceNote
              className="mt-3"
              name={result.legalSource.name}
              url={result.legalSource.url}
              date={result.verifiedAt}
              sourceLabel={tc("sourceLabel")}
              checkedLabel={result.verifiedAt ? tc("checkedOn", { date: result.verifiedAt }) : undefined}
            />
          )}
        </>
      )}
    </section>
  );
}
