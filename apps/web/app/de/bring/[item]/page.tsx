import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import { notFound } from "next/navigation";
import deMessages from "../../../../messages/de.json";
import { bringCategoryBySlug } from "../../../../lib/bring-categories";
import { GERMAN_INDEXABLE, countryName, germanPairs, translatedCustomsRow } from "../../../../lib/translations";

/** German hub for one item category: every country with a German page for it (GROWTH_AND_ROADMAP.md §5.5). */
const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });

export const dynamicParams = false;

export function generateStaticParams(): Array<{ item: string }> {
  return [...new Set(germanPairs().map((p) => p.itemSlug))].map((item) => ({ item }));
}

function pagesFor(item: string) {
  const category = bringCategoryBySlug(item);
  if (!category) return null;
  const pairs = germanPairs()
    .filter((p) => p.category === category)
    .map((p) => ({ p, name: countryName(p.destination.code, "de", p.destination.name) }))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
  return pairs.length ? { category, pairs } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ item: string }> }): Promise<Metadata> {
  const { item } = await params;
  const hub = pagesFor(item);
  if (!hub) return {};
  const label = t(`categories.${hub.category}.label`);
  const title = t("hubMetaTitle", { label });
  const description = t("hubIntro", { label });
  return {
    title,
    description,
    alternates: { canonical: `/de/bring/${item}`, ...(GERMAN_INDEXABLE ? { languages: { en: `/bring/${item}`, de: `/de/bring/${item}`, "x-default": `/bring/${item}` } } : {}) },
    openGraph: { title, description, locale: "de_DE" },
  };
}

export default async function GermanBringHub({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  const hub = pagesFor(item);
  if (!hub) notFound();
  const label = t(`categories.${hub.category}.label`);
  return (
    <article lang="de" className="mx-auto max-w-3xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/de/bring" className="hover:text-slate-900">
          {t("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{label}</span>
      </nav>
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("hubMetaTitle", { label })}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("hubIntro", { label })}</p>
        <p className="mt-1 text-xs text-slate-500">{t("hubCountries", { count: hub.pairs.length })}</p>
      </header>
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm" data-testid="de-hub-list">
        {hub.pairs.map(({ p, name }) => (
          <li key={p.destination.code} className="px-5 py-3">
            <a href={`/de/bring/${p.itemSlug}/${p.destinationSlug}`} className="font-medium text-blue-700 underline">
              {name}
            </a>
            <p className="mt-0.5 text-sm text-slate-600">
              {p.rows.length === 1
                ? `${t(`verdict.${p.rows[0]!.verdict}`)}: ${translatedCustomsRow(p.rows[0]!, "de")?.summary ?? ""}`
                : translatedCustomsRow(p.rows[0]!, "de")?.summary}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <a href={`/bring/${item}`} hrefLang="en" lang="en" className="text-blue-700 underline">
          {t("allCountriesEnglish")}
        </a>
      </p>
      <p className="text-xs leading-relaxed text-slate-500">{t("translatedNotice")}</p>
      <p className="text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>
    </article>
  );
}

