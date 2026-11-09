import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import deMessages from "../../../messages/de.json";
import { germanPairsForProduct, germanProductName, germanProducts } from "../../../lib/german-medications";

/** German index of named medicines with German pages (GROWTH_AND_ROADMAP.md §5.5). */
const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });
const tm = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages.medications" });

export function generateMetadata(): Metadata {
  const title = tm("indexMetaTitle");
  const description = tm("indexIntro");
  return {
    title,
    description,
    alternates: { canonical: "/de/medications", languages: { en: "/medications", de: "/de/medications", "x-default": "/medications" } },
    openGraph: { title, description, locale: "de_DE" },
  };
}

export default function GermanMedicationsIndex() {
  return (
    <article lang="de" className="mx-auto max-w-3xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/de/bring" className="hover:text-slate-900">
          {t("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{tm("breadcrumbRoot")}</span>
      </nav>
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{tm("indexMetaTitle")}</h1>
        <p className="mt-2 text-sm text-slate-600">{tm("indexIntro")}</p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2" data-testid="de-medications-list">
        {germanProducts.map((p) => (
          <li key={p.slug}>
            <a href={`/de/medications/${p.slug}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-900">
              <span className="font-semibold text-slate-900">{germanProductName(p)}</span>
              <span className="mt-1 block text-xs text-slate-500">{tm("countries", { count: germanPairsForProduct(p.slug).length })}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <a href="/medications" hrefLang="en" lang="en" className="text-blue-700 underline">
          {t("allCountriesEnglish")}
        </a>
      </p>
      <p className="text-xs leading-relaxed text-slate-500">
        {t("disclaimer")} {tm("medicalDisclaimer")}
      </p>
    </article>
  );
}
