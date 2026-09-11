"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { schengenCountries } from "../lib/countries";
import { destinationLabelFor } from "../lib/destination-label";
import { EU_CUSTOMS_CODE, destinations, queuedDestinations } from "../lib/destinations";
import { publishedNationalities } from "../lib/nationalities";
import SearchableSelect from "./SearchableSelect";
import {
  resolveMapDestinationCode,
  resolveTripCheck,
  SCHENGEN_DESTINATION,
  type EntryBasis,
  type TripCheckResult,
} from "../lib/trip-check";

/** The map bundles real country geometry (~100KB) — load it only once it's needed. */
const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-slate-100" />,
});

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const labelClass = "block text-xs font-medium text-slate-600";

const BASIS_LABEL_KEY: Record<EntryBasis, string> = {
  citizen: "basisCitizen",
  visa_free: "basisVisaFree",
  eta_required: "basisEtaRequired",
  visa_required: "basisVisaRequired",
  visa_on_arrival: "basisVisaOnArrival",
  not_covered: "basisNotCovered",
};

export default function TripCheck({
  initialNationality,
  initialDestination,
}: {
  /** Pre-fills from the homepage's quick-check widget (?nationality=&destination=). */
  initialNationality?: string;
  initialDestination?: string;
} = {}) {
  const t = useTranslations("tripCheck");
  const [nationality, setNationality] = useState(initialNationality ?? "");
  const [destination, setDestination] = useState(initialDestination ?? "");
  const [itemInput, setItemInput] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(Boolean(initialNationality && initialDestination));

  const result: TripCheckResult | null = useMemo(() => {
    if (!submitted || !nationality || !destination) return null;
    return resolveTripCheck(nationality, destination, items);
  }, [submitted, nationality, destination, items]);

  // Best-effort, fire-and-forget: report items nobody's verified yet so real
  // search demand — not guesswork — drives which niche items get researched
  // next. Never blocks or affects the result shown to this user.
  useEffect(() => {
    if (!result || !result.covered) return;
    const misses = result.items.filter((i) => i.match === null);
    if (misses.length === 0) return;
    const customsDestination = result.isSchengen ? EU_CUSTOMS_CODE : result.destination;
    for (const miss of misses) {
      fetch("/api/item-miss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: miss.query, destination: customsDestination }),
        keepalive: true,
      }).catch(() => {});
    }
  }, [result]);

  const addItem = () => {
    const v = itemInput.trim();
    if (v && !items.includes(v)) setItems((prev) => [...prev, v]);
    setItemInput("");
  };

  const removeItem = (item: string) => setItems((prev) => prev.filter((i) => i !== item));

  const originLabel = publishedNationalities.find((n) => n.nationality === nationality)?.name;
  const destinationLabel = destinationLabelFor(destination);
  const mapDestinationCode = destination ? resolveMapDestinationCode(destination) : undefined;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-blue-700 uppercase">
        {t("eyebrow")}
      </span>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t("subtitle")}</p>

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div>
            <label className={labelClass} htmlFor="tc-nationality">
              {t("fromLabel")}
            </label>
            <SearchableSelect
              id="tc-nationality"
              data-testid="tc-nationality"
              value={nationality}
              onChange={(v) => {
                setNationality(v);
                setSubmitted(false);
              }}
              placeholder={t("fromPlaceholder")}
              noResultsLabel={t("noMatches")}
              groups={[
                {
                  options: publishedNationalities.map((n) => ({
                    value: n.nationality,
                    label: n.name,
                  })),
                },
              ]}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="tc-destination">
              {t("toLabel")}
            </label>
            <SearchableSelect
              id="tc-destination"
              data-testid="tc-destination"
              value={destination}
              onChange={(v) => {
                setDestination(v);
                setSubmitted(false);
              }}
              placeholder={t("toPlaceholder")}
              noResultsLabel={t("noMatches")}
              groups={[
                { options: [{ value: SCHENGEN_DESTINATION, label: t("schengenArea") }] },
                {
                  label: t("toGroupDestinations"),
                  options: destinations
                    .filter((d) => d.status === "verified")
                    .map((d) => ({ value: d.code, label: d.name })),
                },
                {
                  label: t("toGroupSchengenStates"),
                  options: schengenCountries.map((c) => ({ value: c.code, label: c.name })),
                },
                {
                  label: t("toGroupComingSoon"),
                  options: queuedDestinations.map((d) => ({
                    value: d.code,
                    label: `${d.name} ${t("comingSoonSuffix")}`,
                  })),
                },
              ]}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="tc-item">
              {t("bringingLabel")}
            </label>
            <div className="flex gap-2">
              <input
                id="tc-item"
                data-testid="tc-item-input"
                type="text"
                className={inputClass}
                placeholder={t("bringingPlaceholder")}
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={addItem}
                className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("addItem")}
              </button>
            </div>
            {items.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2" data-testid="tc-item-tags">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                  >
                    {item}
                    <button
                      type="button"
                      aria-label={t("removeItem", { item })}
                      onClick={() => removeItem(item)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            data-testid="tc-submit"
            disabled={!nationality || !destination}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("submit")}
          </button>
        </form>

        <div className="mt-8 lg:mt-0" data-testid="tc-map-panel">
          <WorldMap
            originCode={nationality || undefined}
            destinationCode={mapDestinationCode}
            highlightCodes={destination === SCHENGEN_DESTINATION ? schengenCountries.map((c) => c.code) : []}
            originLabel={originLabel}
            destinationLabel={destinationLabel}
          />
          {result && <TripCheckResults result={result} />}
        </div>
      </div>
    </section>
  );
}

function TripCheckResults({ result }: { result: TripCheckResult }) {
  const t = useTranslations("tripCheck");

  if (!result.covered) {
    return (
      <div
        data-testid="tc-not-covered"
        className="mt-6 animate-fade-in-up rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 motion-reduce:animate-none"
      >
        <p className="font-medium">{t("notCoveredTitle", { destination: result.destinationName })}</p>
        <p className="mt-1">{t("notCoveredBody")}</p>
        {result.officialAuthorityUrl && (
          <a
            href={result.officialAuthorityUrl}
            rel="noopener noreferrer"
            className="mt-2 inline-block underline"
          >
            {t("notCoveredLink")}
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className="mt-6 grid animate-fade-in-up gap-4 sm:grid-cols-2 motion-reduce:animate-none"
      data-testid="tc-results"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">{t("entryCardTitle")}</h2>
        <p className="mt-1 text-sm text-slate-700" data-testid="tc-basis">
          {t(BASIS_LABEL_KEY[result.basis], { destination: result.destinationName })}
        </p>
        {result.notes && <p className="mt-1 text-xs text-slate-500">{result.notes}</p>}
        <SourceLine legalSource={result.legalSource} />
      </div>

      {result.stayPolicy && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{t("stayCardTitle")}</h2>
          <p className="mt-1 text-sm text-slate-700" data-testid="tc-stay">
            {result.stayPolicy.kind === "rolling_window"
              ? t("stayRollingWindow", {
                  maxDays: result.stayPolicy.maxDays,
                  windowDays: result.stayPolicy.windowDays,
                })
              : result.stayPolicy.kind === "fixed_per_entry"
                ? t("stayFixedPerEntry", { maxDays: result.stayPolicy.maxDays })
                : t("stayVisaRequired")}
          </p>
          {result.isSchengen && (
            <a href="/calculator" className="mt-2 inline-block text-xs underline">
              {t("trackInCalculator")}
            </a>
          )}
          <SourceLine legalSource={result.legalSource} />
        </div>
      )}

      {result.documentsNeeded.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{t("documentsCardTitle")}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
            {result.documentsNeeded.map((doc) =>
              result.legalSource ? (
                <li key={doc}>
                  <a
                    href={result.legalSource.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                  >
                    {doc}
                  </a>
                </li>
              ) : (
                <li key={doc}>{doc}</li>
              ),
            )}
          </ul>
          <SourceLine legalSource={result.legalSource} />
        </div>
      )}

      {result.items.length > 0 && (
        <div
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          data-testid="tc-items"
        >
          <h2 className="text-sm font-semibold text-slate-900">{t("itemsCardTitle")}</h2>
          <ul className="mt-2 space-y-3">
            {result.items.map((item) => (
              <li key={item.query} data-testid="tc-item-result">
                <p className="text-sm font-medium text-slate-900">{item.query}</p>
                {item.match ? (
                  <>
                    <p className="text-sm text-slate-700">{t(`verdict.${item.match.verdict}`)}</p>
                    {item.match.limits && (
                      <p className="text-xs text-slate-500">{item.match.limits.description}</p>
                    )}
                    {item.match.notes && (
                      <p className="text-xs text-slate-500">{item.match.notes}</p>
                    )}
                    <a
                      href={item.match.legal_source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="text-xs underline"
                    >
                      {item.match.legal_source.name}
                    </a>
                  </>
                ) : (
                  <p className="text-xs text-amber-700" data-testid="tc-item-not-found">
                    {t("itemNotFound", { destination: result.destinationName })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

function SourceLine({ legalSource }: { legalSource?: { name: string; url: string } }) {
  const t = useTranslations("tripCheck");
  if (!legalSource) return null;
  return (
    <p className="mt-2 text-xs text-slate-500">
      {t("sourceLabel")}{" "}
      <a
        href={legalSource.url}
        rel="noopener noreferrer"
        target="_blank"
        className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
      >
        {legalSource.name}
      </a>
    </p>
  );
}
