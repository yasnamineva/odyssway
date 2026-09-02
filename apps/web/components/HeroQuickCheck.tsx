"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { schengenCountries } from "../lib/countries";
import { destinations, queuedDestinations } from "../lib/destinations";
import { publishedNationalities } from "../lib/nationalities";
import { SCHENGEN_DESTINATION } from "../lib/trip-check";
import SearchableSelect from "./SearchableSelect";

/**
 * The floating "quick check" widget over the hero photo — two fields that
 * jump straight into Trip Check pre-filled, instead of making the reader
 * scroll to a plain link. Reuses tripCheck's own copy so the language stays
 * identical between the teaser and the real form.
 */
export default function HeroQuickCheck() {
  const t = useTranslations("tripCheck");
  const th = useTranslations("home.quickCheck");
  const router = useRouter();
  const [nationality, setNationality] = useState("");
  const [destination, setDestination] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!nationality || !destination) return;
        const params = new URLSearchParams({ nationality, destination });
        router.push(`/trip-check?${params.toString()}`);
      }}
    >
      <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">{th("eyebrow")}</p>
      <h2 className="mt-1 font-display text-lg font-bold text-slate-900">{th("heading")}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500" htmlFor="hero-nationality">
            {t("fromLabel")}
          </label>
          <div className="mt-1">
            <SearchableSelect
              id="hero-nationality"
              data-testid="hero-nationality"
              value={nationality}
              onChange={setNationality}
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
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500" htmlFor="hero-destination">
            {t("toLabel")}
          </label>
          <div className="mt-1">
            <SearchableSelect
              id="hero-destination"
              data-testid="hero-destination"
              value={destination}
              onChange={setDestination}
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
        </div>
        <button
          type="submit"
          data-testid="hero-quick-check-submit"
          disabled={!nationality || !destination}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("submit")}
        </button>
      </div>
    </form>
  );
}
