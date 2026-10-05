import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BRING_CATEGORIES } from "../../../../lib/bring-categories";
import { bringPair, bringPairs, bringPairsForDestination, rowLabel } from "../../../../lib/bring-pages";
import { SITE_URL } from "../../../../lib/site";
import CustomsRowCard from "../../../../components/CustomsRowCard";
import { productsForDestination } from "../../../../lib/medication-products";
import { destinationPath } from "../../../../lib/destinations";

interface Params {
  item: string;
  destination: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return bringPairs.map((p) => ({ item: p.itemSlug, destination: p.destinationSlug }));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { item, destination } = await params;
  const pair = bringPair(item, destination);
  if (!pair) return {};
  const t = await getTranslations("bringDestinationPage");
  const tv = await getTranslations("destinationPage.verdict");
  const meta = BRING_CATEGORIES[pair.category];
  const answer =
    pair.rows.length === 1
      ? `${capitalize(tv(pair.rows[0]!.verdict))}.`
      : t("answerMultiple").replace(/:$/, ".");
  const title = t("metaTitle", { item: meta.searchLabel, destination: pair.destination.name });
  const description = t("metaDescription", {
    item: meta.searchLabel,
    destination: pair.destination.name,
    answer,
    date: pair.lastVerified ?? "",
  });
  return {
    title,
    description,
    alternates: { canonical: `/bring/${pair.itemSlug}/${pair.destinationSlug}` },
    openGraph: { title, description, images: ["/opengraph-image"] },
  };
}

export default async function BringDestinationPage({ params }: { params: Promise<Params> }) {
  const { item, destination } = await params;
  const pair = bringPair(item, destination);
  if (!pair) notFound();

  const t = await getTranslations("bringDestinationPage");
  const tv = await getTranslations("destinationPage.verdict");
  const tc = await getTranslations("common");
  const meta = BRING_CATEGORIES[pair.category];
  const destName = pair.destination.name;
  const siblings = bringPairsForDestination(pair.destination.code).filter(
    (p) => p.category !== pair.category,
  );

  const headline =
    pair.rows.length === 1
      ? capitalize(tv(pair.rows[0]!.verdict))
      : pair.rows.map((r) => `${rowLabel(r.slug, pair.destination.code)}: ${tv(r.verdict)}`).join(" · ");
  const faqAnswer = pair.rows
    .map((r) => [tv(r.verdict), r.limits?.description, r.notes].filter(Boolean).join(" "))
    .join(" ");

  const pageUrl = `${SITE_URL}/bring/${pair.itemSlug}/${pair.destinationSlug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("breadcrumbRoot"), item: `${SITE_URL}/bring` },
        { "@type": "ListItem", position: 2, name: meta.label, item: `${SITE_URL}/bring/${pair.itemSlug}` },
        { "@type": "ListItem", position: 3, name: destName, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: t("h1", { item: meta.searchLabel, destination: destName }),
          acceptedAnswer: { "@type": "Answer", text: faqAnswer },
        },
      ],
    },
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/bring" className="hover:text-slate-900">
          {t("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        <a href={`/bring/${pair.itemSlug}`} className="hover:text-slate-900">
          {meta.label}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{destName}</span>
      </nav>

      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          {t("h1", { item: meta.searchLabel, destination: destName })}
        </h1>
        <p className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t("shortAnswer")}
          </span>
          <br />
          <span className="font-medium text-slate-900">{headline}</span>
        </p>
      </header>

      <ul className="space-y-4">
        {pair.rows.map((r) => (
          <CustomsRowCard key={r.slug} row={r} destinationCode={pair.destination.code} />
        ))}
      </ul>

      <p className="text-sm">
        <a href="/trip-check" className="font-medium text-blue-700 underline">
          {t("checkYourTripCta")}
        </a>
        <span className="mx-2 text-slate-300" aria-hidden="true">
          |
        </span>
        <a href={`/bring/${pair.itemSlug}`} className="text-blue-700 underline">
          {t("compareEverywhere", { item: meta.searchLabel })}
        </a>
        <span className="mx-2 text-slate-300" aria-hidden="true">
          |
        </span>
        <a href={destinationPath(pair.destination)} className="text-blue-700 underline">
          {t("fullGuide", { destination: destName })}
        </a>
      </p>

      {pair.category === "medication" && productsForDestination(pair.destination.code).length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            {t("namedMedicines", { destination: destName })}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {productsForDestination(pair.destination.code).map((p) => (
              <li key={p.slug}>
                <a
                  href={`/medications/${p.slug}/${pair.destinationSlug}`}
                  className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            {t("moreForDestination", { destination: destName })}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <li key={s.category}>
                <a
                  href={`/bring/${s.itemSlug}/${s.destinationSlug}`}
                  className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {BRING_CATEGORIES[s.category].label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        {t("disclaimer")}{" "}
        <a href="/changelog#dataset-customs-items" className="underline">
          {tc("updateHistory")}
        </a>
      </p>
    </article>
  );
}
