"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import SourceNote from "./SourceNote";
import { schengenCountries } from "../lib/countries";
import { destinationLabelFor } from "../lib/destination-label";
import { EU_CUSTOMS_CODE, customsItems, destinations, queuedDestinations } from "../lib/destinations";
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
  const [submitted, setSubmitted] = useState(Boolean(initialNationality && initialDestination));

  // Every verified synonym for the chosen destination's customs items — the
  // pool suggestions are filtered from as the user types. Free text is still
  // always allowed (Enter adds whatever was typed, in or out of this list);
  // suggestions are a shortcut, not a constraint (AGENTS.md §2: a pair not
  // being covered is a valid, honest answer, never a dead end).
  const itemSuggestionPool = useMemo(() => {
    if (!destination) return [];
    const isSchengen =
      destination === SCHENGEN_DESTINATION || schengenCountries.some((c) => c.code === destination);
    const customsDestination = isSchengen ? EU_CUSTOMS_CODE : destination;
    const pool = new Set<string>();
    customsItems
      .filter((it) => it.destination === customsDestination && it.status === "verified")
      .forEach((it) => it.names.forEach((n) => pool.add(n)));
    return [...pool].sort();
  }, [destination]);

  const itemSuggestions = useMemo(() => {
    const q = itemInput.trim().toLowerCase();
    if (!q) return [];
    return itemSuggestionPool.filter((n) => n.toLowerCase().includes(q) && !items.includes(n)).slice(0, 8);
  }, [itemInput, itemSuggestionPool, items]);

  const result: TripCheckResult | null = useMemo(() => {
    if (!submitted || !nationality || !destination) return null;
    return resolveTripCheck(nationality, destination, items);
  }, [submitted, nationality, destination, items]);

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

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <form
          className="space-y-4"
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
              groups={[
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
              ]}
            />
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
          <div className="order-2 mt-6 lg:order-1 lg:mt-0">
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
          {result && (
            <div id="tc-result" className="order-1 scroll-mt-4 lg:order-2">
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
        className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
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
                    ? t("stayRollingWindow", {
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

        {result.items.length > 0 && result.intraEuCustoms && (
          <section
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="tc-items"
          >
            <h2 className="text-sm font-semibold text-slate-900">{t("itemsCardTitle")}</h2>
            <p className="mt-1 text-xs text-amber-700" data-testid="tc-intra-eu-customs">
              {t("intraEuCustoms")}
            </p>
          </section>
        )}

        {result.items.length > 0 && !result.intraEuCustoms && (
          <section
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="tc-items"
          >
            <h2 className="text-sm font-semibold text-slate-900">{t("itemsCardTitle")}</h2>
            <ul className="mt-2 divide-y divide-slate-100">
              {result.items.map((item) => (
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
                  ) : (
                    <p className="text-xs text-amber-700" data-testid="tc-item-not-found">
                      {t("itemNotFound", {
                        destination: result.destinationName,
                      })}
                    </p>
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
