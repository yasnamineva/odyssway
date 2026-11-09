import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import deMessages from "../../../messages/de.json";
import { germanPairs } from "../../../lib/translations";
import { BRING_CATEGORIES, type BringCategory } from "../../../lib/bring-categories";

/** German index of "Can I bring it?" categories that have German pages (GROWTH_AND_ROADMAP.md §5.5). */
const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });

export function generateMetadata(): Metadata {
  const title = t("indexMetaTitle");
  const description = t("indexIntro");
  return {
    title,
    description,
    alternates: { canonical: "/de/bring", languages: { en: "/bring", de: "/de/bring", "x-default": "/bring" } },
    openGraph: { title, description, locale: "de_DE" },
  };
}

export default function GermanBringIndex() {
  const counts = new Map<BringCategory, number>();
  for (const p of germanPairs()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const categories = (Object.keys(BRING_CATEGORIES) as BringCategory[]).filter((c) => counts.has(c));
  return (
    <article lang="de" className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("indexMetaTitle")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("indexIntro")}</p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2" data-testid="de-index-list">
        {categories.map((c) => (
          <li key={c}>
            <a
              href={`/de/bring/${BRING_CATEGORIES[c].slug}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-900"
            >
              <span className="font-semibold text-slate-900">{t(`categories.${c}.label`)}</span>
              <span className="mt-1 block text-xs text-slate-500">{t("hubCountries", { count: counts.get(c)! })}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <a href="/de/medications" className="font-medium text-blue-700 underline">
          {t("medications.indexMetaTitle")} →
        </a>
      </p>
      <p className="text-sm">
        <a href="/bring" hrefLang="en" lang="en" className="text-blue-700 underline">
          {t("allCountriesEnglish")}
        </a>
      </p>
      <p className="text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>
    </article>
  );
}
