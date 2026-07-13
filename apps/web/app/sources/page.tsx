import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import rawCountriesFile from "../../../../data/countries.json";
import { countriesVerifiedAt } from "../../lib/countries";
import { etias, etiasSources, type SourceNote } from "../../lib/etias";
import { publishedNationalities } from "../../lib/nationalities";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.sources");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/sources" },
  };
}

const countrySources: SourceNote[] =
  (rawCountriesFile as { _sources?: SourceNote[] })._sources ?? [];

/** Official pages behind the MDX guides (each guide also cites these inline). */
const contentSources = [
  {
    name: "European Commission — User Manual for the Short-Stay Schengen Calculator",
    url: "https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf",
    usedFor: "/rules/90-180-rule, calculator engine",
    checked: "2026-07-12",
  },
  {
    name: "European Commission — Entry/Exit System (Migration & Home Affairs)",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/smart-borders/entry-exit-system_en",
    usedFor: "/ees, /ees/what-to-expect, /ees/dispute-overstay",
    checked: "2026-07-13",
  },
  {
    name: "Regulation (EU) 2017/2226 (EES Regulation), Art. 52 — consolidated version of 12 June 2026",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02017R2226-20260612",
    usedFor: "/ees/dispute-overstay (correction rights, deadlines)",
    checked: "2026-07-13",
  },
  {
    name: "Regulation (EU) 2016/399 (Schengen Borders Code), Art. 6(1)–(2) — consolidated version of 12 October 2025",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02016R0399-20251012",
    usedFor: "calculator engine (core 90/180 rule, entry/exit days, permit exclusion)",
    checked: "2026-07-13",
  },
  {
    name: "European Commission — Schengen area (Migration & Home Affairs)",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/schengen-area_en",
    usedFor: "country data",
    checked: "2026-07-13",
  },
  {
    name: "EEAS — Coming to Europe visa-free (official EU)",
    url: "https://www.eeas.europa.eu/eeas/coming-visa-free-country-and-travelling-europe_en",
    usedFor: "/etias/status",
    checked: "2026-07-13",
  },
  {
    name: "EDPB — Members (national data protection authorities)",
    url: "https://www.edpb.europa.eu/about-edpb/about-edpb/members_en",
    usedFor: "/ees/data-access/[country] (authority identities)",
    checked: "2026-07-13",
  },
];

function SourceList({ sources }: { sources: SourceNote[] }) {
  return (
    <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
      {sources.map((s, i) => (
        <li key={i}>
          {s.claim} —{" "}
          <a href={s.url} rel="noopener noreferrer" className="underline">
            {s.name}
          </a>{" "}
          <span className="text-xs text-slate-500">({s.checked})</span>
        </li>
      ))}
    </ul>
  );
}

export default async function SourcesPage() {
  const t = await getTranslations("sourcesPage");

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("h1")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("dataTitle")}</h2>

        <h3 className="mt-4 text-sm font-semibold text-slate-800">
          countries.json{" "}
          <span className="font-normal text-xs text-slate-500">
            — {t("verifiedLabel", { date: countriesVerifiedAt })}
          </span>
        </h3>
        <SourceList sources={countrySources} />

        <h3 className="mt-6 text-sm font-semibold text-slate-800">
          etias.json{" "}
          <span className="font-normal text-xs text-slate-500">
            — {t("verifiedLabel", { date: etias.verified_at ?? "" })}
          </span>
        </h3>
        <SourceList sources={etiasSources} />

        <h3 className="mt-6 text-sm font-semibold text-slate-800">
          nationality-rules.json{" "}
          <span className="font-normal text-xs text-slate-500">
            — {t("verifiedLabel", { date: publishedNationalities[0]?.verified_at ?? "" })}
          </span>
        </h3>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
          <li>
            {publishedNationalities.map((r) => r.name).join(", ")} —{" "}
            <a
              href={publishedNationalities[0]?.legal_source.url}
              rel="noopener noreferrer"
              className="underline"
            >
              {publishedNationalities[0]?.legal_source.name}
            </a>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("contentTitle")}</h2>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
          {contentSources.map((s, i) => (
            <li key={i}>
              <a href={s.url} rel="noopener noreferrer" className="underline">
                {s.name}
              </a>{" "}
              — {s.usedFor}{" "}
              <span className="text-xs text-slate-500">
                ({t("checkedLabel", { date: s.checked })})
              </span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
