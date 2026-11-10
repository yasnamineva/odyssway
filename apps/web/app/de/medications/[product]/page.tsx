import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import { notFound } from "next/navigation";
import deMessages from "../../../../messages/de.json";
import { VERDICT_STYLES } from "../../../../components/CustomsRowCard";
import {
  germanPairsForProduct,
  germanProductName,
  germanProducts,
  verdictCounts,
} from "../../../../lib/german-medications";
import { latestVerified } from "../../../../lib/medication-products";
import { SITE_URL } from "../../../../lib/site";
import { GERMAN_INDEXABLE, countryName, germanDate, translatedCustomsRow } from "../../../../lib/translations";

/** German hub for one named medicine: every country with a German page for it (GROWTH_AND_ROADMAP.md §5.5). */
const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });
const tm = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages.medications" });

export const dynamicParams = false;

export function generateStaticParams(): Array<{ product: string }> {
  return germanProducts.map((p) => ({ product: p.slug }));
}

function hubFor(slug: string) {
  const product = germanProducts.find((p) => p.slug === slug);
  if (!product) return null;
  const pairs = germanPairsForProduct(slug)
    .map((p) => ({ p, name: countryName(p.destination.code, "de", p.destination.name) }))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
  return { product, name: germanProductName(product), pairs };
}

export async function generateMetadata({ params }: { params: Promise<{ product: string }> }): Promise<Metadata> {
  const { product } = await params;
  const hub = hubFor(product);
  if (!hub) return {};
  const title = tm("hubMetaTitle", { product: hub.name, count: hub.pairs.length });
  const description = tm("hubSummary", {
    product: hub.name,
    count: hub.pairs.length,
    ...verdictCounts(hub.pairs.map(({ p }) => p)),
  });
  return {
    title,
    description,
    alternates: {
      canonical: `/de/medications/${product}`,
      ...(GERMAN_INDEXABLE ? { languages: { en: `/medications/${product}`, de: `/de/medications/${product}`, "x-default": `/medications/${product}` } } : {}),
    },
    openGraph: { title, description, locale: "de_DE" },
  };
}

export default async function GermanMedicationHub({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  const hub = hubFor(product);
  if (!hub) notFound();
  const counts = verdictCounts(hub.pairs.map(({ p }) => p));
  const others = germanProducts.filter((p) => p.slug !== product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    inLanguage: "de",
    name: tm("hubH1", { product: hub.name }),
    itemListElement: hub.pairs.map(({ p, name }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      url: `${SITE_URL}/de/medications/${product}/${p.destinationSlug}`,
    })),
  };

  return (
    <article lang="de" className="mx-auto max-w-3xl space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/de/medications" className="hover:text-slate-900">
          {tm("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{hub.name}</span>
      </nav>
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{tm("hubH1", { product: hub.name })}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{tm("hubIntro", { product: hub.name })}</p>
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-800" data-testid="de-product-summary">
          {tm("hubSummary", { product: hub.name, count: hub.pairs.length, ...counts })}
        </p>
      </header>

      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm" data-testid="de-hub-list">
        {hub.pairs.map(({ p, name }) => (
          <li key={p.destination.code} className="px-5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <a href={`/de/medications/${product}/${p.destinationSlug}`} className="font-medium text-blue-700 underline">
                {name}
              </a>
              <span className="flex flex-wrap justify-end gap-1">
                {p.rows.map((r) => (
                  <span
                    key={r.slug}
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${VERDICT_STYLES[r.verdict] ?? VERDICT_STYLES.depends}`}
                  >
                    {t(`verdict.${r.verdict}`)}
                  </span>
                ))}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{translatedCustomsRow(p.rows[0]!, "de")?.summary}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t("checked", { date: germanDate(latestVerified(p.rows)) })}</p>
          </li>
        ))}
      </ul>

      <p className="text-sm text-slate-600">
        {tm("missing", { product: hub.name })}{" "}
        <a href={`/medications/${product}`} hrefLang="en" lang="en" className="text-blue-700 underline">
          {t("allCountriesEnglish")}
        </a>
      </p>

      {others.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-900">{tm("breadcrumbRoot")}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((p) => (
              <li key={p.slug}>
                <a
                  href={`/de/medications/${p.slug}`}
                  className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {germanProductName(p)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-relaxed text-slate-500">{t("translatedNotice")}</p>
      <p className="text-xs leading-relaxed text-slate-500">
        {t("disclaimer")} {tm("medicalDisclaimer")}
      </p>
    </article>
  );
}
