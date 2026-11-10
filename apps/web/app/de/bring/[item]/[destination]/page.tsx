import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import { notFound } from "next/navigation";
import deMessages from "../../../../../messages/de.json";
import { bringPair, type BringPair } from "../../../../../lib/bring-pages";
import {
  GERMAN_INDEXABLE,
  countryName,
  germanDate,
  germanPairs,
  germanRowHeading,
  isSharedRow,
  translatedCustomsRow,
} from "../../../../../lib/translations";
import GermanCustomsRowCard from "../../../../../components/GermanCustomsRowCard";
import { germanDestination } from "../../../../../lib/german-destinations";
import { translationProblemHref } from "../../../../../lib/report-problem";

/**
 * German pages for "Can I bring it?" pairs (GROWTH_AND_ROADMAP.md §5.5, pilot locale).
 * Generated only where every row on the English page has a fresh, complete German
 * translation; anything else 404s, so there are no half-translated or thin copies.
 * Slugs stay English so each page pairs 1:1 with its English original (hreflang).
 */
interface Params {
  item: string;
  destination: string;
}

const LOCALE = "de" as const;
const t = createTranslator({ locale: LOCALE, messages: deMessages, namespace: "dePages" });

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return germanPairs().map((p) => ({ item: p.itemSlug, destination: p.destinationSlug }));
}

function pairFor(item: string, destination: string): BringPair | undefined {
  const pair = bringPair(item, destination);
  return pair && germanPairs().some((p) => p === pair) ? pair : undefined;
}

const englishPath = (p: BringPair) => `/bring/${p.itemSlug}/${p.destinationSlug}`;
const germanPath = (p: BringPair) => `/de${englishPath(p)}`;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { item, destination } = await params;
  const pair = pairFor(item, destination);
  if (!pair) return {};
  const country = countryName(pair.destination.code, LOCALE, pair.destination.name);
  const year = (pair.lastVerified ?? "").slice(0, 4);
  const title = t("metaTitle", { country, item: t(`categories.${pair.category}.item`), year });
  const lead = translatedCustomsRow(pair.rows[0]!, LOCALE)?.summary ?? "";
  const description = `${lead} ${t("metaDescriptionTail", { date: germanDate(pair.lastVerified) })}`.trim();
  return {
    title,
    description,
    alternates: {
      canonical: germanPath(pair),
      ...(GERMAN_INDEXABLE ? { languages: { en: englishPath(pair), de: germanPath(pair), "x-default": englishPath(pair) } } : {}),
    },
    openGraph: { title, description, locale: "de_DE" },
  };
}

export default async function GermanBringPage({ params }: { params: Promise<Params> }) {
  const { item, destination } = await params;
  const pair = pairFor(item, destination);
  if (!pair) notFound();

  const country = countryName(pair.destination.code, LOCALE, pair.destination.name);
  const categoryLabel = t(`categories.${pair.category}.label`);
  const shared = (slug: string) => isSharedRow(slug, pair.destination.code);
  const rowHeading = (slug: string) => {
    if (pair.rows.length === 1) return categoryLabel;
    const h = germanRowHeading(slug, pair)!;
    return h.kind === "shared" ? t("euRows") : h.kind === "label" ? h.label : t("nationalRows", { country });
  };
  // National rows first, then the EU-wide row they add to.
  const rows = [...pair.rows].sort((a, b) => Number(shared(a.slug)) - Number(shared(b.slug)));
  const elsewhere = germanPairs()
    .filter((p) => p.category === pair.category && p.destination.code !== pair.destination.code)
    .map((p) => ({ p, name: countryName(p.destination.code, LOCALE, p.destination.name) }))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
  const pagePath = germanPath(pair);
  const h1 = t("h1", { country, item: t(`categories.${pair.category}.item`) });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "de",
    ...(pair.lastVerified ? { dateModified: pair.lastVerified } : {}),
    mainEntity: [
      {
        "@type": "Question",
        name: h1,
        acceptedAnswer: {
          "@type": "Answer",
          text: rows
            .map((r) => `${t(`verdict.${r.verdict}`)}. ${translatedCustomsRow(r, LOCALE)?.summary ?? ""}`.trim())
            .join(" "),
        },
      },
    ],
  };

  return (
    <article lang="de" className="mx-auto max-w-3xl space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/de/bring" className="hover:text-slate-900">
          {t("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        <a href={`/de/bring/${pair.itemSlug}`} className="hover:text-slate-900">
          {categoryLabel}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{country}</span>
      </nav>

      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{h1}</h1>
        <section className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm" data-testid="de-short-answer">
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {rows.length === 1 ? t("shortAnswer") : t("atAGlance")}
          </h2>
          <ul className="mt-2 space-y-2">
            {rows.map((r) => (
              <li key={r.slug}>
                {rows.length > 1 && <span className="font-medium text-slate-900">{rowHeading(r.slug)}: </span>}
                <span className="font-medium text-slate-900">{t(`verdict.${r.verdict}`)}</span>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{translatedCustomsRow(r, LOCALE)?.summary}</p>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-950 ring-1 ring-blue-200" data-testid="de-translation-notice">
          {t("translatedNotice")}{" "}
          <a href={englishPath(pair)} hrefLang="en" lang="en" className="font-medium underline">
            {t("englishVersion")}
          </a>
          {" · "}
          <a href={translationProblemHref({ path: pagePath, englishPath: englishPath(pair), locale: LOCALE })} className="underline">
            {t("reportTranslation")}
          </a>
        </p>
      </header>

      <h2 className="text-lg font-semibold text-slate-900">{t("rulesHeading")}</h2>
      <ul className="space-y-4">
        {rows.map((r) => (
          <GermanCustomsRowCard key={r.slug} row={r} heading={rowHeading(r.slug)} country={country} />
        ))}
      </ul>

      <p className="text-sm">
        <a href="/trip-check" className="font-medium text-blue-700 underline">
          {t("checkYourTrip")}
        </a>
        {germanDestination(pair.destinationSlug) && (
          <>
            <span className="mx-2 text-slate-300" aria-hidden="true">
              |
            </span>
            <a href={`/de/destinations/${pair.destinationSlug}`} className="text-blue-700 underline" data-testid="de-destination-link">
              {t("destinations.allRulesFor", { country })}
            </a>
          </>
        )}
      </p>

      {elsewhere.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="de-same-item-elsewhere">
          <h2 className="text-base font-semibold text-slate-900">{t("sameItemElsewhere", { label: categoryLabel })}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {elsewhere.map(({ p, name }) => (
              <li key={p.destination.code}>
                <a
                  href={germanPath(p)}
                  className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>
    </article>
  );
}
