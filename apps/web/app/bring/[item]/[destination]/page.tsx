import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { checkedYear, clip, describeRule, rowLead, seoVerdictKey, titleWithAnswer } from "../../../../lib/seo-text";
import { notFound } from "next/navigation";
import { BRING_CATEGORIES } from "../../../../lib/bring-categories";
import { bringPair, bringPairs, bringPairsForDestination, rowLabel } from "../../../../lib/bring-pages";
import { SITE_URL } from "../../../../lib/site";
import CustomsRowCard from "../../../../components/CustomsRowCard";
import { productsForDestination } from "../../../../lib/medication-products";
import { destinationPath, withArticle } from "../../../../lib/destinations";

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
  const ts = await getTranslations("seo");
  const tv = await getTranslations("destinationPage.verdict");
  const meta = BRING_CATEGORIES[pair.category];
  const single = pair.rows.length === 1 ? pair.rows[0]! : undefined;
  const title = titleWithAnswer(
    t("metaTitle", { item: meta.searchLabel, destination: withArticle(pair.destination.name) }),
    single ? ts(`verdict.${seoVerdictKey(single)}`) : undefined,
    checkedYear(pair.rows),
  );
  const lead = single
    ? (rowLead(single) ?? tv(single.verdict))
    : pair.rows.map((r) => `${rowLabel(r.slug, pair.destination.code)}: ${tv(r.verdict)}`).join("; ") + ".";
  const description = describeRule(lead, ts("tail", { date: pair.lastVerified ?? "" }));
  return {
    title,
    description,
    alternates: { canonical: `/bring/${pair.itemSlug}/${pair.destinationSlug}` },
    openGraph: { title, description },
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
      ...(pair.lastVerified ? { dateModified: pair.lastVerified } : {}),
      mainEntity:
        pair.rows.length === 1
          ? [
              {
                "@type": "Question",
                name: t("h1", { item: meta.searchLabel, destination: withArticle(destName) }),
                acceptedAnswer: { "@type": "Answer", text: faqAnswer },
              },
            ]
          : pair.rows.map((r) => ({
              "@type": "Question",
              name: t("rowQuestion", {
                item: rowLabel(r.slug, pair.destination.code).toLowerCase(),
                destination: withArticle(destName),
              }),
              acceptedAnswer: {
                "@type": "Answer",
                text: [capitalize(tv(r.verdict)) + ".", rowLead(r)].filter(Boolean).join(" "),
              },
            })),
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
          {t("h1", { item: meta.searchLabel, destination: withArticle(destName) })}
        </h1>
        {pair.rows.length === 1 ? (
          <p className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {t("shortAnswer")}
            </span>
            <br />
            <span className="font-medium text-slate-900">{headline}</span>
          </p>
        ) : (
          <section
            className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
            data-testid="at-a-glance"
          >
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{t("atAGlance")}</h2>
            <ul className="mt-2 divide-y divide-slate-100">
              {pair.rows.map((r) => (
                <li key={r.slug} className="py-2">
                  <a href={`#${r.slug}`} className="font-medium text-slate-900 underline-offset-2 hover:underline">
                    {rowLabel(r.slug, pair.destination.code)}
                  </a>
                  <span className="text-slate-500"> — </span>
                  <span className="font-medium text-slate-800">{tv(r.verdict)}</span>
                  {rowLead(r) && <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{clip(rowLead(r)!, 200)}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {pair.rows.some((r) => r.procedure) && (
          <section className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-200" data-testid="before-you-go">
            <h2 className="text-xs font-semibold tracking-wide uppercase">{t("beforeYouGo")}</h2>
            <ul className="mt-2 space-y-1.5">
              {pair.rows
                .filter((r) => r.procedure)
                .map((r) => (
                  <li key={r.slug}>
                    <span className="font-semibold">{rowLabel(r.slug, pair.destination.code)}: </span>
                    <a href={`#${r.slug}`} className="underline underline-offset-2">
                      {r.procedure!.title}
                    </a>
                    {r.procedure!.optional && <span className="text-amber-800"> ({t("beforeYouGoOptional")})</span>}
                    {r.procedure!.leadTime && <span className="text-amber-900">: {r.procedure!.leadTime}</span>}
                  </li>
                ))}
            </ul>
          </section>
        )}
        {pair.category === "medication" && productsForDestination(pair.destination.code).length > 0 && (
          <nav className="mt-3" aria-label={t("namedMedicines", { destination: withArticle(destName) })}>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {t("namedMedicines", { destination: withArticle(destName) })}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {productsForDestination(pair.destination.code).map((p) => (
                <li key={p.slug}>
                  <a
                    href={`/medications/${p.slug}/${pair.destinationSlug}`}
                    className="inline-block rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
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


      {siblings.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            {t("moreForDestination", { destination: withArticle(destName) })}
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
