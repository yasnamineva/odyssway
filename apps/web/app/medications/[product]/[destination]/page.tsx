import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "../../../../components/BreadcrumbJsonLd";
import CustomsRowCard, { VERDICT_STYLES } from "../../../../components/CustomsRowCard";
import { BRING_CATEGORIES } from "../../../../lib/bring-categories";
import { bringPair } from "../../../../lib/bring-pages";
import {
  hasProductHub,
  latestVerified,
  pairsForProduct,
  productPair,
  productPairs,
  productsForDestination,
} from "../../../../lib/medication-products";
import { rowLabel } from "../../../../lib/bring-pages";

interface Params {
  product: string;
  destination: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return productPairs.map((p) => ({ product: p.product.slug, destination: p.destinationSlug }));
}

async function shortAnswer(pair: NonNullable<ReturnType<typeof productPair>>): Promise<string> {
  const tv = await getTranslations("destinationPage.verdict");
  const answer =
    pair.rows.length === 1
      ? tv(pair.rows[0]!.verdict)
      : pair.rows.map((r) => `${rowLabel(r.slug, pair.destination.code)}: ${tv(r.verdict)}`).join(" · ");
  return answer.charAt(0).toUpperCase() + answer.slice(1);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { product, destination } = await params;
  const pair = productPair(product, destination);
  if (!pair) return {};
  const t = await getTranslations("medicationPair");
  const vars = { product: pair.product.name, destination: pair.destination.name };
  const title = t("metaTitle", vars);
  const description = t("metaDescription", {
    ...vars,
    answer: `${await shortAnswer(pair)}.`,
    date: latestVerified(pair.rows) ?? "",
  });
  return {
    title,
    description,
    alternates: { canonical: `/medications/${pair.product.slug}/${pair.destinationSlug}` },
    openGraph: { title, description, images: ["/opengraph-image"] },
  };
}

export default async function MedicationPairPage({ params }: { params: Promise<Params> }) {
  const { product, destination } = await params;
  const pair = productPair(product, destination);
  if (!pair) notFound();
  const t = await getTranslations("medicationPair");
  const tp = await getTranslations("medicationProduct");
  const tb = await getTranslations("bringDestinationPage");
  const tv = await getTranslations("destinationPage.verdict");
  const tc = await getTranslations("common");
  const vars = { product: pair.product.name, destination: pair.destination.name };
  const answer = await shortAnswer(pair);
  const others = pairsForProduct(pair.product.slug).filter((p) => p.destination.code !== pair.destination.code);
  const sameDestination = productsForDestination(pair.destination.code).filter((p) => p.slug !== pair.product.slug);
  const medicationHub = bringPair(BRING_CATEGORIES.medication.slug, pair.destinationSlug);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("h1", vars),
        acceptedAnswer: {
          "@type": "Answer",
          text: pair.rows
            .map((r) => [tv(r.verdict), r.limits?.description, r.notes].filter(Boolean).join(" "))
            .join(" "),
        },
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <BreadcrumbJsonLd
        trail={[
          { name: tp("breadcrumbRoot"), path: "/medications" },
          ...(hasProductHub(pair.product.slug)
            ? [{ name: pair.product.name, path: `/medications/${pair.product.slug}` }]
            : []),
          { name: pair.destination.name, path: `/medications/${pair.product.slug}/${pair.destinationSlug}` },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/medications" className="hover:text-slate-900">
          {tp("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        {hasProductHub(pair.product.slug) ? (
          <a href={`/medications/${pair.product.slug}`} className="hover:text-slate-900">
            {pair.product.name}
          </a>
        ) : (
          <span>{pair.product.name}</span>
        )}
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{pair.destination.name}</span>
      </nav>

      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("h1", vars)}</h1>
        <p className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{tb("shortAnswer")}</span>
          <br />
          <span className="font-medium text-slate-900">{answer}</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("ruleScope", vars)}</p>
      </header>

      <ul className="space-y-4">
        {pair.rows.map((r) => (
          <CustomsRowCard key={r.slug} row={r} destinationCode={pair.destination.code} />
        ))}
      </ul>

      <p className="text-sm">
        <a href="/trip-check" className="font-medium text-blue-700 underline">
          {tb("checkYourTripCta")}
        </a>
        {medicationHub ? (
          <>
            <span className="mx-2 text-slate-300" aria-hidden="true">
              |
            </span>
            <a href={`/bring/${medicationHub.itemSlug}/${medicationHub.destinationSlug}`} className="text-blue-700 underline">
              {t("medicationGuide", vars)}
            </a>
          </>
        ) : null}
      </p>

      {others.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-900">{t("otherCountries", vars)}</h2>
          <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm">
            {others.map((o) => (
              <li key={o.destination.code} className="flex items-center justify-between gap-3 py-2">
                <a
                  href={`/medications/${o.product.slug}/${o.destinationSlug}`}
                  className="text-slate-900 underline decoration-slate-300 underline-offset-2"
                >
                  {o.destination.name}
                </a>
                <span className="flex flex-wrap justify-end gap-1">
                  {o.rows.map((r) => (
                    <span
                      key={r.slug}
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${VERDICT_STYLES[r.verdict] ?? VERDICT_STYLES.depends}`}
                    >
                      {tv(r.verdict)}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <a href={`/medications/${pair.product.slug}`} className="text-blue-700 underline">
              {t("allCountries", vars)}
            </a>
          </p>
        </section>
      )}

      {sameDestination.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-900">{tp("otherMedicines")}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {sameDestination.map((p) => (
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

      <p className="text-xs leading-relaxed text-slate-500">
        {tb("disclaimer")} {tc("medicalDisclaimer")}{" "}
        <a href="/changelog#dataset-customs-items" className="underline">
          {tc("updateHistory")}
        </a>
      </p>
    </article>
  );
}
