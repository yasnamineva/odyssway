import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BRING_CATEGORIES } from "../../../../lib/bring-categories";
import { bringPair, bringPairs, bringPairsForDestination, rowLabel } from "../../../../lib/bring-pages";
import { SITE_URL } from "../../../../lib/site";

interface Params {
  item: string;
  destination: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return bringPairs.map((p) => ({ item: p.itemSlug, destination: p.destinationSlug }));
}

const VERDICT_STYLES: Record<string, string> = {
  prohibited: "bg-red-50 text-red-700 ring-red-200",
  allowed_with_limits: "bg-amber-50 text-amber-800 ring-amber-200",
  allowed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  declaration_required: "bg-blue-50 text-blue-700 ring-blue-200",
  depends: "bg-slate-100 text-slate-700 ring-slate-200",
};

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
          <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            {t("shortAnswer")}
          </span>
          <br />
          <span className="font-medium text-slate-900">{headline}</span>
        </p>
      </header>

      <ul className="space-y-4">
        {pair.rows.map((r) => (
          <li key={r.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-base font-bold text-slate-900">
                {rowLabel(r.slug, pair.destination.code)}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${VERDICT_STYLES[r.verdict] ?? VERDICT_STYLES.depends}`}
              >
                {tv(r.verdict)}
              </span>
            </div>
            {r.limits?.description && (
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{r.limits.description}</p>
            )}
            {r.notes && <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.notes}</p>}
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              <span className="font-semibold">{t("alsoCovers")}</span> {r.names.slice(0, 14).join(", ")}
            </p>
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
              {t("verifiedLine", { date: r.verified_at ?? "" })}{" "}
              <span className="font-medium text-slate-500">{t("sourceLine")}</span>{" "}
              <a href={r.legal_source.url} rel="noopener noreferrer" className="underline">
                {r.legal_source.name}
              </a>
            </p>
          </li>
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
        <a href={`/destinations/${pair.destination.code.toLowerCase()}`} className="text-blue-700 underline">
          {t("fullGuide", { destination: destName })}
        </a>
      </p>

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
