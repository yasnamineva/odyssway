"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { schengenCountries } from "../lib/countries";
import { destinations } from "../lib/destinations";
import { SITE_URL } from "../lib/site";
import { resolveItem, SCHENGEN_DESTINATION } from "../lib/trip-check";
import SearchableSelect from "./SearchableSelect";
import SourceNote from "./SourceNote";

const VERDICT_TONE: Record<string, string> = {
  prohibited: "text-red-700",
  allowed_with_limits: "text-amber-800",
  allowed: "text-emerald-700",
  declaration_required: "text-blue-700",
  depends: "text-slate-800",
};

/**
 * The embeddable "Can I bring it?" box (/embed/can-i-bring): destination +
 * item → the verified verdict with its source and date, and a link to the
 * full answer. Everything runs in the reader's browser; nothing is sent to us
 * or to the host site (AGENTS.md §10).
 */
export default function CanIBringWidget() {
  const t = useTranslations("canIBring");
  const tc = useTranslations("tripCheck");
  const [destination, setDestination] = useState("");
  const [item, setItem] = useState("");
  const [asked, setAsked] = useState<{ destination: string; item: string } | null>(null);

  const isSchengen = (code: string) =>
    code === SCHENGEN_DESTINATION || schengenCountries.some((c) => c.code === code);
  const destinationName = (code: string) =>
    code === SCHENGEN_DESTINATION
      ? tc("schengenArea")
      : (destinations.find((d) => d.code === code)?.name ??
        schengenCountries.find((c) => c.code === code)?.name ??
        code);

  const match = asked ? resolveItem(asked.destination, asked.item) : null;
  const fullAnswer = asked
    ? `${SITE_URL}/trip-check?destination=${encodeURIComponent(asked.destination)}`
    : `${SITE_URL}/trip-check`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-testid="cib-widget">
      <h1 className="font-display text-lg font-bold text-slate-900">{t("title")}</h1>
      <form
        className="mt-3 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (destination && item.trim()) setAsked({ destination, item: item.trim() });
        }}
      >
        <div>
          <label className="block text-xs font-medium text-slate-600" htmlFor="cib-destination">
            {t("destinationLabel")}
          </label>
          <SearchableSelect
            id="cib-destination"
            data-testid="cib-destination"
            value={destination}
            onChange={(v) => {
              setDestination(v);
              setAsked(null);
            }}
            placeholder={tc("toPlaceholder")}
            noResultsLabel={tc("noMatches")}
            groups={[
              { options: [{ value: SCHENGEN_DESTINATION, label: tc("schengenArea") }] },
              {
                label: tc("toGroupDestinations"),
                options: destinations
                  .filter((d) => d.status === "verified")
                  .map((d) => ({ value: d.code, label: d.name })),
              },
              {
                label: tc("toGroupSchengenStates"),
                options: schengenCountries.map((c) => ({ value: c.code, label: c.name })),
              },
            ]}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600" htmlFor="cib-item">
            {t("itemLabel")}
          </label>
          <input
            id="cib-item"
            data-testid="cib-item"
            type="text"
            autoComplete="off"
            value={item}
            onChange={(e) => {
              setItem(e.target.value);
              setAsked(null);
            }}
            placeholder={t("itemPlaceholder")}
            className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          data-testid="cib-submit"
          disabled={!destination || !item.trim()}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("submit")}
        </button>
      </form>

      {asked && (
        <div className="mt-4 border-t border-slate-100 pt-3" data-testid="cib-result" aria-live="polite">
          <p className="text-sm font-medium break-words text-slate-900">
            {t("resultHeading", { item: asked.item, destination: destinationName(asked.destination) })}
          </p>
          {match ? (
            <>
              <p className={`mt-1 text-sm font-semibold ${VERDICT_TONE[match.verdict] ?? ""}`}>
                {tc(`verdict.${match.verdict}`)}
              </p>
              {match.limits && (
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{match.limits.description}</p>
              )}
              {isSchengen(asked.destination) && match.destination === "EU" && (
                <p className="mt-1 text-xs text-slate-500">{t("euNote")}</p>
              )}
              <SourceNote
                className="mt-2"
                name={match.legal_source.name}
                url={match.legal_source.url}
                date={match.verified_at}
                sourceLabel={tc("sourceLabel")}
                checkedLabel={match.verified_at ? tc("checkedOn", { date: match.verified_at }) : undefined}
              />
            </>
          ) : (
            <p className="mt-1 text-xs text-amber-700">
              {tc("itemNotFound", { destination: destinationName(asked.destination) })}
            </p>
          )}
          <a
            href={fullAnswer}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-block text-xs font-semibold text-brand-700 underline underline-offset-2"
          >
            {t("fullAnswer")}
          </a>
        </div>
      )}
      <p className="mt-4 text-[11px] leading-snug text-slate-500">
        {t("disclaimer")}{" "}
        <a href={SITE_URL} target="_blank" rel="noopener" className="underline">
          {t("poweredBy")}
        </a>
      </p>
    </section>
  );
}
