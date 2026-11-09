import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import { notFound } from "next/navigation";
import deMessages from "../../../../../messages/de.json";
import GermanCustomsRowCard from "../../../../../components/GermanCustomsRowCard";
import { VERDICT_STYLES } from "../../../../../components/CustomsRowCard";
import { BRING_CATEGORIES } from "../../../../../lib/bring-categories";
import { bringPair } from "../../../../../lib/bring-pages";
import {
  germanPairsForProduct,
  germanProductName,
  germanProductPair,
  germanProductPairs,
  hasGermanProductHub,
} from "../../../../../lib/german-medications";
import { latestVerified, type ProductPair } from "../../../../../lib/medication-products";
import { translationProblemHref } from "../../../../../lib/report-problem";
import {
  countryName,
  germanDate,
  germanRowHeading,
  hasGermanPage,
  translatedCustomsRow,
} from "../../../../../lib/translations";

/**
 * German named-medicine pages (GROWTH_AND_ROADMAP.md §5.5): the English
 * /medications/{product}/{country} page in German, built only where every row has a
 * fresh, complete translation. Slugs stay English so each pairs 1:1 with its original.
 */
interface Params {
  product: string;
  destination: string;
}

const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });
const tm = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages.medications" });

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return germanProductPairs.map((p) => ({ product: p.product.slug, destination: p.destinationSlug }));
}

const englishPath = (p: ProductPair) => `/medications/${p.product.slug}/${p.destinationSlug}`;
const germanPath = (p: ProductPair) => `/de${englishPath(p)}`;
const country = (p: ProductPair) => countryName(p.destination.code, "de", p.destination.name);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { product, destination } = await params;
  const pair = germanProductPair(product, destination);
  if (!pair) return {};
  const vars = { country: country(pair), product: germanProductName(pair.product) };
  const checked = latestVerified(pair.rows);
  const title = tm("metaTitle", { ...vars, year: (checked ?? "").slice(0, 4) });
  const lead = pair.rows
    .map((r) => translatedCustomsRow(r, "de")?.summary)
    .filter(Boolean)
    .join(" ");
  const description = `${lead} ${t("metaDescriptionTail", { date: germanDate(checked) })}`.trim();
  return {
    title,
    description,
    alternates: {
      canonical: germanPath(pair),
      languages: { en: englishPath(pair), de: germanPath(pair), "x-default": englishPath(pair) },
    },
    openGraph: { title, description, locale: "de_DE" },
  };
}

export default async function GermanMedicationPairPage({ params }: { params: Promise<Params> }) {
  const { product, destination } = await params;
  const pair = germanProductPair(product, destination);
  if (!pair) notFound();

  const name = country(pair);
  const productName = germanProductName(pair.product);
  const vars = { country: name, product: productName };
  const h1 = tm("h1", vars);
  const rowHeading = (slug: string) => {
    if (pair.rows.length === 1) return t("categories.medication.label");
    const h = germanRowHeading(slug, pair)!;
    return h.kind === "shared" ? t("euRows") : h.kind === "label" ? h.label : t("nationalRows", { country: name });
  };
  const others = germanPairsForProduct(pair.product.slug)
    .filter((p) => p.destination.code !== pair.destination.code)
    .map((p) => ({ p, name: country(p) }))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
  const sameDestination = germanProductPairs.filter(
    (p) => p.destination.code === pair.destination.code && p.product.slug !== pair.product.slug,
  );
  const medicationPage = bringPair(BRING_CATEGORIES.medication.slug, pair.destinationSlug);
  const checked = latestVerified(pair.rows);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "de",
    ...(checked ? { dateModified: checked } : {}),
    mainEntity: [
      {
        "@type": "Question",
        name: h1,
        acceptedAnswer: {
          "@type": "Answer",
          text: pair.rows
            .map((r) => `${t(`verdict.${r.verdict}`)}. ${translatedCustomsRow(r, "de")?.summary ?? ""}`.trim())
            .join(" "),
        },
      },
    ],
  };

  return (
    <article lang="de" className="mx-auto max-w-3xl space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/de/medications" className="hover:text-slate-900">
          {tm("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        {hasGermanProductHub(pair.product.slug) ? (
          <a href={`/de/medications/${pair.product.slug}`} className="hover:text-slate-900">
            {productName}
          </a>
        ) : (
          <span>{productName}</span>
        )}
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{name}</span>
      </nav>

      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{h1}</h1>
        <section className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm" data-testid="de-short-answer">
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {pair.rows.length === 1 ? t("shortAnswer") : t("atAGlance")}
          </h2>
          <ul className="mt-2 space-y-2">
            {pair.rows.map((r) => (
              <li key={r.slug}>
                {pair.rows.length > 1 && <span className="font-medium text-slate-900">{rowHeading(r.slug)}: </span>}
                <span className="font-medium text-slate-900">{t(`verdict.${r.verdict}`)}</span>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{translatedCustomsRow(r, "de")?.summary}</p>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{tm("ruleScope", vars)}</p>
        <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-950 ring-1 ring-blue-200" data-testid="de-translation-notice">
          {t("translatedNotice")}{" "}
          <a href={englishPath(pair)} hrefLang="en" lang="en" className="font-medium underline">
            {t("englishVersion")}
          </a>
          {" · "}
          <a href={translationProblemHref({ path: germanPath(pair), englishPath: englishPath(pair), locale: "de" })} className="underline">
            {t("reportTranslation")}
          </a>
        </p>
      </header>

      <h2 className="text-lg font-semibold text-slate-900">{t("rulesHeading")}</h2>
      <ul className="space-y-4">
        {pair.rows.map((r) => (
          <GermanCustomsRowCard key={r.slug} row={r} heading={rowHeading(r.slug)} country={name} />
        ))}
      </ul>

      <p className="text-sm">
        <a href="/trip-check" className="font-medium text-blue-700 underline">
          {t("checkYourTrip")}
        </a>
        {medicationPage && hasGermanPage(medicationPage) ? (
          <>
            <span className="mx-2 text-slate-300" aria-hidden="true">
              |
            </span>
            <a href={`/de/bring/${medicationPage.itemSlug}/${medicationPage.destinationSlug}`} className="text-blue-700 underline">
              {tm("medicationGuide", { country: name })}
            </a>
          </>
        ) : null}
      </p>

      {others.length > 0 && (
        <section data-testid="de-product-elsewhere">
          <h2 className="text-base font-semibold text-slate-900">{tm("otherCountries", { product: productName })}</h2>
          <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm">
            {others.map(({ p, name: otherName }) => (
              <li key={p.destination.code} className="flex items-center justify-between gap-3 py-2">
                <a href={germanPath(p)} className="text-slate-900 underline decoration-slate-300 underline-offset-2">
                  {otherName}
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
              </li>
            ))}
          </ul>
          {hasGermanProductHub(pair.product.slug) && (
            <p className="mt-3 text-sm">
              <a href={`/de/medications/${pair.product.slug}`} className="text-blue-700 underline">
                {tm("allCountries", { product: productName })}
              </a>
            </p>
          )}
        </section>
      )}

      {sameDestination.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-900">{tm("otherMedicines", { country: name })}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {sameDestination.map((p) => (
              <li key={p.product.slug}>
                <a
                  href={germanPath(p)}
                  className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {germanProductName(p.product)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        {t("disclaimer")} {tm("medicalDisclaimer")}
      </p>
    </article>
  );
}
