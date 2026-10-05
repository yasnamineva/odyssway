"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SCHENGEN_DESTINATION } from "../lib/schengen-sentinel";
import SearchableSelect from "./SearchableSelect";

export interface QuickCheckPlace {
  code: string;
  name: string;
}

/** Built on the server (see app/page.tsx) and passed in, so the homepage
 * ships these short name lists instead of the whole data corpus. */
export interface QuickCheckOptions {
  nationalities: QuickCheckPlace[];
  destinations: QuickCheckPlace[];
  schengenStates: QuickCheckPlace[];
  comingSoon: QuickCheckPlace[];
}

/**
 * The floating "quick check" widget over the hero photo — two fields that
 * jump straight into Trip Check pre-filled, instead of making the reader
 * scroll to a plain link. Reuses tripCheck's own copy so the language stays
 * identical between the teaser and the real form.
 */
export default function HeroQuickCheck({ options }: { options: QuickCheckOptions }) {
  const t = useTranslations("tripCheck");
  const th = useTranslations("home.quickCheck");
  const router = useRouter();
  const [nationality, setNationality] = useState("");
  const [destination, setDestination] = useState("");
  const [attempted, setAttempted] = useState(false);
  const missing = attempted && (!nationality || !destination);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!nationality || !destination) {
          setAttempted(true);
          return;
        }
        const params = new URLSearchParams({ nationality, destination });
        router.push(`/trip-check?${params.toString()}`);
      }}
    >
      <p className="font-display text-sm text-brand-700 italic">{th("eyebrow")}</p>
      <h2 className="mt-0.5 font-display text-lg font-bold text-slate-900">{th("heading")}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
                  options: options.nationalities
                    .filter((n) => n.code !== destination)
                    .map((n) => ({ value: n.code, label: n.name })),
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
                  options: options.destinations
                    .filter((d) => d.code !== nationality)
                    .map((d) => ({ value: d.code, label: d.name })),
                },
                {
                  label: t("toGroupSchengenStates"),
                  options: options.schengenStates
                    .filter((c) => c.code !== nationality)
                    .map((c) => ({ value: c.code, label: c.name })),
                },
                {
                  label: t("toGroupComingSoon"),
                  options: options.comingSoon
                    .filter((d) => d.code !== nationality)
                    .map((d) => ({
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
          aria-describedby={missing ? "hero-quick-check-missing" : undefined}
          className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          {t("submit")}
        </button>
      </div>
      {missing ? (
        <p id="hero-quick-check-missing" role="alert" className="mt-2 text-xs text-red-700">
          {th("missing")}
        </p>
      ) : null}
    </form>
  );
}
