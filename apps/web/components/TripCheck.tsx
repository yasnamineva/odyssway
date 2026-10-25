"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import PassportValidityCheck from "./PassportValidityCheck";
import RoutePassportCheck from "./RoutePassportCheck";
import SourceNote from "./SourceNote";
import { schengenCountries } from "../lib/countries";
import { destinationLabelFor } from "../lib/destination-label";
import { BRING_CATEGORIES } from "../lib/bring-categories";
import type { CustomsItemRecord } from "@odyssway/engine";
import { EU_CUSTOMS_CODE, destinationSlug, destinations, queuedDestinations } from "../lib/destination-index";
import { publishedNationalities } from "../lib/nationalities";
import SearchableSelect from "./SearchableSelect";
import { resolveMapDestinationCode, SCHENGEN_DESTINATION } from "../lib/schengen-sentinel";
import type { EntryBasis, TripCheckResult } from "../lib/trip-check";
import { decodeTripShare, encodeTripShare } from "../lib/trip-share";

/** The map bundles real country geometry (~100KB) — load it only once it's needed. */
const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-slate-100" />,
});

/** The page that shows a row's full permit procedure: its /bring item × destination page. */
function procedureHref(row: CustomsItemRecord): string | undefined {
  if (row.category === "other") return undefined;
  const destination = destinations.find((d) => d.code === row.destination && d.status === "verified");
  return destination
    ? `/bring/${BRING_CATEGORIES[row.category].slug}/${destinationSlug(destination.name)}`
    : undefined;
}

/** What a stopover country's rule says about this item, for passengers only changing planes. */
function TransitBlock({ country, row }: { country: string; row: CustomsItemRecord | null }) {
  const t = useTranslations("tripCheck");
  const tt = useTranslations("transit");
  const href = row ? procedureHref(row) : undefined;
  return (
    <div className="mt-2 rounded-lg bg-slate-50 p-2.5" data-testid="tc-item-transit">
      <p className="text-xs font-semibold text-slate-800">
        {t("transitHeading", { country })}
        {row?.transit && (
          <span className="ml-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
            {tt(row.transit.rule)}
          </span>
        )}
      </p>
      {row?.transit ? (
        <>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">{row.transit.description}</p>
          <SourceNote
            className="mt-1.5"
            name={row.transit.source.name}
            url={row.transit.source.url}
            date={row.transit.verified_at}
            sourceLabel={t("sourceLabel")}
            checkedLabel={t("checkedOn", { date: row.transit.verified_at })}
          />
        </>
      ) : (
        <p className="mt-1 text-xs leading-relaxed text-amber-700">
          {row ? t("transitNotStated", { country }) : t("transitNotCovered", { country })}
        </p>
      )}
      {href && (
        <a href={href} className="mt-1 inline-block text-xs font-semibold text-brand-700 underline underline-offset-2">
          {t("transitRuleLink", { country })}
        </a>
      )}
    </div>
  );
}

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const labelClass = "block text-xs font-medium text-slate-600";

const BASIS_LABEL_KEY: Record<EntryBasis, string> = {
  citizen: "basisCitizen",
  free_movement: "basisFreeMovement",
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
  const [itemSuggestOpen, setItemSuggestOpen] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [transit, setTransit] = useState("");
  // Further countries on the same trip (Horizon 2, itinerary check): each is
  // resolved with the same passport and items, one verdict per border.
  const [extraLegs, setExtraLegs] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(Boolean(initialNationality && initialDestination));

  // A shared link (#n=…&d=…) restores the whole trip and shows the result.
  useEffect(() => {
    const shared = decodeTripShare(window.location.hash);
    if (!shared) return;
    setNationality(shared.nationality);
    setDestination(shared.destination);
    setExtraLegs(shared.legs);
    setTransit(shared.transit);
    setItems(shared.items);
    setSubmitted(true);
  }, []);

  // Every verified synonym for the chosen destination's customs items — the
  // pool suggestions are filtered from as the user types. Free text is still
  // always allowed (Enter adds whatever was typed, in or out of this list);
  // suggestions are a shortcut, not a constraint (AGENTS.md §2: a pair not
  // being covered is a valid, honest answer, never a dead end).
  // The resolver and rule corpus load just after first render, so the page
  // paints and the pickers work without waiting for ~2.8 MB of data.
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

  const itemSuggestionPool = useMemo(() => {
    if (!destination || !engine) return [];
    const isSchengen =
      destination === SCHENGEN_DESTINATION || schengenCountries.some((c) => c.code === destination);
    const customsDestination = isSchengen ? EU_CUSTOMS_CODE : destination;
    const pool = new Set<string>();
    engine.customsItems
      .filter(
        (it) =>
          (it.destination === customsDestination || it.destination === destination) &&
          it.status === "verified",
      )
      .forEach((it) => it.names.forEach((n) => pool.add(n)));
    return [...pool].sort();
  }, [destination, engine]);

  const itemSuggestions = useMemo(() => {
    const q = itemInput.trim().toLowerCase();
    if (!q) return [];
    return itemSuggestionPool.filter((n) => n.toLowerCase().includes(q) && !items.includes(n)).slice(0, 8);
  }, [itemInput, itemSuggestionPool, items]);

  const result: TripCheckResult | null = useMemo(() => {
    if (!submitted || !nationality || !destination || !engine) return null;
    return engine.resolveTripCheck(nationality, destination, items, transit || undefined);
  }, [submitted, nationality, destination, items, transit, engine]);

  const legResults: TripCheckResult[] = useMemo(() => {
    if (!result || !engine) return [];
    const more = extraLegs
      .filter((code, i) => code && code !== destination && extraLegs.indexOf(code) === i)
      .map((code) => engine.resolveTripCheck(nationality, code, items));
    return [result, ...more];
  }, [result, engine, extraLegs, destination, nationality, items]);

  // Best-effort, fire-and-forget: report items nobody's verified yet so real
  // search demand — not guesswork — drives which niche items get researched
  // next. Never blocks or affects the result shown to this user.
  useEffect(() => {
    if (!result || !result.covered || result.intraEuCustoms) return;
    const misses = result.items.filter((i) => i.match === null);
    if (misses.length === 0) return;
    const customsDestination = result.isSchengen ? EU_CUSTOMS_CODE : result.destination;
    for (const miss of misses) {
      fetch("/api/item-miss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: miss.query,
          destination: customsDestination,
        }),
        keepalive: true,
      }).catch(() => {});
      // Same two fields as a cookie-free Plausible custom event, so misses can
      // be counted over time (the log line above only lives as long as the
      // host's log retention). No-op when Plausible isn't loaded.
      window.plausible?.("Item not found", {
        props: {
          query: miss.query.trim().slice(0, 100),
          destination: customsDestination,
        },
      });
    }
  }, [result]);

  const addItem = (value?: string) => {
    const v = (value ?? itemInput).trim();
    if (v && !items.includes(v)) setItems((prev) => [...prev, v]);
    setItemInput("");
    setItemSuggestOpen(false);
  };

  const removeItem = (item: string) => setItems((prev) => prev.filter((i) => i !== item));

  const destinationGroups = [
    {
      options: [{ value: SCHENGEN_DESTINATION, label: t("schengenArea") }],
    },
    {
      label: t("toGroupDestinations"),
      options: destinations
        .filter((d) => d.status === "verified" && d.code !== nationality)
        .map((d) => ({ value: d.code, label: d.name })),
    },
    {
      label: t("toGroupSchengenStates"),
      options: schengenCountries
        .filter((c) => c.code !== nationality)
        .map((c) => ({ value: c.code, label: c.name })),
    },
    {
      label: t("toGroupComingSoon"),
      options: queuedDestinations
        .filter((d) => d.code !== nationality)
        .map((d) => ({
          value: d.code,
          label: `${d.name} ${t("comingSoonSuffix")}`,
        })),
    },
  ];

  const originLabel = publishedNationalities.find((n) => n.nationality === nationality)?.name;
  const destinationLabel = destinationLabelFor(destination);
  const mapDestinationCode = destination ? resolveMapDestinationCode(destination) : undefined;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-700 uppercase">
        {t("eyebrow")}
      </span>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{t("subtitle")}</p>

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10 print:block">
        <form
          className="space-y-4 print:hidden"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            // On phones the answer is below the fold — bring it into view.
            if (window.matchMedia("(max-width: 1023px)").matches) {
              const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              requestAnimationFrame(() =>
                document.getElementById("tc-result")?.scrollIntoView({
                  behavior: smooth ? "smooth" : "auto",
                  block: "start",
                }),
              );
            }
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
                  options: publishedNationalities
                    .filter((n) => n.nationality !== destination)
                    .map((n) => ({
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
              groups={destinationGroups}
            />
          </div>

          {extraLegs.map((leg, i) => (
            <div key={i} data-testid="tc-extra-leg">
              <label className={labelClass} htmlFor={`tc-leg-${i}`}>
                {t("legLabel", { n: i + 2 })}
              </label>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <SearchableSelect
                    id={`tc-leg-${i}`}
                    data-testid={`tc-leg-${i}`}
                    value={leg}
                    onChange={(v) => {
                      setExtraLegs((prev) => prev.map((x, j) => (j === i ? v : x)));
                    }}
                    placeholder={t("toPlaceholder")}
                    noResultsLabel={t("noMatches")}
                    groups={destinationGroups}
                  />
                </div>
                <button
                  type="button"
                  aria-label={t("removeLeg", { n: i + 2 })}
                  onClick={() => setExtraLegs((prev) => prev.filter((_, j) => j !== i))}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 text-sm text-slate-500 hover:bg-slate-50 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {extraLegs.length < 4 && (
            <button
              type="button"
              data-testid="tc-add-leg"
              disabled={!destination}
              onClick={() => setExtraLegs((prev) => [...prev, ""])}
              className="text-xs font-semibold text-brand-700 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("addLeg")}
            </button>
          )}

          <div>
            <label className={labelClass} htmlFor="tc-transit">
              {t("transitLabel")}
            </label>
            <SearchableSelect
              id="tc-transit"
              data-testid="tc-transit"
              value={transit}
              onChange={(v) => {
                setTransit(v);
                setSubmitted(false);
              }}
              placeholder={t("transitPlaceholder")}
              noResultsLabel={t("noMatches")}
              groups={[
                {
                  options: [
                    { value: "", label: t("transitPlaceholder") },
                    ...destinations
                      .filter((d) => d.status === "verified" && d.code !== destination)
                      .map((d) => ({ value: d.code, label: d.name })),
                  ],
                },
              ]}
            />
            <p className="mt-1 text-[11px] leading-snug text-slate-500">{t("transitHint")}</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="tc-item">
              {t("bringingLabel")}
            </label>
            <div className="relative flex gap-2">
              <div className="relative min-w-0 flex-1">
                <input
                  id="tc-item"
                  data-testid="tc-item-input"
                  type="text"
                  autoComplete="off"
                  className={inputClass}
                  placeholder={t("bringingPlaceholder")}
                  value={itemInput}
                  onChange={(e) => {
                    setItemInput(e.target.value);
                    setItemSuggestOpen(true);
                  }}
                  onFocus={() => setItemSuggestOpen(true)}
                  onBlur={() => setItemSuggestOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem();
                    } else if (e.key === "Escape") {
                      setItemSuggestOpen(false);
                    }
                  }}
                />
                {itemSuggestOpen && itemSuggestions.length > 0 && (
                  <ul
                    data-testid="tc-item-suggestions"
                    className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    {itemSuggestions.map((s) => (
                      <li
                        key={s}
                        role="option"
                        aria-selected={false}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addItem(s)}
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
                onClick={() => addItem()}
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

        {/* Phones: the answer comes straight after the form, the map after it.
            Desktop: map on top of the right column, answer beneath. */}
        <div className="mt-2 flex flex-col lg:mt-0" data-testid="tc-map-panel">
          <div className="order-2 mt-6 lg:order-1 lg:mt-0 print:hidden">
            <WorldMap
              originCode={nationality || undefined}
              destinationCode={mapDestinationCode}
              highlightCodes={
                destination === SCHENGEN_DESTINATION ? schengenCountries.map((c) => c.code) : []
              }
              originLabel={originLabel}
              destinationLabel={destinationLabel}
            />
          </div>
          {result && legResults.length > 1 && (
            <div id="tc-result" className="order-1 scroll-mt-4 lg:order-2">
              <ShareTripLink
                state={{ nationality, destination, legs: extraLegs, transit, items }}
              />
              <RouteSummary legs={legResults} items={items} />
              <RoutePassportCheck legs={legResults} />
              {legResults.map((leg, i) => (
                <details key={leg.destination} open={i === 0} className="mt-4 rounded-2xl border border-slate-200 p-3" data-testid="tc-leg-details">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                    {t("legHeading", { n: i + 1, country: leg.destinationName })}
                  </summary>
                  <TripCheckResults
                    result={leg}
                    originName={originLabel ?? nationality}
                    onEdit={() => document.getElementById("tc-nationality")?.focus()}
                  />
                </details>
              ))}
            </div>
          )}
          {result && legResults.length <= 1 && (
            <div id="tc-result" className="order-1 scroll-mt-4 lg:order-2">
              <ShareTripLink
                state={{ nationality, destination, legs: extraLegs, transit, items }}
              />
              <TripCheckResults
                result={result}
                originName={originLabel ?? nationality}
                onEdit={() => {
                  const field = document.getElementById("tc-nationality");
                  field?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  field?.focus({ preventScroll: true });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const VERDICT_TONE: Record<string, string> = {
  prohibited: "bg-red-50 text-red-800",
  depends: "bg-amber-50 text-amber-800",
  declaration_required: "bg-amber-50 text-amber-800",
  allowed_with_limits: "bg-emerald-50 text-emerald-800",
  allowed: "bg-emerald-50 text-emerald-800",
};

/** One row per item, one column per country: the whole route at a glance.
 * Each cell restates that country's verified verdict; nothing is inferred
 * across borders (AGENTS.md §3). */
function RouteSummary({ legs, items }: { legs: TripCheckResult[]; items: string[] }) {
  const t = useTranslations("tripCheck");
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-testid="tc-route-summary">
      <h2 className="text-sm font-semibold text-slate-900">{t("routeTitle")}</h2>
      <p className="mt-1 text-xs text-slate-600">{t("routeHint")}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[20rem] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-3 font-medium">{t("routeColumnFirst")}</th>
              {legs.map((leg) => (
                <th key={leg.destination} className="py-2 pr-3 font-medium text-slate-900">
                  {leg.destinationName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-3 font-medium text-slate-700">{t("routeEntryRow")}</td>
              {legs.map((leg) => (
                <td key={leg.destination} className="py-2 pr-3 text-slate-800" data-testid="tc-route-entry">
                  {t(`routeBasis.${leg.basis}`)}
                </td>
              ))}
            </tr>
            {items.map((item) => (
              <tr key={item} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-3 font-medium break-words text-slate-700">{item}</td>
                {legs.map((leg) => {
                  const match = leg.items.find((i) => i.query === item)?.match;
                  const intra = leg.intraEuCustoms && !match;
                  return (
                    <td key={leg.destination} className="py-2 pr-3" data-testid="tc-route-cell">
                      {match ? (
                        <span className={`inline-block rounded px-1.5 py-0.5 ${VERDICT_TONE[match.verdict] ?? ""}`}>
                          {t(`routeVerdict.${match.verdict}`)}
                        </span>
                      ) : (
                        <span className="text-slate-400">{intra ? t("routeIntraEu") : t("routeNotCovered")}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TripCheckResults({
  result,
  originName,
  onEdit,
}: {
  result: TripCheckResult;
  originName: string;
  onEdit: () => void;
}) {
  const t = useTranslations("tripCheck");
  const checked = result.verifiedAt ? t("checkedOn", { date: result.verifiedAt }) : undefined;

  // The exact scenario evaluated, as a route — so the answer below is never
  // read as being about a different trip.
  const scenario = (
    <div
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-3"
      data-testid="tc-scenario"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          {t("scenarioLabel")}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm font-medium break-words text-slate-900">
          <span>{t("scenarioPassport", { origin: originName })}</span>
          <span aria-hidden="true" className="inline-flex items-center text-brand-700">
            <span className="h-px w-6 border-t border-dashed border-current" />
            <span className="-ml-0.5 text-xs">▶</span>
          </span>
          <span className="sr-only">{t("scenarioTo")}</span>
          <span>{result.destinationName}</span>
        </p>
        {result.items.length > 0 && (
          <p className="mt-0.5 text-xs break-words text-slate-600">
            {t("scenarioItems", {
              items: result.items.map((i) => i.query).join(", "),
            })}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 print:hidden"
      >
        {t("editTrip")}
      </button>
    </div>
  );

  if (!result.covered) {
    return (
      <>
        {scenario}
        <div
          data-testid="tc-not-covered"
          className="mt-4 animate-fade-in-up rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 motion-reduce:animate-none"
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
      </>
    );
  }

  const showAssumption = result.basis !== "citizen" && result.basis !== "free_movement";

  return (
    <>
      {scenario}
      <div className="mt-4 animate-fade-in-up space-y-4 motion-reduce:animate-none" data-testid="tc-results">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{t("entryCardTitle")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-800" data-testid="tc-basis">
            {t(BASIS_LABEL_KEY[result.basis], {
              destination: result.destinationName,
            })}
          </p>
          {(showAssumption || result.notes) && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              <p className="font-semibold text-slate-700">{t("conditionsTitle")}</p>
              {showAssumption && <p className="mt-1">{t("assumption", { origin: originName })}</p>}
              {result.notes && <p className="mt-1">{result.notes}</p>}
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {result.stayPolicy && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{t("stayCardTitle")}</h3>
                <p className="mt-1 text-sm text-slate-700" data-testid="tc-stay">
                  {result.stayPolicy.kind === "rolling_window"
                    ? result.stayPolicy.maxDaysPerEntry
                      ? t("stayRollingWindowPerEntry", {
                          perEntry: result.stayPolicy.maxDaysPerEntry,
                          maxDays: result.stayPolicy.maxDays,
                          windowDays: result.stayPolicy.windowDays,
                        })
                      : t("stayRollingWindow", {
                          maxDays: result.stayPolicy.maxDays,
                          windowDays: result.stayPolicy.windowDays,
                        })
                    : result.stayPolicy.kind === "fixed_per_entry"
                      ? t("stayFixedPerEntry", {
                          maxDays: result.stayPolicy.maxDays,
                        })
                      : result.basis === "visa_required"
                        ? t("stayVisaRequired")
                        : t("stayUnconfirmed")}
                </p>
                {result.isSchengen && (
                  <a href="/calculator" className="mt-2 inline-block text-xs underline">
                    {t("trackInCalculator")}
                  </a>
                )}
              </div>
            )}
            {result.documentsNeeded.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{t("documentsCardTitle")}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-700">
                  {result.documentsNeeded.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.passportLine &&
              (result.passportValidity || /\b(\d+|one|two|three|six)[ -](months?|days?)\b/i.test(result.passportLine)) && (
                <PassportValidityCheck rule={result.passportValidity} line={result.passportLine} />
              )}
          </div>

          {result.legalSource && (
            <SourceNote
              className="mt-4"
              name={result.legalSource.name}
              url={result.legalSource.url}
              date={result.verifiedAt}
              sourceLabel={t("sourceLabel")}
              checkedLabel={checked}
            />
          )}
        </section>

        {result.items.length > 0 && (
          <section
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="tc-items"
          >
            <h2 className="text-sm font-semibold text-slate-900">{t("itemsCardTitle")}</h2>
            {result.intraEuCustoms && (
              <p className="mt-1 text-xs text-amber-700" data-testid="tc-intra-eu-customs">
                {t("intraEuCustoms")}
              </p>
            )}
            <ul className="mt-2 divide-y divide-slate-100">
              {/* Intra-EU: only national rules (which bind everyone) and any
                  stopover's rules are shown; the note above covers the rest. */}
              {result.items.filter((item) => !result.intraEuCustoms || item.match || result.transit).map((item) => (
                <li key={item.query} data-testid="tc-item-result" className="py-3 first:pt-1 last:pb-0">
                  <p className="text-sm font-medium break-words text-slate-900">{item.query}</p>
                  {item.match ? (
                    <>
                      <p className="text-sm text-slate-700">{t(`verdict.${item.match.verdict}`)}</p>
                      {item.match.limits && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          {item.match.limits.description}
                        </p>
                      )}
                      {item.match.notes && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.match.notes}</p>
                      )}
                      {item.match.procedure && procedureHref(item.match) && (
                        <a
                          href={procedureHref(item.match)}
                          className="mt-1 inline-block text-xs font-semibold text-brand-700 underline underline-offset-2"
                          data-testid="tc-item-procedure"
                        >
                          {t("procedureLink")}
                        </a>
                      )}
                      <SourceNote
                        className="mt-2"
                        name={item.match.legal_source.name}
                        url={item.match.legal_source.url}
                        date={item.match.verified_at}
                        sourceLabel={t("sourceLabel")}
                        checkedLabel={
                          item.match.verified_at
                            ? t("checkedOn", { date: item.match.verified_at })
                            : undefined
                        }
                      />
                    </>
                  ) : result.intraEuCustoms ? null : (
                    <p className="text-xs text-amber-700" data-testid="tc-item-not-found">
                      {t("itemNotFound", {
                        destination: result.destinationName,
                      })}
                    </p>
                  )}
                  {result.transit && item.transitMatch !== undefined && (
                    <TransitBlock country={result.transit.name} row={item.transitMatch} />
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

/** Copies a link that reopens this exact result. The trip is in the URL fragment, never sent to a server. */
function ShareTripLink({ state }: { state: Parameters<typeof encodeTripShare>[0] }) {
  const t = useTranslations("tripCheck");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const hash = encodeTripShare(state);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    window.history.replaceState(null, "", `#${hash}`);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the address bar now holds the link, which can be copied by hand.
    }
  };
  const print = () => {
    // Expand every stop so the printout holds the whole trip, then print.
    document.querySelectorAll<HTMLDetailsElement>("#tc-result details").forEach((d) => (d.open = true));
    window.history.replaceState(null, "", `#${encodeTripShare(state)}`);
    window.print();
  };
  const printedFrom =
    typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}#${encodeTripShare(state)}`;
  return (
    <>
    <p className="hidden text-xs text-slate-600 print:block" data-testid="tc-print-note">
      {t("printNote", { url: printedFrom })}
    </p>
    <div className="mt-6 flex flex-wrap items-center justify-end gap-2 text-xs print:hidden">
      <span className="text-slate-500">{t("shareHint")}</span>
      <button
        type="button"
        data-testid="tc-print"
        onClick={print}
        className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
      >
        {t("printTrip")}
      </button>
      <button
        type="button"
        data-testid="tc-share"
        onClick={() => void copy()}
        className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
      >
        {copied ? t("shareCopied") : t("shareCopy")}
      </button>
    </div>
    </>
  );
}
